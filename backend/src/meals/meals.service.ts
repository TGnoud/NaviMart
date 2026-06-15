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
import { InventoryEventsService } from '../inventory-events/inventory-events.service';
import { PantryItem } from '../pantry/schemas/pantry-item.schema';
import { Recipe } from '../recipes/schemas/recipe.schema';
import { ShoppingList } from '../shopping-lists/schemas/shopping-list.schema';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { ListMealPlansQueryDto } from './dto/list-meal-plans-query.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { GenerateShoppingListDto } from './dto/generate-shopping-list.dto';
import { MissingIngredientsService } from './missing-ingredients.service';
import { MealPlan, MealPlanDocument } from './schemas/meal-plan.schema';
import { ShoppingListGenerationService } from './shopping-list-generation.service';

interface MealShortage {
  foodId?: Types.ObjectId;
  categoryId?: Types.ObjectId;
  name: string;
  unit: string;
  quantity: number;
}

export interface MealCompletionResult {
  shortages: Array<{ name: string; unit: string; missingQuantity: number }>;
  shoppingListId?: string;
  shoppingListName?: string;
}

@Injectable()
export class MealsService {
  constructor(
    @InjectModel(MealPlan.name) private readonly mealPlanModel: Model<MealPlan>,
    @InjectModel(Family.name) private readonly familyModel: Model<Family>,
    @InjectModel(Recipe.name) private readonly recipeModel: Model<Recipe>,
    @InjectModel(PantryItem.name)
    private readonly pantryItemModel: Model<PantryItem>,
    @InjectModel(ShoppingList.name)
    private readonly shoppingListModel: Model<ShoppingList>,
    private readonly missingIngredientsService: MissingIngredientsService,
    private readonly shoppingListGenerationService: ShoppingListGenerationService,
    private readonly inventoryEventsService: InventoryEventsService,
  ) {}

  async findAll(user: AuthenticatedUser, query: ListMealPlansQueryDto) {
    const familyId = await this.getActiveFamilyId(user);
    const filter: Record<string, unknown> = {
      familyId,
      date: {
        $gte: query.startDate,
        $lte: query.endDate,
      },
    };

    if (query.session) {
      filter.session = query.session;
    }

    const meals = await this.mealPlanModel
      .find(filter)
      .sort({ date: 1, session: 1 })
      .exec();

    // One batched lookup so every meal carries its recipe name (saves the
    // frontend an N+1 round of GET /recipes/:id calls).
    const recipeIds = [
      ...new Set(
        meals
          .filter((meal) => meal.recipeId)
          .map((meal) => meal.recipeId!.toString()),
      ),
    ];
    const recipes = recipeIds.length
      ? await this.recipeModel
          .find({ _id: { $in: recipeIds } })
          .select('name')
          .lean()
          .exec()
      : [];
    const recipeNameById = new Map(
      recipes.map((recipe) => [recipe._id.toString(), recipe.name]),
    );

    // A completed meal whose shortfall shopping list is still active is only
    // "waiting" (yellow) — it turns done (green) once that list is bought.
    const shortageListIds = [
      ...new Set(
        meals
          .filter((meal) => meal.shortageListId)
          .map((meal) => meal.shortageListId!.toString()),
      ),
    ];
    const activeShortageListIds = shortageListIds.length
      ? new Set(
          (
            await this.shoppingListModel
              .find({ _id: { $in: shortageListIds }, status: 'active' })
              .select('_id')
              .lean()
              .exec()
          ).map((list) => list._id.toString()),
        )
      : new Set<string>();

    return meals.map((meal) =>
      this.toMealPlanResponse(
        meal,
        meal.recipeId ? recipeNameById.get(meal.recipeId.toString()) : undefined,
        meal.isCompleted &&
          !!meal.shortageListId &&
          activeShortageListIds.has(meal.shortageListId.toString()),
      ),
    );
  }

