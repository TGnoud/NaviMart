import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from '../catalog/schemas/category.schema';
import { Food, FoodSchema } from '../catalog/schemas/food.schema';
import { Family, FamilySchema } from '../families/schemas/family.schema';
import { MissingIngredientsService } from '../meals/missing-ingredients.service';
import { ShoppingListGenerationService } from '../meals/shopping-list-generation.service';
import { PantryItem, PantryItemSchema } from '../pantry/schemas/pantry-item.schema';
import {
  ShoppingList,
  ShoppingListSchema,
} from '../shopping-lists/schemas/shopping-list.schema';
import {
  RecipeFavorite,
  RecipeFavoriteSchema,
} from './schemas/recipe-favorite.schema';
import { Recipe, RecipeSchema } from './schemas/recipe.schema';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recipe.name, schema: RecipeSchema },
      { name: RecipeFavorite.name, schema: RecipeFavoriteSchema },
      { name: Food.name, schema: FoodSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Family.name, schema: FamilySchema },
      { name: PantryItem.name, schema: PantryItemSchema },
      { name: ShoppingList.name, schema: ShoppingListSchema },
    ]),
  ],
  controllers: [RecipesController],
  providers: [
    RecipesService,
    MissingIngredientsService,
    ShoppingListGenerationService,
  ],
  exports: [RecipesService, MongooseModule],
})
export class RecipesModule {}
