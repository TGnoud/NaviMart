import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import {
  Category,
  CategoryDocument,
} from '../catalog/schemas/category.schema';
import { Food, FoodDocument } from '../catalog/schemas/food.schema';
import {
  Unit,
  UnitDocument,
  toVietnameseUnitCode,
  toVietnameseUnitName,
} from '../catalog/schemas/unit.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateFoodDto } from './dto/create-food.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { ListCatalogQueryDto } from './dto/list-catalog-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class AdminCatalogService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Food.name) private readonly foodModel: Model<Food>,
    @InjectModel(Unit.name) private readonly unitModel: Model<Unit>,
  ) {}

  async findAllCategories(query: ListCatalogQueryDto) {
    const filter: Record<string, unknown> = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.search) {
      filter.name = {
        $regex: this.escapeRegExp(query.search.trim()),
        $options: 'i',
      };
    }

    const categories = await this.categoryModel
      .find(filter)
      .sort({ name: 1 })
      .exec();

    return categories.map((category) => this.toCategoryResponse(category));
  }

  async createCategory(dto: CreateCategoryDto) {
    try {
      const category = await this.categoryModel.create({
        name: dto.name,
        slug: dto.slug ?? this.slugify(dto.name),
        description: dto.description,
        icon: dto.icon,
      });

      return this.toCategoryResponse(category);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Category slug already exists');
      }

      throw error;
    }
  }

  async updateCategory(categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findById(categoryId).exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.slug !== undefined) category.slug = dto.slug;
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.icon !== undefined) category.icon = dto.icon;
    if (dto.status !== undefined) category.status = dto.status;

    try {
      await category.save();
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Category slug already exists');
      }

      throw error;
    }

    return this.toCategoryResponse(category);
  }

  async removeCategory(categoryId: string) {
    const category = await this.categoryModel.findById(categoryId).exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    category.status = 'archived';
    await category.save();

    return { success: true };
  }

  async findAllFoods(query: ListCatalogQueryDto) {
    const filter: Record<string, unknown> = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.search) {
      filter.name = {
        $regex: this.escapeRegExp(query.search.trim()),
        $options: 'i',
      };
    }

    const foods = await this.foodModel.find(filter).sort({ name: 1 }).exec();

    return foods.map((food) => this.toFoodResponse(food));
  }

  async createFood(user: AuthenticatedUser, dto: CreateFoodDto) {
    await this.assertCategoryExists(dto.categoryId);

    try {
      const food = await this.foodModel.create({
        name: dto.name,
        normalizedName: dto.name.trim().toLowerCase(),
        categoryId: new Types.ObjectId(dto.categoryId),
        defaultUnit: dto.defaultUnit,
        aliases: dto.aliases ?? [],
        defaultStorageLocation: dto.defaultStorageLocation ?? 'fridge',
        defaultShelfLifeDays: dto.defaultShelfLifeDays,
        storageTips: dto.storageTips,
        imageUrl: dto.imageUrl,
        barcode: dto.barcode,
        isSystem: true,
        createdBy: new Types.ObjectId(user.userId),
      });

      return this.toFoodResponse(food);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Food already exists');
      }

      throw error;
    }
  }

  async updateFood(foodId: string, dto: UpdateFoodDto) {
    const food = await this.foodModel.findById(foodId).exec();

    if (!food) {
      throw new NotFoundException('Food catalog item not found');
    }

    if (dto.name !== undefined) {
      food.name = dto.name;
      food.normalizedName = dto.name.trim().toLowerCase();
    }
    if (dto.categoryId !== undefined) {
      await this.assertCategoryExists(dto.categoryId);
      food.categoryId = new Types.ObjectId(dto.categoryId);
    }
    if (dto.defaultUnit !== undefined) food.defaultUnit = dto.defaultUnit;
    if (dto.aliases !== undefined) food.aliases = dto.aliases;
    if (dto.defaultStorageLocation !== undefined) {
      food.defaultStorageLocation = dto.defaultStorageLocation;
    }
    if (dto.defaultShelfLifeDays !== undefined) {
      food.defaultShelfLifeDays = dto.defaultShelfLifeDays;
    }
    if (dto.storageTips !== undefined) food.storageTips = dto.storageTips;
    if (dto.imageUrl !== undefined) food.imageUrl = dto.imageUrl;
    if (dto.barcode !== undefined) food.barcode = dto.barcode;
    if (dto.status !== undefined) food.status = dto.status;

    try {
      await food.save();
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Food already exists');
      }

      throw error;
    }

    return this.toFoodResponse(food);
  }

  async removeFood(foodId: string) {
    const food = await this.foodModel.findById(foodId).exec();

    if (!food) {
      throw new NotFoundException('Food catalog item not found');
    }

    food.status = 'archived';
    await food.save();

    return { success: true };
  }

  async findAllUnits(query: ListCatalogQueryDto) {
    const filter: Record<string, unknown> = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.search) {
      filter.name = {
        $regex: this.escapeRegExp(query.search.trim()),
        $options: 'i',
      };
    }

    const units = await this.unitModel.find(filter).sort({ code: 1 }).exec();

    return units.map((unit) => this.toUnitResponse(unit));
  }

  async createUnit(dto: CreateUnitDto) {
    try {
      const unit = await this.unitModel.create({
        code: dto.code.trim().toLowerCase(),
        name: dto.name,
        type: dto.type,
      });

      return this.toUnitResponse(unit);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Unit code already exists');
      }

      throw error;
    }
  }

  async updateUnit(unitId: string, dto: UpdateUnitDto) {
    const unit = await this.unitModel.findById(unitId).exec();

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    if (dto.code !== undefined) unit.code = dto.code.trim().toLowerCase();
    if (dto.name !== undefined) unit.name = dto.name;
    if (dto.type !== undefined) unit.type = dto.type;
    if (dto.status !== undefined) unit.status = dto.status;

    try {
      await unit.save();
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Unit code already exists');
      }

      throw error;
    }

    return this.toUnitResponse(unit);
  }

  async removeUnit(unitId: string) {
    const unit = await this.unitModel.findById(unitId).exec();

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    unit.status = 'archived';
    await unit.save();

    return { success: true };
  }

  private async assertCategoryExists(categoryId: string) {
    const exists = await this.categoryModel
      .exists({ _id: categoryId, status: 'active' })
      .exec();

    if (!exists) {
      throw new NotFoundException('Category not found');
    }
  }

  private slugify(name: string) {
    return name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
      status: category.status,
    };
  }

  private toFoodResponse(food: FoodDocument) {
    return {
      id: food._id.toString(),
      name: food.name,
      normalizedName: food.normalizedName,
      categoryId: food.categoryId.toString(),
      defaultUnit: toVietnameseUnitCode(food.defaultUnit),
      aliases: food.aliases,
      defaultStorageLocation: food.defaultStorageLocation,
      defaultShelfLifeDays: food.defaultShelfLifeDays,
      storageTips: food.storageTips,
      imageUrl: food.imageUrl,
      barcode: food.barcode,
      isSystem: food.isSystem,
      status: food.status,
    };
  }

  private toUnitResponse(unit: UnitDocument) {
    return {
      id: unit._id.toString(),
      code: toVietnameseUnitCode(unit.code),
      name: toVietnameseUnitName(unit.code, unit.name),
      type: unit.type,
      status: unit.status,
    };
  }

  private isDuplicateKeyError(error: unknown): error is { code: number } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }
}
