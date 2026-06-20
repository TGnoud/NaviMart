import { Injectable, Logger } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Family } from '../families/schemas/family.schema';
import { PantryItem } from '../pantry/schemas/pantry-item.schema';
import {
  DEFAULT_EXPIRY_WARNING_DAYS,
  addDays,
  getExpiryStatus,
  getStartOfDay,
} from '../pantry/utils/expiry-status.util';
import { RealtimeService } from '../realtime/realtime.service';
import { User } from '../users/schemas/user.schema';
import {
  CreateNotificationInput,
  NotificationsService,
} from './notifications.service';

@Injectable()
export class ExpiryNotificationsService {
  private readonly logger = new Logger(ExpiryNotificationsService.name);

  constructor(
    @InjectModel(PantryItem.name)
    private readonly pantryItemModel: Model<PantryItem>,
    @InjectModel(Family.name) private readonly familyModel: Model<Family>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly notificationsService: NotificationsService,
    private readonly realtimeService: RealtimeService,
  ) {}

  @Cron(process.env.EXPIRY_NOTIFICATION_CRON ?? '0 8 * * *')
  async createExpiryNotifications() {
    const now = new Date();
    const todayKey = getStartOfDay(now).toISOString().slice(0, 10);
    const scanUntil = addDays(
      getStartOfDay(now),
      DEFAULT_EXPIRY_WARNING_DAYS + 1,
    );

    const pantryItems = await this.pantryItemModel
      .find({
        status: 'active',
        expiryDate: { $lt: scanUntil },
        quantity: { $gt: 0 },
      })
      .lean()
      .exec();

    const notifications: CreateNotificationInput[] = [];

    for (const item of pantryItems) {
      const family = await this.familyModel
        .findById(item.familyId)
        .select('members')
        .lean()
        .exec();

      if (!family) {
        continue;
      }

      const activeMemberIds = family.members
        .filter((member) => member.status === 'active')
        .map((member) => member.userId);

      const users = await this.userModel
        .find({
          _id: { $in: activeMemberIds },
          status: 'active',
          'notificationSettings.expiryReminder': true,
        })
        .select('_id notificationSettings')
        .lean()
        .exec();

      for (const user of users) {
        const warningDays =
          user.notificationSettings?.expiryReminderDays ??
          DEFAULT_EXPIRY_WARNING_DAYS;
        const expiryStatus = getExpiryStatus(item.expiryDate, warningDays, now);

        if (expiryStatus === 'safe') {
          continue;
        }

        const type =
          expiryStatus === 'expired' ? 'pantry_expired' : 'pantry_expiring';

        notifications.push({
          userId: user._id,
          familyId: item.familyId,
          type,
          title:
            expiryStatus === 'expired'
              ? `${item.name} đã hết hạn`
              : `${item.name} sắp hết hạn`,
          body:
            expiryStatus === 'expired'
              ? `${item.name} đã quá hạn sử dụng. Hãy kiểm tra và đánh dấu lãng phí nếu cần.`
              : `${item.name} sẽ hết hạn vào ${item.expiryDate.toISOString().slice(0, 10)}.`,
          data: {
            pantryItemId: item._id.toString(),
            foodId: item.foodId?.toString(),
            categoryId: item.categoryId?.toString(),
            expiryDate: item.expiryDate.toISOString(),
            expiryStatus,
          },
          dedupeKey: `${type}:${user._id.toString()}:${item._id.toString()}:${todayKey}`,
        });
      }
    }

    const result =
      await this.notificationsService.createManyDeduped(notifications);

    for (const notification of result.created) {
      this.realtimeService.emitToUser(
        notification.userId,
        'notification:new',
        notification,
      );
    }

    this.logger.log(
      `Created ${result.createdCount} expiry notifications from ${pantryItems.length} pantry items`,
    );

    return result;
  }

  @Timeout(5000)
  async createExpiryNotificationsOnStartup() {
    await this.notificationsService.normalizeLegacyVietnameseText();
    await this.createExpiryNotifications();
  }
}
