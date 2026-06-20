import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserInputLogsService } from '../admin/user-input-logs.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { Category } from '../catalog/schemas/category.schema';
import { Food, FOOD_STORAGE_LOCATIONS } from '../catalog/schemas/food.schema';
import { Family } from '../families/schemas/family.schema';
import { resolveActiveFamilyId } from '../families/family-access.util';
import { InventoryEventsService } from '../inventory-events/inventory-events.service';
import {
  PantryItem,
  PantryItemDocument,
} from '../pantry/schemas/pantry-item.schema';
import { RealtimeService } from '../realtime/realtime.service';
import { CompleteShoppingListDto } from './dto/complete-shopping-list.dto';
import { CreateShoppingListItemDto } from './dto/create-shopping-list-item.dto';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { ListShoppingListsQueryDto } from './dto/list-shopping-lists-query.dto';
import { UpdateShoppingListItemDto } from './dto/update-shopping-list-item.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import {
  ShoppingList,
  ShoppingListDocument,
  ShoppingListItem,
} from './schemas/shopping-list.schema';
import { toShoppingListResponse } from './shopping-list.mapper';

@Injectable()
export class ShoppingListsService {
  constructor(
    @InjectModel(ShoppingList.name)
    private readonly shoppingListModel: Model<ShoppingList>,
    @InjectModel(Family.name) private readonly familyModel: Model<Family>,
    @InjectModel(Food.name) private readonly foodModel: Model<Food>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(PantryItem.name)
    private readonly pantryItemModel: Model<PantryItem>,
    private readonly inventoryEventsService: InventoryEventsService,
    private readonly realtimeService: RealtimeService,
    private readonly userInputLogsService: UserInputLogsService,
  ) {}

  async findAll(
    user: AuthenticatedUser,
    query: ListShoppingListsQueryDto,
  ) {
    const familyId = await this.getActiveFamilyId(user);

    const filter: Record<string, unknown> = { familyId };
    if (query.status) {
      filter.status = query.status;
    }

    const lists = await this.shoppingListModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    return lists.map((list) => this.toShoppingListResponse(list));
  }

  async create(user: AuthenticatedUser, dto: CreateShoppingListDto) {
    const familyId = await this.getActiveFamilyId(user);

    const list = await this.shoppingListModel.create({
      familyId,
      name: dto.name,
      type: dto.type ?? 'custom',
      plannedFor: dto.plannedFor,
      createdBy: new Types.ObjectId(user.userId),
    });

    return this.emitListUpdated(this.toShoppingListResponse(list));
  }

  async findOne(user: AuthenticatedUser, listId: string) {
    const list = await this.findListForUser(user, listId);
    return this.toShoppingListResponse(list);
  }

  async update(
    user: AuthenticatedUser,
    listId: string,
    dto: UpdateShoppingListDto,
  ) {
    const list = await this.findListForUser(user, listId);

    if (dto.name !== undefined) {
      list.name = dto.name;
    }
    if (dto.type !== undefined) {
      list.type = dto.type;
    }
    if (dto.status !== undefined) {
      list.status = dto.status;
      list.completedAt = dto.status === 'completed' ? new Date() : undefined;
    }
    if (dto.plannedFor !== undefined) {
      list.plannedFor = dto.plannedFor;
    }

    await list.save();
    return this.emitListUpdated(this.toShoppingListResponse(list));
  }

  async remove(user: AuthenticatedUser, listId: string) {
    const list = await this.findListForUser(user, listId);
    list.status = 'archived';
    await list.save();

    this.realtimeService.emitToFamily(
      list.familyId.toString(),
      'shoppingList:removed',
      { id: list._id.toString() },
    );

    return { success: true };
  }

