import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { Family } from '../families/schemas/family.schema';
import { resolveActiveFamilyId } from '../families/family-access.util';
import { InventoryEvent } from '../inventory-events/schemas/inventory-event.schema';
import { PantryItem } from '../pantry/schemas/pantry-item.schema';
import { ShoppingList } from '../shopping-lists/schemas/shopping-list.schema';
import { ReportDateRangeQueryDto } from './dto/report-date-range-query.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Family.name) private readonly familyModel: Model<Family>,
    @InjectModel(ShoppingList.name)
    private readonly shoppingListModel: Model<ShoppingList>,
    @InjectModel(PantryItem.name)
    private readonly pantryItemModel: Model<PantryItem>,
    @InjectModel(InventoryEvent.name)
    private readonly inventoryEventModel: Model<InventoryEvent>,
  ) {}

  async getDashboard(user: AuthenticatedUser, query: ReportDateRangeQueryDto) {
    const familyId = await this.getActiveFamilyId(user);
    const [shoppingSummary, pantrySummary, inventorySummary, wasteSummary] =
      await Promise.all([
        this.getShoppingSummary(familyId, query),
        this.getPantrySummary(familyId),
        this.getInventorySummary(familyId, query),
        this.getWasteSummary(familyId, query),
      ]);

    return {
      range: query,
      shopping: shoppingSummary,
      pantry: pantrySummary,
      inventory: inventorySummary,
      waste: wasteSummary,
    };
  }

  async getConsumptionTrends(
    user: AuthenticatedUser,
    query: ReportDateRangeQueryDto,
  ) {
    const familyId = await this.getActiveFamilyId(user);
    const eventsByDay = await this.inventoryEventModel.aggregate([
      {
        $match: {
          familyId,
          createdAt: { $gte: query.startDate, $lte: query.endDate },
          type: { $in: ['added', 'consumed', 'wasted', 'adjusted'] },
        },
      },
      {
        $group: {
          _id: {
            day: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
                timezone: 'Asia/Ho_Chi_Minh',
              },
            },
            type: '$type',
          },
          totalQuantityDelta: { $sum: '$quantityDelta' },
          eventCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.day': 1, '_id.type': 1 } },
    ]);

    const topConsumed = await this.inventoryEventModel.aggregate([
      {
        $match: {
          familyId,
          createdAt: { $gte: query.startDate, $lte: query.endDate },
          type: 'consumed',
        },
      },
      {
        $group: {
          _id: { name: '$name', unit: '$unit' },
          quantity: { $sum: { $abs: '$quantityDelta' } },
          eventCount: { $sum: 1 },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]);

    return {
      range: query,
      eventsByDay: eventsByDay.map((item) => ({
        day: item._id.day,
        type: item._id.type,
        totalQuantityDelta: item.totalQuantityDelta,
        eventCount: item.eventCount,
      })),
      topConsumed: topConsumed.map((item) => ({
        name: item._id.name,
        unit: item._id.unit,
        quantity: item.quantity,
        eventCount: item.eventCount,
      })),
    };
  }

  async getWasteReport(user: AuthenticatedUser, query: ReportDateRangeQueryDto) {
    const familyId = await this.getActiveFamilyId(user);
    const wasteEvents = await this.inventoryEventModel.aggregate([
      {
        $match: {
          familyId,
          createdAt: { $gte: query.startDate, $lte: query.endDate },
          type: { $in: ['wasted', 'expired'] },
        },
      },
      {
        $group: {
          _id: { name: '$name', unit: '$unit' },
          wastedQuantity: { $sum: { $abs: '$quantityDelta' } },
          eventCount: { $sum: 1 },
        },
      },
      { $sort: { wastedQuantity: -1 } },
    ]);

    const expiredActiveItems = await this.pantryItemModel
      .find({
        familyId,
        status: 'active',
        expiryDate: { $lt: new Date() },
      })
      .sort({ expiryDate: 1 })
      .exec();

    return {
      range: query,
      wastedItems: wasteEvents.map((item) => ({
        name: item._id.name,
        unit: item._id.unit,
        wastedQuantity: item.wastedQuantity,
        eventCount: item.eventCount,
      })),
      expiredActiveItems: expiredActiveItems.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        location: item.location,
      })),
    };
  }

  private async getShoppingSummary(
    familyId: Types.ObjectId,
    query: ReportDateRangeQueryDto,
  ) {
    const lists = await this.shoppingListModel
      .find({
        familyId,
        createdAt: { $gte: query.startDate, $lte: query.endDate },
      })
      .exec();

    const totalItems = lists.reduce((sum, list) => sum + list.items.length, 0);
    const boughtItems = lists.reduce(
      (sum, list) =>
        sum + list.items.filter((item) => item.status === 'bought').length,
      0,
    );

    return {
      totalLists: lists.length,
      activeLists: lists.filter((list) => list.status === 'active').length,
      completedLists: lists.filter((list) => list.status === 'completed').length,
      archivedLists: lists.filter((list) => list.status === 'archived').length,
      totalItems,
      boughtItems,
      completionRate: totalItems > 0 ? boughtItems / totalItems : 0,
    };
  }

  private async getPantrySummary(familyId: Types.ObjectId) {
    const statusCounts = await this.pantryItemModel.aggregate([
      { $match: { familyId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const locationCounts = await this.pantryItemModel.aggregate([
      { $match: { familyId, status: 'active' } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
    ]);

    return {
      byStatus: Object.fromEntries(
        statusCounts.map((item) => [item._id, item.count]),
      ),
      byLocation: Object.fromEntries(
        locationCounts.map((item) => [item._id, item.count]),
      ),
    };
  }

  private async getInventorySummary(
    familyId: Types.ObjectId,
    query: ReportDateRangeQueryDto,
  ) {
    const eventCounts = await this.inventoryEventModel.aggregate([
      {
        $match: {
          familyId,
          createdAt: { $gte: query.startDate, $lte: query.endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantityDelta: { $sum: '$quantityDelta' },
        },
      },
    ]);

    return {
      byEventType: Object.fromEntries(
        eventCounts.map((item) => [
          item._id,
          {
            count: item.count,
            totalQuantityDelta: item.totalQuantityDelta,
          },
        ]),
      ),
    };
  }

  private async getWasteSummary(
    familyId: Types.ObjectId,
    query: ReportDateRangeQueryDto,
  ) {
    const [waste] = await this.inventoryEventModel.aggregate([
      {
        $match: {
          familyId,
          createdAt: { $gte: query.startDate, $lte: query.endDate },
          type: { $in: ['wasted', 'expired'] },
        },
      },
      {
        $group: {
          _id: null,
          eventCount: { $sum: 1 },
          totalWastedQuantity: { $sum: { $abs: '$quantityDelta' } },
        },
      },
    ]);

    return {
      eventCount: waste?.eventCount ?? 0,
      totalWastedQuantity: waste?.totalWastedQuantity ?? 0,
    };
  }

  private getActiveFamilyId(user: AuthenticatedUser) {
    return resolveActiveFamilyId(this.familyModel, user);
  }
}
