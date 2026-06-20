import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamilyPermissionGuard } from '../auth/guards/family-permission.guard';
import { Category, CategorySchema } from '../catalog/schemas/category.schema';
import { Food, FoodSchema } from '../catalog/schemas/food.schema';
import { Family, FamilySchema } from '../families/schemas/family.schema';
import { InventoryEventsModule } from '../inventory-events/inventory-events.module';
import { PantryItem, PantryItemSchema } from '../pantry/schemas/pantry-item.schema';
import { ShoppingListsController } from './shopping-lists.controller';
import { ShoppingListsService } from './shopping-lists.service';
import {
  ShoppingList,
  ShoppingListSchema,
} from './schemas/shopping-list.schema';

@Module({
  imports: [
    InventoryEventsModule,
    MongooseModule.forFeature([
      { name: ShoppingList.name, schema: ShoppingListSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Food.name, schema: FoodSchema },
      { name: Category.name, schema: CategorySchema },
      { name: PantryItem.name, schema: PantryItemSchema },
    ]),
  ],
  controllers: [ShoppingListsController],
  providers: [ShoppingListsService, FamilyPermissionGuard],
  exports: [ShoppingListsService, MongooseModule],
})
export class ShoppingListsModule {}