  async create(user: AuthenticatedUser, dto: CreateMealPlanDto) {
    const familyId = await this.getActiveFamilyId(user);
    const recipe = dto.recipeId ? await this.getRecipe(dto.recipeId) : undefined;

    const meal = await this.mealPlanModel.create({
      familyId,
      date: dto.date,
      session: dto.session,
      customSessionName: dto.customSessionName,
      recipeId: recipe?._id,
      customName: dto.customName,
      servings: dto.servings ?? recipe?.servings ?? 1,
      isCompleted: dto.isCompleted ?? false,
      note: dto.note,
      createdBy: new Types.ObjectId(user.userId),
    });

    return this.toMealPlanResponse(meal, recipe?.name);
  }

  async findOne(user: AuthenticatedUser, mealId: string) {
    const meal = await this.findMealForUser(user, mealId);
    return this.toMealPlanResponse(
      meal,
      await this.lookupRecipeName(meal),
      await this.isAwaitingIngredients(meal),
    );
  }

  async update(user: AuthenticatedUser, mealId: string, dto: UpdateMealPlanDto) {
    const meal = await this.findMealForUser(user, mealId);
    const recipe = dto.recipeId ? await this.getRecipe(dto.recipeId) : undefined;

    if (dto.date !== undefined) meal.date = dto.date;
    if (dto.session !== undefined) meal.session = dto.session;
    if (dto.customSessionName !== undefined) {
      meal.customSessionName = dto.customSessionName;
    }
    if (dto.recipeId !== undefined) {
      meal.recipeId = recipe?._id;
      if (!dto.servings && recipe) {
        meal.servings = recipe.servings;
      }
    }
    if (dto.customName !== undefined) meal.customName = dto.customName;
    if (dto.servings !== undefined) meal.servings = dto.servings;
    if (dto.isCompleted !== undefined) meal.isCompleted = dto.isCompleted;
    if (dto.note !== undefined) meal.note = dto.note;

    // Completing a meal deducts its ingredients from the pantry; un-completing
    // restores exactly what was deducted. Guarded by `ingredientsConsumed` so
    // re-saving a completed meal never double-deducts.
    let completion: MealCompletionResult | undefined;
    if (meal.isCompleted && !meal.ingredientsConsumed) {
      const result = await this.consumeIngredients(meal, user);
      if (result && result.shortages.length > 0) {
        // Auto-build a shopping list for the amounts the pantry couldn't cover.
        const shoppingList =
          await this.shoppingListGenerationService.createFromMissingItems(
            user,
            meal.familyId,
            result.recipeName,
            result.shortages,
            meal.date,
          );
        meal.shortageListId = shoppingList
          ? new Types.ObjectId(shoppingList.id)
          : undefined;
        completion = {
          shortages: result.shortages.map((shortage) => ({
            name: shortage.name,
            unit: shortage.unit,
            missingQuantity: shortage.quantity,
          })),
          shoppingListId: shoppingList?.id,
          shoppingListName: shoppingList?.name,
        };
      }
    } else if (!meal.isCompleted && meal.ingredientsConsumed) {
      await this.restoreIngredients(meal, user);
    }

    await meal.save();
    return {
      ...this.toMealPlanResponse(
        meal,
        recipe?.name ?? (await this.lookupRecipeName(meal)),
        await this.isAwaitingIngredients(meal),
      ),
      ...(completion ? { completion } : {}),
    };
  }

