import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { Category } from '../catalog/schemas/category.schema';
import { Food } from '../catalog/schemas/food.schema';
import { Family } from '../families/schemas/family.schema';
import { resolveActiveFamilyId } from '../families/family-access.util';
import { InventoryEventsService } from '../inventory-events/inventory-events.service';
import { ConsumePantryItemDto } from './dto/consume-pantry-item.dto';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { ListPantryItemsQueryDto } from './dto/list-pantry-items-query.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';
import { PantryItem, PantryItemDocument } from './schemas/pantry-item.schema';
import {
  DEFAULT_EXPIRY_WARNING_DAYS,
  getExpiryStatus,
  getExpiryStatusRange,
} from './utils/expiry-status.util';

@Injectable()
export class PantryService {
  constructor(
    @InjectModel(PantryItem.name)
    private readonly pantryItemModel: Model<PantryItem>,
    @InjectModel(Family.name) private readonly familyModel: Model<Family>,
    @InjectModel(Food.name) private readonly foodModel: Model<Food>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly inventoryEventsService: InventoryEventsService,
  ) {}

  async findAll(user: AuthenticatedUser, query: ListPantryItemsQueryDto) {
    const familyId = await this.getActiveFamilyId(user);
    const filter = this.buildFilter(familyId, query);

    const items = await this.pantryItemModel
      .find(filter)
      .sort({ expiryDate: 1, createdAt: -1 })
      .exec();

    return items.map((item) => this.toPantryItemResponse(item));
  }

  async create(user: AuthenticatedUser, dto: CreatePantryItemDto) {
    const familyId = await this.getActiveFamilyId(user);
    const data = await this.buildPantryItemData(dto);

    const item = await this.pantryItemModel.create({
      ...data,
      familyId,
      expiryDate: dto.expiryDate,
      location: dto.location ?? data.location ?? 'fridge',
      source: dto.source ?? 'manual',
      createdBy: new Types.ObjectId(user.userId),
      note: dto.note,
      imageUrl: dto.imageUrl,
    });

    await this.inventoryEventsService.create({
      familyId,
      pantryItemId: item._id,
      foodId: item.foodId,
      categoryId: item.categoryId,
      name: item.name,
      quantityDelta: item.quantity,
      quantityAfter: item.quantity,
      unit: item.unit,
      type: 'added',
      source: item.source,
      createdBy: new Types.ObjectId(user.userId),
      note: dto.note,
    });

    return this.toPantryItemResponse(item);
  }

  async findOne(user: AuthenticatedUser, itemId: string) {
    const item = await this.findItemForUser(user, itemId);
    return this.toPantryItemResponse(item);
  }

  async update(
    user: AuthenticatedUser,
    itemId: string,
    dto: UpdatePantryItemDto,
  ) {
    const item = await this.findItemForUser(user, itemId);
    const previousQuantity = item.quantity;
    const previousStatus = item.status;

    if (dto.foodId !== undefined) {
      const food = await this.getFood(dto.foodId);
      item.foodId = food._id;
      item.name = food.name;
      item.categoryId = food.categoryId;
      item.unit = food.defaultUnit;
      item.location = food.defaultStorageLocation;
    }
    if (dto.categoryId !== undefined) {
      await this.assertCategoryExists(dto.categoryId);
      item.categoryId = new Types.ObjectId(dto.categoryId);
    }
    if (dto.name !== undefined) {
      item.name = dto.name;
    }
    if (dto.quantity !== undefined) {
      item.quantity = dto.quantity;
      if (dto.quantity > 0 && item.status === 'used_up') {
        item.status = 'active';
        item.consumedAt = undefined;
      } else if (dto.quantity === 0) {
        item.status = 'used_up';
        item.consumedAt = new Date();
      }
    }
    if (dto.unit !== undefined) {
      item.unit = dto.unit;
    }
    if (dto.expiryDate !== undefined) {
      item.expiryDate = dto.expiryDate;
    }
    if (dto.location !== undefined) {
      item.location = dto.location;
    }
    if (dto.status !== undefined) {
      item.status = dto.status;
      item.consumedAt = dto.status === 'used_up' ? new Date() : item.consumedAt;
      item.wastedAt = dto.status === 'wasted' ? new Date() : item.wastedAt;
    }
    if (dto.note !== undefined) {
      item.note = dto.note;
    }
    if (dto.imageUrl !== undefined) {
      item.imageUrl = dto.imageUrl;
    }

    await item.save();

    if (dto.quantity !== undefined && dto.quantity !== previousQuantity) {
      await this.inventoryEventsService.create({
        familyId: item.familyId,
        pantryItemId: item._id,
        foodId: item.foodId,
        categoryId: item.categoryId,
        name: item.name,
        quantityDelta: Number((item.quantity - previousQuantity).toFixed(3)),
        quantityAfter: item.quantity,
        unit: item.unit,
        type: 'adjusted',
        source: 'manual',
        createdBy: new Types.ObjectId(user.userId),
        note: dto.note,
      });
    }

    if (dto.status === 'wasted' && previousStatus !== 'wasted') {
      await this.inventoryEventsService.create({
        familyId: item.familyId,
        pantryItemId: item._id,
        foodId: item.foodId,
        categoryId: item.categoryId,
        name: item.name,
        quantityDelta: -item.quantity,
        quantityAfter: item.quantity,
        unit: item.unit,
        type: 'wasted',
        source: 'manual',
        createdBy: new Types.ObjectId(user.userId),
        note: dto.note,
      });
    }

    return this.toPantryItemResponse(item);
  }

