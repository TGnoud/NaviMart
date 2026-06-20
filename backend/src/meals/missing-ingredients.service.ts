import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { Family } from '../families/schemas/family.schema';
import { resolveActiveFamilyId } from '../families/family-access.util';
import { PantryItem } from '../pantry/schemas/pantry-item.schema';
import { Recipe, RecipeDocument } from '../recipes/schemas/recipe.schema';
import { toVietnameseUnitCode } from '../catalog/schemas/unit.schema';

@Injectable()
export class MissingIngredientsService {
  constructor(
    @InjectModel(Family.name) private readonly familyModel: Model<Family>,
    @InjectModel(PantryItem.name)
    private readonly pantryItemModel: Model<PantryItem>,
    @InjectModel(Recipe.name) private readonly recipeModel: Model<Recipe>,
  ) {}

  async getRecipeMissingIngredients(
    user: AuthenticatedUser,
    recipeId: string,
    servings?: number,
  ) {
    const familyId = await this.getActiveFamilyId(user);
    const recipe = await this.recipeModel.findById(recipeId).exec();

    if (!recipe || recipe.status === 'archived') {
      throw new NotFoundException('Recipe not found');
    }

    return this.calculateMissingIngredients(familyId, recipe, servings);
  }

  async calculateMissingIngredients(
    familyId: Types.ObjectId,
    recipe: RecipeDocument,
    servings = recipe.servings,
  ) {
    const pantryItems = await this.pantryItemModel
      .find({
        familyId,
        status: 'active',
        quantity: { $gt: 0 },
      })
      .lean()
      .exec();

    const scale = servings / recipe.servings;

    const ingredients = recipe.ingredients
      .filter((ingredient) => !ingredient.optional)
      .map((ingredient) => {
        const requiredQuantity = Number((ingredient.quantity * scale).toFixed(3));
        const availableQuantity = this.getAvailableQuantity(pantryItems, {
          foodId: ingredient.foodId?.toString(),
          name: ingredient.name,
          unit: ingredient.unit,
        });
        const missingQuantity = Math.max(
          0,
          Number((requiredQuantity - availableQuantity).toFixed(3)),
        );

        return {
          foodId: ingredient.foodId?.toString(),
          categoryId: ingredient.categoryId?.toString(),
          name: ingredient.name,
          unit: ingredient.unit,
          requiredQuantity,
          availableQuantity,
          missingQuantity,
          isMissing: missingQuantity > 0,
        };
      });

    return {
      recipeId: recipe._id.toString(),
      recipeName: recipe.name,
      servings,
      hasMissingIngredients: ingredients.some((item) => item.isMissing),
      ingredients,
      missingIngredients: ingredients.filter((item) => item.isMissing),
    };
  }

  findMatchingPantryItems<
    T extends { foodId?: Types.ObjectId; name: string; unit: string },
  >(pantryItems: T[], ingredient: { foodId?: string; name: string; unit: string }) {
    return pantryItems.filter((item) => {
      const sameUnit =
        this.normalizeUnit(item.unit) === this.normalizeUnit(ingredient.unit);
      if (!sameUnit) {
        return false;
      }

      if (ingredient.foodId && item.foodId) {
        return item.foodId.toString() === ingredient.foodId;
      }

      return (
        item.name.trim().toLowerCase() === ingredient.name.trim().toLowerCase()
      );
    });
  }

  private getAvailableQuantity(
    pantryItems: Array<{
      foodId?: Types.ObjectId;
      name: string;
      quantity: number;
      unit: string;
    }>,
    ingredient: { foodId?: string; name: string; unit: string },
  ) {
    return this.findMatchingPantryItems(pantryItems, ingredient).reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
  }

  private normalizeUnit(unit: string) {
    return toVietnameseUnitCode(unit).toLowerCase();
  }

  private getActiveFamilyId(user: AuthenticatedUser) {
    return resolveActiveFamilyId(this.familyModel, user);
  }
}