  // Deduct each non-optional recipe ingredient (scaled to the meal's servings)
  // from matching active pantry items, oldest expiry first. Shortfalls are left
  // un-deducted rather than blocking completion. Records a snapshot for reversal
  // and returns { recipeName, shortages } so the caller can warn + restock.
  private async consumeIngredients(
    meal: MealPlanDocument,
    user: AuthenticatedUser,
  ): Promise<{ recipeName: string; shortages: MealShortage[] } | null> {
    if (!meal.recipeId) return null;

    const recipe = await this.recipeModel.findById(meal.recipeId).exec();
    if (!recipe) return null;

    const scale = meal.servings / (recipe.servings || 1);
    const consumed: MealPlanDocument['consumedItems'] = [];
    const shortages: MealShortage[] = [];

    // Fetch active stock once (oldest expiry first), then deduct in-memory so
    // the same matching rules used for "in stock" availability also drive what
    // gets consumed, and items shared by two ingredients stay in sync.
    const activeItems = await this.pantryItemModel
      .find({ familyId: meal.familyId, status: 'active', quantity: { $gt: 0 } })
      .sort({ expiryDate: 1, createdAt: 1 })
      .exec();

    for (const ingredient of recipe.ingredients) {
      if (ingredient.optional) continue;

      let remaining = Number((ingredient.quantity * scale).toFixed(3));
      if (remaining <= 0) continue;

      const candidates =
        this.missingIngredientsService.findMatchingPantryItems(activeItems, {
          foodId: ingredient.foodId?.toString(),
          name: ingredient.name,
          unit: ingredient.unit,
        });

      for (const item of candidates) {
        if (remaining <= 0) break;

        const take = Math.min(item.quantity, remaining);
        if (take <= 0) continue;

        item.quantity = Number((item.quantity - take).toFixed(3));
        if (item.quantity <= 0) {
          item.quantity = 0;
          item.status = 'used_up';
          item.consumedAt = new Date();
        }
        await item.save();

        consumed.push({
          pantryItemId: item._id,
          foodId: item.foodId,
          categoryId: item.categoryId,
          name: item.name,
          quantity: take,
          unit: item.unit,
          expiryDate: item.expiryDate,
          location: item.location,
        });

        await this.inventoryEventsService.create({
          familyId: item.familyId,
          pantryItemId: item._id,
          foodId: item.foodId,
          categoryId: item.categoryId,
          name: item.name,
          quantityDelta: -take,
          quantityAfter: item.quantity,
          unit: item.unit,
          type: 'consumed',
          source: 'meal',
          createdBy: new Types.ObjectId(user.userId),
          note: `Nấu món: ${recipe.name}`,
        });

        remaining = Number((remaining - take).toFixed(3));
      }

      // Whatever couldn't be covered by the pantry is a shortage to restock.
      if (remaining > 0) {
        shortages.push({
          foodId: ingredient.foodId,
          categoryId: ingredient.categoryId,
          name: ingredient.name,
          unit: ingredient.unit,
          quantity: remaining,
        });
      }
    }

    meal.consumedItems = consumed;
    meal.ingredientsConsumed = true;

    return { recipeName: recipe.name, shortages };
  }

  // Reverse a previous consumption: top up the original pantry items (recreating
  // any that were used up and removed) and clear the snapshot.
  private async restoreIngredients(
    meal: MealPlanDocument,
    user: AuthenticatedUser,
  ) {
    for (const entry of meal.consumedItems ?? []) {
      const existing = entry.pantryItemId
        ? await this.pantryItemModel.findById(entry.pantryItemId).exec()
        : null;

      if (existing) {
        existing.quantity = Number(
          (existing.quantity + entry.quantity).toFixed(3),
        );
        if (existing.status === 'used_up' && existing.quantity > 0) {
          existing.status = 'active';
          existing.consumedAt = undefined;
        }
        await existing.save();

        await this.inventoryEventsService.create({
          familyId: existing.familyId,
          pantryItemId: existing._id,
          foodId: existing.foodId,
          categoryId: existing.categoryId,
          name: existing.name,
          quantityDelta: entry.quantity,
          quantityAfter: existing.quantity,
          unit: existing.unit,
          type: 'adjusted',
          source: 'meal',
          createdBy: new Types.ObjectId(user.userId),
          note: 'Hoàn lại do bỏ đánh dấu hoàn thành',
        });
      } else {
        const recreated = await this.pantryItemModel.create({
          familyId: meal.familyId,
          foodId: entry.foodId,
          categoryId: entry.categoryId,
          name: entry.name,
          quantity: entry.quantity,
          unit: entry.unit,
          expiryDate: entry.expiryDate ?? new Date(),
          location: (entry.location ?? 'fridge') as PantryItem['location'],
          status: 'active',
          source: 'meal',
          createdBy: new Types.ObjectId(user.userId),
        });

        await this.inventoryEventsService.create({
          familyId: recreated.familyId,
          pantryItemId: recreated._id,
          foodId: recreated.foodId,
          categoryId: recreated.categoryId,
          name: recreated.name,
          quantityDelta: entry.quantity,
          quantityAfter: recreated.quantity,
          unit: recreated.unit,
          type: 'added',
          source: 'meal',
          createdBy: new Types.ObjectId(user.userId),
          note: 'Hoàn lại do bỏ đánh dấu hoàn thành',
        });
      }
    }

    // Reversing also retires the shortfall shopping list this meal created, so
    // re-completing won't pile up duplicate "Còn thiếu" lists.
    if (meal.shortageListId) {
      await this.shoppingListGenerationService.removeGeneratedList(
        meal.familyId,
        meal.shortageListId,
      );
      meal.shortageListId = undefined;
    }

    meal.consumedItems = [];
    meal.ingredientsConsumed = false;
  }