  async addItem(
    user: AuthenticatedUser,
    listId: string,
    dto: CreateShoppingListItemDto,
  ) {
    const list = await this.findListForUser(user, listId);
    const item = await this.buildShoppingListItem(dto);

    list.items.push(item as ShoppingListItem);
    await list.save();

    const savedItem = list.items[list.items.length - 1];
    if (!dto.foodId && dto.name) {
      await this.userInputLogsService.createIfManual({
        userId: new Types.ObjectId(user.userId),
        familyId: list.familyId,
        source: 'shopping_list',
        value: dto.name,
        categoryId: savedItem.categoryId,
        unit: savedItem.unit,
        relatedId: savedItem._id,
      });
    }

    return this.emitListUpdated(this.toShoppingListResponse(list));
  }

  async updateItem(
    user: AuthenticatedUser,
    listId: string,
    itemId: string,
    dto: UpdateShoppingListItemDto,
  ) {
    const list = await this.findListForUser(user, listId);
    const item = this.findItemOrThrow(list, itemId);

    if (dto.foodId !== undefined) {
      const catalogItem = await this.getFood(dto.foodId);
      item.foodId = catalogItem._id;
      item.name = catalogItem.name;
      item.categoryId = catalogItem.categoryId;
      item.unit = catalogItem.defaultUnit;
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
    }
    if (dto.unit !== undefined) {
      item.unit = dto.unit;
    }
    if (dto.note !== undefined) {
      item.note = dto.note;
    }
    if (dto.checked !== undefined) {
      item.checked = dto.checked;
      item.status = dto.checked ? 'bought' : 'pending';
      item.boughtAt = dto.checked ? new Date() : undefined;
    }
    if (dto.status !== undefined) {
      item.status = dto.status;
      item.checked = dto.status === 'bought';
      item.boughtAt = dto.status === 'bought' ? new Date() : undefined;
    }

    await list.save();

    if (!item.foodId && dto.name !== undefined) {
      await this.userInputLogsService.createIfManual({
        userId: new Types.ObjectId(user.userId),
        familyId: list.familyId,
        source: 'shopping_list',
        value: dto.name,
        categoryId: item.categoryId,
        unit: item.unit,
        relatedId: item._id,
      });
    }

    return this.emitListUpdated(this.toShoppingListResponse(list));
  }

  async removeItem(user: AuthenticatedUser, listId: string, itemId: string) {
    const list = await this.findListForUser(user, listId);
    const item = this.findItemOrThrow(list, itemId);
    list.items = list.items.filter(
      (currentItem) => currentItem._id.toString() !== item._id.toString(),
    );
    await list.save();

    return this.emitListUpdated(this.toShoppingListResponse(list));
  }

