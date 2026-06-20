import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from '../catalog/schemas/category.schema';
import { Food, FoodSchema } from '../catalog/schemas/food.schema';
import { Unit, UnitSchema } from '../catalog/schemas/unit.schema';
import { Family, FamilySchema } from '../families/schemas/family.schema';
import { Recipe, RecipeSchema } from '../recipes/schemas/recipe.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminRecipesController } from './admin-recipes.controller';
import { AdminRecipesService } from './admin-recipes.service';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import {
  UserInputLog,
  UserInputLogSchema,
} from './schemas/user-input-log.schema';
import { UserInputLogsController } from './user-input-logs.controller';
import { UserInputLogsService } from './user-input-logs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Recipe.name, schema: RecipeSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Food.name, schema: FoodSchema },
      { name: Unit.name, schema: UnitSchema },
      { name: UserInputLog.name, schema: UserInputLogSchema },
    ]),
  ],
  controllers: [
    AdminUsersController,
    AdminCatalogController,
    AdminRecipesController,
    AdminStatsController,
    UserInputLogsController,
  ],
  providers: [
    AdminUsersService,
    AdminCatalogService,
    AdminRecipesService,
    AdminStatsService,
    UserInputLogsService,
  ],
  exports: [UserInputLogsService, MongooseModule],
})
export class AdminModule {}