  async remove(user: AuthenticatedUser, mealId: string) {
    const meal = await this.findMealForUser(user, mealId);
    await meal.deleteOne();

    return { success: true };
  }

  async getMissingIngredients(user: AuthenticatedUser, mealId: string) {
    const meal = await this.findMealForUser(user, mealId);

    if (!meal.recipeId) {
      throw new BadRequestException('Meal plan does not have a recipe');
    }

    return this.missingIngredientsService.getRecipeMissingIngredients(
      user,
      meal.recipeId.toString(),
      meal.servings,
    );
  }

  async generateShoppingList(
    user: AuthenticatedUser,
    mealId: string,
    dto: GenerateShoppingListDto,
  ) {
    const meal = await this.findMealForUser(user, mealId);

    if (!meal.recipeId) {
      throw new BadRequestException('Meal plan does not have a recipe');
    }

    return this.shoppingListGenerationService.generateFromMeal(
      user,
      meal.recipeId.toString(),
      meal.servings,
      {
        name: dto.name,
        plannedFor: dto.plannedFor ?? meal.date,
      },
    );
  }

  private async findMealForUser(user: AuthenticatedUser, mealId: string) {
    const familyId = await this.getActiveFamilyId(user);
    const meal = await this.mealPlanModel
      .findOne({ _id: mealId, familyId })
      .exec();

    if (!meal) {
      throw new NotFoundException('Meal plan not found');
    }

    return meal;
  }

  private async getRecipe(recipeId: string) {
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

  private async lookupRecipeName(meal: MealPlanDocument | MealPlan) {
    if (!meal.recipeId) {
      return undefined;
    }

    const recipe = await this.recipeModel
      .findById(meal.recipeId)
      .select('name')
      .lean()
      .exec();

    return recipe?.name;
  }

  // Completed + shortfall list still active = "waiting" (yellow on the client).
  private async isAwaitingIngredients(meal: MealPlanDocument | MealPlan) {
    if (!meal.isCompleted || !meal.shortageListId) {
      return false;
    }
    const list = await this.shoppingListModel
      .findById(meal.shortageListId)
      .select('status')
      .lean()
      .exec();
    return list?.status === 'active';
  }

  private toMealPlanResponse(
    meal: MealPlanDocument | MealPlan,
    recipeName?: string,
    awaitingIngredients = false,
  ) {
    return {
      id: meal._id.toString(),
      familyId: meal.familyId.toString(),
      date: meal.date,
      session: meal.session,
      customSessionName: meal.customSessionName,
      recipeId: meal.recipeId?.toString(),
      recipeName,
      customName: meal.customName,
      servings: meal.servings,
      isCompleted: meal.isCompleted,
      awaitingIngredients,
      note: meal.note,
      createdBy: meal.createdBy.toString(),
    };
  }
}
