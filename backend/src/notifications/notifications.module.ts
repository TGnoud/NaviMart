import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Family, FamilySchema } from '../families/schemas/family.schema';
import { PantryItem, PantryItemSchema } from '../pantry/schemas/pantry-item.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ExpiryNotificationsService } from './expiry-notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: PantryItem.name, schema: PantryItemSchema },
      { name: Family.name, schema: FamilySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, ExpiryNotificationsService],
  exports: [NotificationsService, ExpiryNotificationsService],
})
export class NotificationsModule {}
