import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamilyPermissionGuard } from '../auth/guards/family-permission.guard';
import { Category, CategorySchema } from '../catalog/schemas/category.schema';
import { Food, FoodSchema } from '../catalog/schemas/food.schema';
import { Family, FamilySchema } from '../families/schemas/family.schema';
import { InventoryEventsModule } from '../inventory-events/inventory-events.module';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';
import { PantryItem, PantryItemSchema } from './schemas/pantry-item.schema';

@Module({
  imports: [
    InventoryEventsModule,
    MongooseModule.forFeature([
      { name: PantryItem.name, schema: PantryItemSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Food.name, schema: FoodSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [PantryController],
  providers: [PantryService, FamilyPermissionGuard],
  exports: [PantryService, MongooseModule],
})
export class PantryModule {}