  async remove(user: AuthenticatedUser, itemId: string) {
    const item = await this.findItemForUser(user, itemId);
    await this.inventoryEventsService.create({
      familyId: item.familyId,
      pantryItemId: item._id,
      foodId: item.foodId,
      categoryId: item.categoryId,
      name: item.name,
      quantityDelta: -item.quantity,
      quantityAfter: 0,
      unit: item.unit,
      type: 'deleted',
      source: 'manual',
      createdBy: new Types.ObjectId(user.userId),
      note: item.note,
    });
    await item.deleteOne();

    return { success: true };
  }

  async consume(
    user: AuthenticatedUser,
    itemId: string,
    dto: ConsumePantryItemDto,
  ) {
    const item = await this.findItemForUser(user, itemId);

    if (item.status !== 'active') {
      throw new BadRequestException('Only active pantry items can be consumed');
    }
    if (dto.quantity > item.quantity) {
      throw new BadRequestException('Consumed quantity exceeds current stock');
    }

    // Deduct atomically: the `quantity: { $gte }` guard ensures that under
    // concurrent consumes only the requests the stock can actually cover
    // succeed — preventing the read-modify-write oversell race. A null result
    // means another request drained the stock first.
    const updated = await this.pantryItemModel
      .findOneAndUpdate(
        {
          _id: item._id,
          familyId: item.familyId,
          status: 'active',
          quantity: { $gte: dto.quantity },
        },
        [
          {
            $set: {
              quantity: {
                $round: [{ $subtract: ['$quantity', dto.quantity] }, 3],
              },
              ...(dto.note !== undefined ? { note: dto.note } : {}),
            },
          },
          {
            $set: {
              status: {
                $cond: [{ $eq: ['$quantity', 0] }, 'used_up', '$status'],
              },
              consumedAt: {
                $cond: [{ $eq: ['$quantity', 0] }, '$$NOW', '$consumedAt'],
              },
            },
          },
        ],
        { new: true, updatePipeline: true },
      )
      .exec();

    if (!updated) {
      throw new BadRequestException('Consumed quantity exceeds current stock');
    }

    const previousQuantity = Number((updated.quantity + dto.quantity).toFixed(3));
    await this.inventoryEventsService.create({
      familyId: updated.familyId,
      pantryItemId: updated._id,
      foodId: updated.foodId,
      categoryId: updated.categoryId,
      name: updated.name,
      quantityDelta: -dto.quantity,
      quantityAfter: updated.quantity,
      unit: updated.unit,
      type: 'consumed',
      source: 'manual',
      createdBy: new Types.ObjectId(user.userId),
      note: dto.note ?? `Consumed from ${previousQuantity}`,
    });
    return this.toPantryItemResponse(updated);
  }

