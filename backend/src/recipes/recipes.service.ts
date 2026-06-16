import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { Category } from '../catalog/schemas/category.schema';
import { Food } from '../catalog/schemas/food.schema';
import { Family } from '../families/schemas/family.schema';
import { resolveActiveFamilyId } from '../families/family-access.util';
import { MissingIngredientsService } from '../meals/missing-ingredients.service';
import { GenerateShoppingListDto } from '../meals/dto/generate-shopping-list.dto';
import { ShoppingListGenerationService } from '../meals/shopping-list-generation.service';
import { PantryItem } from '../pantry/schemas/pantry-item.schema';
import { getExpiryStatus, getStartOfDay } from '../pantry/utils/expiry-status.util';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { ListRecipesQueryDto } from './dto/list-recipes-query.dto';
import { RecipeIngredientDto } from './dto/recipe-ingredient.dto';
import { RecipeSuggestionsQueryDto } from './dto/recipe-suggestions-query.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeFavorite } from './schemas/recipe-favorite.schema';
import { Recipe, RecipeDocument, RecipeIngredient } from './schemas/recipe.schema';

const SUGGESTION_RECIPE_SCAN_LIMIT = 500;
const EXPIRING_SCORE_WEIGHT = 0.5;

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private readonly recipeModel: Model<Recipe>,
    @InjectModel(RecipeFavorite.name)
    private readonly recipeFavoriteModel: Model<RecipeFavorite>,
    @InjectModel(Food.name) private readonly foodModel: Model<Food>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Family.name) private readonly familyModel: Model<Family>,
    @InjectModel(PantryItem.name)
    private readonly pantryItemModel: Model<PantryItem>,
    private readonly missingIngredientsService: MissingIngredientsService,
    private readonly shoppingListGenerationService: ShoppingListGenerationService,
  ) {}

  async findAll(user: AuthenticatedUser, query: ListRecipesQueryDto) {
    const filter = this.buildRecipeFilter(query);
    const recipes = await this.recipeModel
      .find(filter)
      .sort(this.buildRecipeSort(query))
      .limit(query.limit ?? 30)
      .exec();

    const favoriteRecipeIds = await this.getFavoriteRecipeIdSet(
      user,
      recipes.map((recipe) => recipe._id),
    );

    return recipes.map((recipe) => ({
      ...this.toRecipeSummary(recipe),
      isFavorite: favoriteRecipeIds.has(recipe._id.toString()),
    }));
  }

  async findOne(user: AuthenticatedUser, recipeId: string) {
    const recipe = await this.recipeModel.findById(recipeId).exec();

    if (!recipe || recipe.status === 'archived') {
      throw new NotFoundException('Recipe not found');
    }

    const favorite = await this.recipeFavoriteModel
      .exists({
        userId: new Types.ObjectId(user.userId),
        recipeId: recipe._id,
      })
      .exec();

    return {
      ...this.toRecipeDetail(recipe),
      isFavorite: Boolean(favorite),
    };
  }

  async getSuggestions(
    user: AuthenticatedUser,
    query: RecipeSuggestionsQueryDto,
  ) {
    const familyId = await this.getActiveFamilyId(user);
    const startOfToday = getStartOfDay();
    const pantryItems = await this.pantryItemModel
      .find({
        familyId,
        status: 'active',
        quantity: { $gt: 0 },
        expiryDate: { $gte: startOfToday },
      })
      .lean()
      .exec();

    const filter: Record<string, any> = { status: 'approved' };
    if (query.q) {
      const words = query.q.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        filter.$and = words.map((word) => ({
          name: { $regex: new RegExp(this.escapeRegExp(word), 'i') },
        }));
      }
    }

    const recipes = await this.recipeModel
      .find(filter)
      .limit(SUGGESTION_RECIPE_SCAN_LIMIT)
      .exec();

    const limit = query.limit ?? 10;
    const minMatch = query.minMatch ?? 0;
    const prioritizeExpiring = query.prioritizeExpiring ?? false;

    const suggestions = recipes
      .map((recipe) => this.buildSuggestion(recipe, pantryItems))
      .filter(
        (suggestion) =>
          suggestion.totalCount > 0 && suggestion.matchRatio >= minMatch,
      )
      .sort(
        (a, b) =>
          this.getSuggestionScore(b, prioritizeExpiring) -
            this.getSuggestionScore(a, prioritizeExpiring) ||
          b.availableCount - a.availableCount,
      )
      .slice(0, limit);

    return suggestions;
  }

  async addFavorite(user: AuthenticatedUser, recipeId: string) {
    const recipe = await this.getVisibleRecipe(recipeId);
    const result = await this.recipeFavoriteModel
      .updateOne(
        {
          userId: new Types.ObjectId(user.userId),
          recipeId: recipe._id,
        },
        {
          $setOnInsert: {
            userId: new Types.ObjectId(user.userId),
            recipeId: recipe._id,
          },
        },
        { upsert: true },
      )
      .exec();

    if (result.upsertedCount > 0) {
      recipe.favoritesCount += 1;
      await this.recipeModel
        .updateOne({ _id: recipe._id }, { $inc: { favoritesCount: 1 } })
        .exec();
    }

    return {
      recipeId: recipe._id.toString(),
      isFavorite: true,
      favoritesCount: recipe.favoritesCount,
    };
  }

  async removeFavorite(user: AuthenticatedUser, recipeId: string) {
    const recipe = await this.getVisibleRecipe(recipeId);
    const result = await this.recipeFavoriteModel
      .deleteOne({
        userId: new Types.ObjectId(user.userId),
        recipeId: recipe._id,
      })
      .exec();

    if (result.deletedCount > 0 && recipe.favoritesCount > 0) {
      recipe.favoritesCount -= 1;
      await this.recipeModel
        .updateOne(
          { _id: recipe._id, favoritesCount: { $gt: 0 } },
          { $inc: { favoritesCount: -1 } },
        )
        .exec();
    }

    return {
      recipeId: recipe._id.toString(),
      isFavorite: false,
      favoritesCount: recipe.favoritesCount,
    };
  }

  async findFavorites(user: AuthenticatedUser) {
    const favorites = await this.recipeFavoriteModel
      .find({ userId: new Types.ObjectId(user.userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const recipes = await this.recipeModel
      .find({
        _id: { $in: favorites.map((favorite) => favorite.recipeId) },
        status: { $ne: 'archived' },
      })
      .exec();
    const recipesById = new Map(
      recipes.map((recipe) => [recipe._id.toString(), recipe]),
    );

    return favorites
      .map((favorite) => recipesById.get(favorite.recipeId.toString()))
      .filter((recipe): recipe is RecipeDocument => Boolean(recipe))
      .map((recipe) => ({
        ...this.toRecipeSummary(recipe),
        isFavorite: true,
      }));
  }

  async create(user: AuthenticatedUser, dto: CreateRecipeDto) {
    const ingredients = await this.buildIngredients(dto.ingredients);
    const recipe = await this.recipeModel.create({
      name: dto.name,
      normalizedName: this.normalizeName(dto.name),
      description: dto.description,
      imageUrl: dto.imageUrl,
      cookTimeMinutes: dto.cookTimeMinutes,
      difficulty: dto.difficulty ?? 'easy',
      servings: dto.servings ?? 1,
      ingredients,
      steps: dto.steps,
      nutrition: dto.nutrition ?? {},
      tags: dto.tags ?? [],
      authorId: new Types.ObjectId(user.userId),
      status: dto.status ?? (user.role === 'admin' ? 'approved' : 'pending'),
    });

    return this.toRecipeDetail(recipe);
  }

  async update(user: AuthenticatedUser, recipeId: string, dto: UpdateRecipeDto) {
    const recipe = await this.recipeModel.findById(recipeId).exec();

    if (!recipe || recipe.status === 'archived') {
      throw new NotFoundException('Recipe not found');
    }

    if (user.role !== 'admin' && recipe.authorId?.toString() !== user.userId) {
      throw new ForbiddenException('Cannot update this recipe');
    }

    if (dto.name !== undefined) {
      recipe.name = dto.name;
      recipe.normalizedName = this.normalizeName(dto.name);
    }
    if (dto.description !== undefined) recipe.description = dto.description;
    if (dto.imageUrl !== undefined) recipe.imageUrl = dto.imageUrl;
    if (dto.cookTimeMinutes !== undefined) {
      recipe.cookTimeMinutes = dto.cookTimeMinutes;
    }
    if (dto.difficulty !== undefined) recipe.difficulty = dto.difficulty;
    if (dto.servings !== undefined) recipe.servings = dto.servings;
    if (dto.ingredients !== undefined) {
      recipe.ingredients = (await this.buildIngredients(
        dto.ingredients,
      )) as RecipeIngredient[];
    }
    if (dto.steps !== undefined) recipe.steps = dto.steps;
    if (dto.nutrition !== undefined) recipe.nutrition = dto.nutrition;
    if (dto.tags !== undefined) recipe.tags = dto.tags;
    if (dto.status !== undefined) {
      if (user.role !== 'admin') {
        throw new ForbiddenException('Only admin can update recipe status');
      }
      recipe.status = dto.status;
    }

    await recipe.save();
    return this.toRecipeDetail(recipe);
  }

  async remove(user: AuthenticatedUser, recipeId: string) {
    const recipe = await this.recipeModel.findById(recipeId).exec();

    if (!recipe || recipe.status === 'archived') {
      throw new NotFoundException('Recipe not found');
    }

    if (user.role !== 'admin' && recipe.authorId?.toString() !== user.userId) {
      throw new ForbiddenException('Cannot delete this recipe');
    }

    recipe.status = 'archived';
    await recipe.save();

    return { success: true };
  }

  async getMissingIngredients(
    user: AuthenticatedUser,
    recipeId: string,
    servings?: number,
  ) {
    return this.missingIngredientsService.getRecipeMissingIngredients(
      user,
      recipeId,
      servings,
    );
  }

  async generateShoppingList(
    user: AuthenticatedUser,
    recipeId: string,
    dto: GenerateShoppingListDto,
  ) {
    return this.shoppingListGenerationService.generateFromRecipe(
      user,
      recipeId,
      dto,
    );
  }

  private buildSuggestion(
    recipe: RecipeDocument,
    pantryItems: Array<{
      foodId?: Types.ObjectId;
      name: string;
      quantity: number;
      unit: string;
      expiryDate: Date;
    }>,
  ) {
    const requiredIngredients = recipe.ingredients.filter(
      (ingredient) => !ingredient.optional,
    );
    const missingIngredients: string[] = [];
    let availableCount = 0;
    let expiringMatchedCount = 0;

    for (const ingredient of requiredIngredients) {
      const matchingItems = this.missingIngredientsService.findMatchingPantryItems(
        pantryItems,
        {
          foodId: ingredient.foodId?.toString(),
          name: ingredient.name,
          unit: ingredient.unit,
        },
      );
      const availableQuantity = matchingItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      if (availableQuantity >= ingredient.quantity) {
        availableCount += 1;
        if (
          matchingItems.some(
            (item) => getExpiryStatus(item.expiryDate) === 'expiring',
          )
        ) {
          expiringMatchedCount += 1;
        }
      } else {
        missingIngredients.push(ingredient.name);
      }
    }

    const totalCount = requiredIngredients.length;
    const matchRatio =
      totalCount > 0 ? Number((availableCount / totalCount).toFixed(3)) : 0;

    return {
      recipe: this.toRecipeSummary(recipe),
      availableCount,
      totalCount,
      matchRatio,
      expiringMatchedCount,
      missingIngredients,
    };
  }

  private getSuggestionScore(
    suggestion: { matchRatio: number; expiringMatchedCount: number; totalCount: number },
    prioritizeExpiring: boolean,
  ) {
    if (!prioritizeExpiring || suggestion.totalCount === 0) {
      return suggestion.matchRatio;
    }

    return (
      suggestion.matchRatio +
      (suggestion.expiringMatchedCount / suggestion.totalCount) *
        EXPIRING_SCORE_WEIGHT
    );
  }

  private async getVisibleRecipe(recipeId: string) {
    const recipe = await this.recipeModel.findById(recipeId).exec();

    if (!recipe || recipe.status === 'archived') {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  private async getFavoriteRecipeIdSet(
    user: AuthenticatedUser,
    recipeIds: Types.ObjectId[],
  ) {
    if (!recipeIds.length) {
      return new Set<string>();
    }

    const favorites = await this.recipeFavoriteModel
      .find({
        userId: new Types.ObjectId(user.userId),
        recipeId: { $in: recipeIds },
      })
      .select('recipeId')
      .lean()
      .exec();

    return new Set(favorites.map((favorite) => favorite.recipeId.toString()));
  }

  private buildRecipeSort(
    query: ListRecipesQueryDto,
  ): Record<string, 1 | -1> {
    if (query.sort === 'popular') {
      return { favoritesCount: -1, createdAt: -1 };
    }

    return { createdAt: -1 };
  }

  private getActiveFamilyId(user: AuthenticatedUser) {
    return resolveActiveFamilyId(this.familyModel, user);
  }

  private buildRecipeFilter(query: ListRecipesQueryDto) {
    const filter: Record<string, any> = {};

    if (query.authorId) {
      filter.authorId = new Types.ObjectId(query.authorId);
      filter.status = query.status ?? { $ne: 'archived' };
    } else {
      filter.status = query.status ?? 'approved';
    }

    if (query.q) {
      const words = query.q.trim().split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        filter.$and = words.map((word) => ({
          name: { $regex: new RegExp(this.escapeRegExp(word), 'i') },
        }));
      }
    }
    if (query.ingredient) {
      filter['ingredients.name'] = {
        $regex: query.ingredient.trim(),
        $options: 'i',
      };
    }
    if (query.categoryId) {
      filter['ingredients.categoryId'] = new Types.ObjectId(query.categoryId);
    }
    if (query.difficulty) {
      filter.difficulty = query.difficulty;
    }
    if (query.maxCookTime) {
      filter.cookTimeMinutes = { $lte: query.maxCookTime };
    }

    return filter;
  }

  private async buildIngredients(ingredients: RecipeIngredientDto[]) {
    return Promise.all(
      ingredients.map(async (ingredient) => {
        if (ingredient.foodId) {
          const food = await this.getFood(ingredient.foodId);
          return {
            foodId: food._id,
            name: food.name,
            categoryId: ingredient.categoryId
              ? new Types.ObjectId(ingredient.categoryId)
              : food.categoryId,
            quantity: ingredient.quantity,
            unit: ingredient.unit ?? food.defaultUnit,
            optional: ingredient.optional ?? false,
          };
        }

        if (ingredient.categoryId) {
          await this.assertCategoryExists(ingredient.categoryId);
        }

        return {
          name: ingredient.name!,
          categoryId: ingredient.categoryId
            ? new Types.ObjectId(ingredient.categoryId)
            : undefined,
          quantity: ingredient.quantity,
          unit: ingredient.unit!,
          optional: ingredient.optional ?? false,
        };
      }),
    );
  }

  private async getFood(foodId: string) {
    const food = await this.foodModel
      .findOne({ _id: foodId, status: 'active' })
      .exec();

    if (!food) {
      throw new NotFoundException('Food catalog item not found');
    }

    return food;
  }

  private async assertCategoryExists(categoryId: string) {
    const exists = await this.categoryModel
      .exists({ _id: categoryId, status: 'active' })
      .exec();

    if (!exists) {
      throw new NotFoundException('Category not found');
    }
  }

  private normalizeName(name: string) {
    return name.trim().toLowerCase();
  }

  private escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private toRecipeSummary(recipe: RecipeDocument | Recipe) {
    return {
      id: recipe._id.toString(),
      name: recipe.name,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      cookTimeMinutes: recipe.cookTimeMinutes,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      status: recipe.status,
      tags: recipe.tags,
      ingredientCount: recipe.ingredients.length,
      favoritesCount: recipe.favoritesCount ?? 0,
    };
  }

  private toRecipeDetail(recipe: RecipeDocument | Recipe) {
    return {
      ...this.toRecipeSummary(recipe),
      authorId: recipe.authorId?.toString(),
      ingredients: recipe.ingredients.map((ingredient) => ({
        foodId: ingredient.foodId?.toString(),
        categoryId: ingredient.categoryId?.toString(),
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        optional: ingredient.optional,
      })),
      steps: recipe.steps,
      nutrition: recipe.nutrition,
    };
  }
}
