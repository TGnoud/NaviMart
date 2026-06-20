import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { Family } from '../families/schemas/family.schema';
import { resolveActiveFamilyId } from '../families/family-access.util';
import { Recipe, RecipeDocument } from '../recipes/schemas/recipe.schema';
import {
  ShoppingList,
  ShoppingListDocument,
  ShoppingListItem,
} from '../shopping-lists/schemas/shopping-list.schema';
import { toShoppingListResponse } from '../shopping-lists/shopping-list.mapper';
import { GenerateShoppingListDto } from './dto/generate-shopping-list.dto';
import { MissingIngredientsService } from './missing-ingredients.service';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class ShoppingListGenerationService {
  constructor(
    @InjectModel(Family.name) private readonly familyModel: Model<Family>,
    @InjectModel(Recipe.name) private readonly recipeModel: Model<Recipe>,
    @InjectModel(ShoppingList.name)
    private readonly shoppingListModel: Model<ShoppingList>,
    private readonly missingIngredientsService: MissingIngredientsService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async generateFromRecipe(
    user: AuthenticatedUser,
    recipeId: string,
    dto: GenerateShoppingListDto,
  ) {
    const familyId = await this.getActiveFamilyId(user);
    const recipe = await this.findRecipe(recipeId);

    return this.createShoppingListFromRecipe(
      user,
      familyId,
      recipe,
      dto.servings ?? recipe.servings,
      dto,
    );
  }

  async generateFromMeal(
    user: AuthenticatedUser,
    recipeId: string,
    servings: number,
    dto: GenerateShoppingListDto,
  ) {
    const familyId = await this.getActiveFamilyId(user);
    const recipe = await this.findRecipe(recipeId);

    return this.createShoppingListFromRecipe(
      user,
      familyId,
      recipe,
      servings,
      dto,
    );
  }

  // Create a shopping list from an explicit set of shortage lines (e.g. the
  // amounts that couldn't be covered by the pantry when a meal was completed).
  // Returns null when there is nothing missing.
  async createFromMissingItems(
    user: AuthenticatedUser,
    familyId: Types.ObjectId,
    recipeName: string,
    items: Array<{
      foodId?: Types.ObjectId;
      categoryId?: Types.ObjectId;
      name: string;
      quantity: number;
      unit: string;
    }>,
    plannedFor?: Date,
  ) {
    if (items.length === 0) {
      return null;
    }

    const list = await this.shoppingListModel.create({
      familyId,
      name: `Còn thiếu cho ${recipeName}`,
      type: 'custom',
      plannedFor,
      createdBy: new Types.ObjectId(user.userId),
      items: items.map((item) => ({
        foodId: item.foodId,
        categoryId: item.categoryId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        note: `Thiếu khi nấu: ${recipeName}`,
      })) as ShoppingListItem[],
    });

    const shoppingList = this.toShoppingListResponse(list);
    this.realtimeService.emitToFamily(
      familyId.toString(),
      'shoppingList:updated',
      shoppingList,
    );

    return shoppingList;
  }

  // Archive a shopping list that was auto-created for a meal's shortfall, used
  // when un-completing the meal so the stale list doesn't linger or duplicate.
  // Only touches still-active lists (leaves ones the user already completed).
  async removeGeneratedList(familyId: Types.ObjectId, listId: Types.ObjectId) {
    const list = await this.shoppingListModel
      .findOne({ _id: listId, familyId })
      .exec();

    if (!list || list.status !== 'active') {
      return;
    }

    list.status = 'archived';
    await list.save();
    this.realtimeService.emitToFamily(familyId.toString(), 'shoppingList:removed', {
      id: list._id.toString(),
    });
  }

  private async createShoppingListFromRecipe(
    user: AuthenticatedUser,
    familyId: Types.ObjectId,
    recipe: RecipeDocument,
    servings: number,
    dto: GenerateShoppingListDto,
  ) {
    const missingSummary =
      await this.missingIngredientsService.calculateMissingIngredients(
        familyId,
        recipe,
        servings,
      );

    if (!missingSummary.hasMissingIngredients) {
      throw new BadRequestException('Recipe has no missing ingredients');
    }

    const list = await this.shoppingListModel.create({
      familyId,
      name: dto.name ?? `Nguyên liệu cho ${recipe.name}`,
      type: 'custom',
      plannedFor: dto.plannedFor,
      createdBy: new Types.ObjectId(user.userId),
      items: missingSummary.missingIngredients.map((ingredient) => ({
        foodId: ingredient.foodId
          ? new Types.ObjectId(ingredient.foodId)
          : undefined,
        categoryId: ingredient.categoryId
          ? new Types.ObjectId(ingredient.categoryId)
          : undefined,
        name: ingredient.name,
        quantity: ingredient.missingQuantity,
        unit: ingredient.unit,
        note: `Tạo từ công thức: ${recipe.name}`,
      })) as ShoppingListItem[],
    });

    const shoppingList = this.toShoppingListResponse(list);
    // Generated lists must show up live for other family members too,
    // just like lists created through ShoppingListsService.
    this.realtimeService.emitToFamily(
      familyId.toString(),
      'shoppingList:updated',
      shoppingList,
    );

    return {
      shoppingList,
      missingSummary,
    };
  }

  private async findRecipe(recipeId: string) {
    const recipe = await this.recipeModel
      .findOne({ _id: recipeId, status: { $ne: 'archived' } })
      .exec();

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  private getActiveFamilyId(user: AuthenticatedUser) {
    return resolveActiveFamilyId(this.familyModel, user);
  }

  private toShoppingListResponse(list: ShoppingListDocument | ShoppingList) {
    return toShoppingListResponse(list);
  }
}