  async markWasted(user: AuthenticatedUser, itemId: string) {
    const item = await this.findItemForUser(user, itemId);
    const wastedQuantity = item.quantity;
    item.status = 'wasted';
    item.wastedAt = new Date();
    item.quantity = 0;
    await item.save();
    await this.inventoryEventsService.create({
      familyId: item.familyId,
      pantryItemId: item._id,
      foodId: item.foodId,
      categoryId: item.categoryId,
      name: item.name,
      quantityDelta: -wastedQuantity,
      quantityAfter: 0,
      unit: item.unit,
      type: 'wasted',
      source: 'manual',
      createdBy: new Types.ObjectId(user.userId),
      note: item.note,
    });

    return this.toPantryItemResponse(item);
  }

  private buildFilter(
    familyId: Types.ObjectId,
    query: ListPantryItemsQueryDto,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {
      familyId,
      status: query.status ?? 'active',
    };

    if (query.location) {
      filter.location = query.location;
    }
    if (query.categoryId) {
      filter.categoryId = new Types.ObjectId(query.categoryId);
    }
    if (query.q) {
      filter.name = { $regex: query.q.trim(), $options: 'i' };
    }

    const expiryRange = getExpiryStatusRange(
      query.expiryStatus,
      query.expiryWarningDays ?? DEFAULT_EXPIRY_WARNING_DAYS,
    );
    const dateFilter: Record<string, Date> = {};

    if (expiryRange?.from) {
      dateFilter.$gte = expiryRange.from;
    }
    if (expiryRange?.toExclusive) {
      dateFilter.$lt = expiryRange.toExclusive;
    }
    if (query.fromExpiryDate) {
      dateFilter.$gte = query.fromExpiryDate;
    }
    if (query.toExpiryDate) {
      dateFilter.$lte = query.toExpiryDate;
    }
    if (Object.keys(dateFilter).length > 0) {
      filter.expiryDate = dateFilter;
    }

    return filter;
  }

  private async buildPantryItemData(dto: CreatePantryItemDto) {
    if (dto.foodId) {
      const food = await this.getFood(dto.foodId);
      return {
        foodId: food._id,
        name: food.name,
        categoryId: dto.categoryId
          ? new Types.ObjectId(dto.categoryId)
          : food.categoryId,
        quantity: dto.quantity,
        unit: dto.unit ?? food.defaultUnit,
        location: food.defaultStorageLocation,
      };
    }

    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId);
    }

    return {
      name: dto.name!,
      categoryId: dto.categoryId ? new Types.ObjectId(dto.categoryId) : undefined,
      quantity: dto.quantity,
      unit: dto.unit!,
      location: dto.location,
    };
  }

  private async findItemForUser(user: AuthenticatedUser, itemId: string) {
    const familyId = await this.getActiveFamilyId(user);
    const item = await this.pantryItemModel
      .findOne({ _id: itemId, familyId })
      .exec();

    if (!item) {
      throw new NotFoundException('Pantry item not found');
    }

    return item;
  }

  private getActiveFamilyId(user: AuthenticatedUser) {
    return resolveActiveFamilyId(this.familyModel, user);
  }

  private async getFood(foodId: string) {
    const food = await this.foodModel
      .findOne({ _id: foodId, status: 'active' })
      .exec();

    if (!food) {
      throw new NotFoundException('Food catalog item not found');
    }

    return food;
  }

  private async assertCategoryExists(categoryId: string) {
    const exists = await this.categoryModel
      .exists({ _id: categoryId, status: 'active' })
      .exec();

    if (!exists) {
      throw new NotFoundException('Category not found');
    }
  }

  private toPantryItemResponse(item: PantryItemDocument | PantryItem) {
    return {
      id: item._id.toString(),
      familyId: item.familyId.toString(),
      foodId: item.foodId?.toString(),
      categoryId: item.categoryId?.toString(),
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate,
      expiryStatus: getExpiryStatus(item.expiryDate),
      location: item.location,
      status: item.status,
      source: item.source,
      createdBy: item.createdBy.toString(),
      note: item.note,
      imageUrl: item.imageUrl,
      consumedAt: item.consumedAt,
      wastedAt: item.wastedAt,
    };
  }
}
