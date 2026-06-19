import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { Notification } from './schemas/notification.schema';

export type CreateNotificationInput = {
  userId: Types.ObjectId;
  familyId?: Types.ObjectId;
  type: Notification['type'];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  dedupeKey: string;
};

export type NotificationResponse = {
  id: string;
  userId: string;
  familyId?: string;
  type: Notification['type'];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: Date;
  createdAt?: Date;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async findAll(user: AuthenticatedUser, query: ListNotificationsQueryDto) {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(user.userId),
    };

    if (query.unreadOnly) {
      filter.readAt = { $exists: false };
    }

    const notifications = await this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(query.limit ?? 50)
      .exec();

    return notifications.map((notification) =>
      this.toNotificationResponse(notification),
    );
  }

  async markAsRead(user: AuthenticatedUser, notificationId: string) {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        {
          _id: notificationId,
          userId: user.userId,
        },
        {
          $set: {
            readAt: new Date(),
          },
        },
        { new: true },
      )
      .exec();

    return notification ? this.toNotificationResponse(notification) : null;
  }

  async markAllAsRead(user: AuthenticatedUser) {
    const result = await this.notificationModel
      .updateMany(
        {
          userId: user.userId,
          readAt: { $exists: false },
        },
        {
          $set: {
            readAt: new Date(),
          },
        },
      )
      .exec();

    return { modifiedCount: result.modifiedCount };
  }

  async normalizeLegacyVietnameseText() {
    const updates = await Promise.all([
      this.notificationModel
        .updateMany(
          {
            type: 'pantry_expiring',
            $or: [
              { title: / sap het han$/ },
              { body: / se het han vao / },
            ],
          },
          [
            {
              $set: {
                title: {
                  $replaceAll: {
                    input: '$title',
                    find: ' sap het han',
                    replacement: ' sắp hết hạn',
                  },
                },
                body: {
                  $replaceAll: {
                    input: '$body',
                    find: ' se het han vao ',
                    replacement: ' sẽ hết hạn vào ',
                  },
                },
              },
            },
          ] as never,
        )
        .exec(),
      this.notificationModel
        .updateMany(
          {
            type: 'pantry_expired',
            $or: [
              { title: / da het han$/ },
              { body: / da qua han su dung/ },
            ],
          },
          [
            {
              $set: {
                title: {
                  $replaceAll: {
                    input: '$title',
                    find: ' da het han',
                    replacement: ' đã hết hạn',
                  },
                },
                body: {
                  $replaceAll: {
                    input: {
                      $replaceAll: {
                        input: '$body',
                        find: ' da qua han su dung.',
                        replacement: ' đã quá hạn sử dụng.',
                      },
                    },
                    find: ' Hay kiem tra va danh dau lang phi neu can.',
                    replacement:
                      ' Hãy kiểm tra và đánh dấu lãng phí nếu cần.',
                  },
                },
              },
            },
          ] as never,
        )
        .exec(),
      this.notificationModel
        .updateMany(
          { title: 'Thuc pham sap het han' },
          { $set: { title: 'Thực phẩm sắp hết hạn' } },
        )
        .exec(),
      this.notificationModel
        .updateMany(
          { body: 'Ca hoi se het han trong 1 ngay. Hay len mon an phu hop.' },
          {
            $set: {
              body: 'Cá hồi sẽ hết hạn trong 1 ngày. Hãy lên món ăn phù hợp.',
            },
          },
        )
        .exec(),
      this.notificationModel
        .updateMany(
          { title: 'Thuc pham da qua han' },
          { $set: { title: 'Thực phẩm đã quá hạn' } },
        )
        .exec(),
      this.notificationModel
        .updateMany(
          { body: 'Chuoi da qua han. Kiem tra kho de xu ly.' },
          { $set: { body: 'Chuối đã quá hạn. Kiểm tra kho để xử lý.' } },
        )
        .exec(),
      this.notificationModel
        .updateMany(
          { title: 'Nhac mua sam' },
          { $set: { title: 'Nhắc mua sắm' } },
        )
        .exec(),
      this.notificationModel
        .updateMany(
          { body: 'Danh sach Di cho hom nay van con mon chua mua.' },
          {
            $set: {
              body: 'Danh sách Đi chợ hôm nay vẫn còn món chưa mua.',
            },
          },
        )
        .exec(),
    ]);

    return {
      modifiedCount: updates.reduce(
        (sum, result) => sum + (result.modifiedCount ?? 0),
        0,
      ),
    };
  }

  async createManyDeduped(inputs: CreateNotificationInput[]) {
    if (inputs.length === 0) {
      return { createdCount: 0, created: [] as NotificationResponse[] };
    }

    const operations = inputs.map((input) => ({
      updateOne: {
        filter: { dedupeKey: input.dedupeKey },
        update: {
          $setOnInsert: input,
        },
        upsert: true,
      },
    }));

    const result = await this.notificationModel.bulkWrite(operations, {
      ordered: false,
    });

    const upsertedIds = Object.values(result.upsertedIds ?? {});
    const createdNotifications =
      upsertedIds.length > 0
        ? await this.notificationModel
            .find({ _id: { $in: upsertedIds } })
            .exec()
        : [];

    return {
      createdCount: result.upsertedCount,
      created: createdNotifications.map((notification) =>
        this.toNotificationResponse(notification),
      ),
    };
  }

  private toNotificationResponse(notification: Notification) {
    return {
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      familyId: notification.familyId?.toString(),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      readAt: notification.readAt,
      createdAt: (notification as Notification & { createdAt?: Date }).createdAt,
    };
  }
}