  async complete(
    user: AuthenticatedUser,
    listId: string,
    dto: CompleteShoppingListDto,
  ) {
    const list = await this.findListForUser(user, listId);

    if (list.status === 'completed') {
      throw new BadRequestException('Shopping list is already completed');
    }
    if (list.status === 'archived') {
      throw new BadRequestException('Archived shopping list cannot be completed');
    }

    const boughtItems = list.items.filter(
      (item) => item.checked || item.status === 'bought',
    );

    if (boughtItems.length === 0) {
      throw new BadRequestException(
        'No checked shopping list items to add to pantry',
      );
    }

    const pantryMetadataByItemId = new Map(
      (dto.pantryItems ?? []).map((item) => [item.itemId, item]),
    );
    const foodIds = boughtItems
      .map((item) => item.foodId?.toString())
      .filter((foodId): foodId is string => Boolean(foodId));
    const foods = await this.foodModel
      .find({ _id: { $in: foodIds }, status: 'active' })
      .exec();
    const foodById = new Map(foods.map((food) => [food._id.toString(), food]));

    // Move each bought item into the pantry, merging into an existing active
    // item that matches the same food/name + unit + location + expiry day so
    // buying more of something you already stock just tops up the quantity
    // instead of creating a duplicate row.
    const createdPantryItems: PantryItemDocument[] = [];
    const inventoryEvents: Parameters<
      InventoryEventsService['createMany']
    >[0] = [];

    for (const item of boughtItems) {
      const metadata = pantryMetadataByItemId.get(item._id.toString());
      const food = item.foodId
        ? foodById.get(item.foodId.toString())
        : undefined;

      const expiryDate = this.startOfDay(
        metadata?.expiryDate ??
          this.getDefaultExpiryDate(
            food?.defaultShelfLifeDays ?? dto.defaultExpiryDays ?? 7,
          ),
      );
      const location =
        metadata?.location ??
        food?.defaultStorageLocation ??
        dto.defaultLocation ??
        'fridge';
      const note = metadata?.note ?? item.note;

      const match: Record<string, unknown> = {
        familyId: list.familyId,
        status: 'active',
        unit: item.unit,
        location,
        expiryDate: { $gte: expiryDate, $lt: this.addDays(expiryDate, 1) },
        ...(item.foodId
          ? { foodId: item.foodId }
          : {
              foodId: { $exists: false },
              name: {
                $regex: `^${this.escapeRegExp(item.name)}$`,
                $options: 'i',
              },
            }),
      };

      const merged = await this.pantryItemModel
        .findOneAndUpdate(
          match,
          [
            {
              $set: {
                quantity: {
                  $round: [{ $add: ['$quantity', item.quantity] }, 3],
                },
              },
            },
          ],
          { new: true, updatePipeline: true },
        )
        .exec();

      const pantryItem =
        merged ??
        (await this.pantryItemModel.create({
          familyId: list.familyId,
          foodId: item.foodId,
          categoryId: item.categoryId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          expiryDate,
          location,
          status: 'active',
          source: 'shopping',
          createdBy: new Types.ObjectId(user.userId),
          note,
        }));

      createdPantryItems.push(pantryItem);
      inventoryEvents.push({
        familyId: pantryItem.familyId,
        pantryItemId: pantryItem._id,
        foodId: pantryItem.foodId,
        categoryId: pantryItem.categoryId,
        name: pantryItem.name,
        quantityDelta: item.quantity,
        quantityAfter: pantryItem.quantity,
        unit: pantryItem.unit,
        type: 'added',
        source: 'shopping',
        createdBy: new Types.ObjectId(user.userId),
        note,
      });
    }

    await this.inventoryEventsService.createMany(inventoryEvents);

    list.status = 'completed';
    list.completedAt = new Date();
    list.items.forEach((item) => {
      if (item.checked || item.status === 'bought') {
        item.checked = true;
        item.status = 'bought';
        item.boughtAt = item.boughtAt ?? new Date();
      }
    });
    await list.save();

    return {
      shoppingList: this.emitListUpdated(this.toShoppingListResponse(list)),
      pantryItems: createdPantryItems.map((item) => ({
        id: item._id.toString(),
        foodId: item.foodId?.toString(),
        categoryId: item.categoryId?.toString(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        location: item.location,
        status: item.status,
        source: item.source,
      })),
    };
  }

  private emitListUpdated(
    response: ReturnType<ShoppingListsService['toShoppingListResponse']>,
  ) {
    this.realtimeService.emitToFamily(
      response.familyId,
      'shoppingList:updated',
      response,
    );

    return response;
  }

  private async buildShoppingListItem(dto: CreateShoppingListItemDto) {
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
        note: dto.note,
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
      note: dto.note,
    };
  }

  private async findListForUser(user: AuthenticatedUser, listId: string) {
    const familyId = await this.getActiveFamilyId(user);
    const list = await this.shoppingListModel
      .findOne({ _id: listId, familyId })
      .exec();

    if (!list) {
      throw new NotFoundException('Shopping list not found');
    }

    return list;
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

  private getDefaultExpiryDate(daysFromToday: number) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysFromToday);
    return expiryDate;
  }

  // Normalize to midnight so items bought on the same day with the same shelf
  // life share one expiry value and can be merged in the pantry.
  private startOfDay(date: Date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private findItemOrThrow(
    list: ShoppingListDocument,
    itemId: string,
  ): ShoppingListItem {
    const item = list.items.find(
      (currentItem) => currentItem._id.toString() === itemId,
    );

    if (!item) {
      throw new NotFoundException('Shopping list item not found');
    }

    return item;
  }

  private toShoppingListResponse(list: ShoppingListDocument | ShoppingList) {
    return toShoppingListResponse(list);
  }
}
