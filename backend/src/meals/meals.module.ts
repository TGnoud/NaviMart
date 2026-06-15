import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamilyPermissionGuard } from '../auth/guards/family-permission.guard';
import { Family, FamilySchema } from '../families/schemas/family.schema';
import { InventoryEventsModule } from '../inventory-events/inventory-events.module';
import { PantryItem, PantryItemSchema } from '../pantry/schemas/pantry-item.schema';
import { Recipe, RecipeSchema } from '../recipes/schemas/recipe.schema';
import {
  ShoppingList,
  ShoppingListSchema,
} from '../shopping-lists/schemas/shopping-list.schema';
import { MealPlan, MealPlanSchema } from './schemas/meal-plan.schema';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';
import { MissingIngredientsService } from './missing-ingredients.service';
import { ShoppingListGenerationService } from './shopping-list-generation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MealPlan.name, schema: MealPlanSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Recipe.name, schema: RecipeSchema },
      { name: PantryItem.name, schema: PantryItemSchema },
      { name: ShoppingList.name, schema: ShoppingListSchema },
    ]),
    InventoryEventsModule,
  ],
  controllers: [MealsController],
  providers: [
    MealsService,
    MissingIngredientsService,
    ShoppingListGenerationService,
    FamilyPermissionGuard,
  ],
  exports: [
    MealsService,
    MissingIngredientsService,
    ShoppingListGenerationService,
    MongooseModule,
  ],
})
export class MealsModule {}
