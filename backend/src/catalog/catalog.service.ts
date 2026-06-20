import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ListFoodsQueryDto } from './dto/list-foods-query.dto';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Food, FoodDocument } from './schemas/food.schema';
import {
  Unit,
  UnitDocument,
  toVietnameseUnitCode,
  toVietnameseUnitName,
} from './schemas/unit.schema';

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Food.name) private readonly foodModel: Model<Food>,
    @InjectModel(Unit.name) private readonly unitModel: Model<Unit>,
  ) {}

  async findAllCategories() {
    const categories = await this.categoryModel
      .find({ status: 'active' })
      .sort({ name: 1 })
      .exec();

    return categories.map((category) => this.toCategoryResponse(category));
  }

  async findAllFoods(query: ListFoodsQueryDto) {
    const filter: Record<string, unknown> = { status: 'active' };

    if (query.categoryId) {
      filter.categoryId = new Types.ObjectId(query.categoryId);
    }

    if (query.barcode) {
      filter.barcode = query.barcode;
    }
    if (query.q) {
      const regex = {
        $regex: this.escapeRegExp(query.q.trim()),
        $options: 'i',
      };
      filter.$or = [
        { name: regex },
        { normalizedName: regex },
        { aliases: regex },
      ];
    }

    const foods = await this.foodModel
      .find(filter)
      .sort({ name: 1 })
      .limit(query.limit ?? 10)
      .exec();

    return foods.map((food) => this.toFoodResponse(food));
  }

  async findAllUnits() {
    const units = await this.unitModel
      .find({ status: 'active' })
      .sort({ code: 1 })
      .exec();

    return units.map((unit) => this.toUnitResponse(unit));
  }

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private toCategoryResponse(category: CategoryDocument) {
    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
    };
  }

  private toFoodResponse(food: FoodDocument) {
    return {
      id: food._id.toString(),
      name: food.name,
      categoryId: food.categoryId.toString(),
      defaultUnit: toVietnameseUnitCode(food.defaultUnit),
      aliases: food.aliases,
      defaultStorageLocation: food.defaultStorageLocation,
      defaultShelfLifeDays: food.defaultShelfLifeDays,
      storageTips: food.storageTips,
      imageUrl: food.imageUrl,
      barcode: food.barcode,
    };
  }

  private toUnitResponse(unit: UnitDocument) {
    return {
      id: unit._id.toString(),
      code: toVietnameseUnitCode(unit.code),
      name: toVietnameseUnitName(unit.code, unit.name),
      type: unit.type,
    };
  }
}
