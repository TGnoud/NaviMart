import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserInputLogDocument = HydratedDocument<UserInputLog>;

export const USER_INPUT_LOG_SOURCES = [
  'pantry',
  'shopping_list',
  'recipe_ingredient',
] as const;

export const USER_INPUT_LOG_STATUSES = [
  'pending',
  'approved',
  'rejected',
] as const;

@Schema({
  collection: 'userInputLogs',
  timestamps: true,
})
export class UserInputLog {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Family' })
  familyId?: Types.ObjectId;

  @Prop({ type: String, enum: USER_INPUT_LOG_SOURCES, required: true })
  source!: (typeof USER_INPUT_LOG_SOURCES)[number];

  @Prop({ type: String, required: true, trim: true, maxlength: 150 })
  value!: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId?: Types.ObjectId;

  @Prop({ type: String, trim: true, maxlength: 30 })
  unit?: string;

  @Prop({ type: Types.ObjectId })
  relatedId?: Types.ObjectId;

  @Prop({ type: String, enum: USER_INPUT_LOG_STATUSES, default: 'pending' })
  status!: (typeof USER_INPUT_LOG_STATUSES)[number];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;

  @Prop({ type: Date })
  reviewedAt?: Date;

  @Prop({ type: String, trim: true, maxlength: 300 })
  note?: string;
}

export const UserInputLogSchema = SchemaFactory.createForClass(UserInputLog);

UserInputLogSchema.index({ status: 1, createdAt: -1 });
UserInputLogSchema.index({ source: 1, status: 1 });
UserInputLogSchema.index({ userId: 1, createdAt: -1 });
