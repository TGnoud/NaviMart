import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ShoppingListDocument = HydratedDocument<ShoppingList>;

export const SHOPPING_LIST_STATUSES = [
  'active',
  'completed',
  'archived',
] as const;
export const SHOPPING_LIST_TYPES = ['daily', 'weekly', 'monthly', 'custom'] as const;
export type ShoppingListType = typeof SHOPPING_LIST_TYPES[number];
export const SHOPPING_ITEM_STATUSES = ['pending', 'bought', 'skipped'] as const;

@Schema({ timestamps: true })
export class ShoppingListItem {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Food' })
  foodId?: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true, maxlength: 150 })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId?: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0.01 })
  quantity!: number;

  @Prop({ type: String, required: true, trim: true, maxlength: 30 })
  unit!: string;

  @Prop({ type: Boolean, default: false })
  checked!: boolean;

  @Prop({ type: String, enum: SHOPPING_ITEM_STATUSES, default: 'pending' })
  status!: (typeof SHOPPING_ITEM_STATUSES)[number];

  @Prop({ type: String, trim: true, maxlength: 300 })
  note?: string;

  @Prop({ type: Date })
  boughtAt?: Date;
}

export const ShoppingListItemSchema =
  SchemaFactory.createForClass(ShoppingListItem);

@Schema({
  collection: 'shoppingLists',
  timestamps: true,
})
export class ShoppingList {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({ type: String, enum: SHOPPING_LIST_TYPES, default: 'custom' })
  type!: (typeof SHOPPING_LIST_TYPES)[number];

  @Prop({ type: String, enum: SHOPPING_LIST_STATUSES, default: 'active' })
  status!: (typeof SHOPPING_LIST_STATUSES)[number];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: [ShoppingListItemSchema], default: [] })
  items!: ShoppingListItem[];

  @Prop({ type: Date })
  plannedFor?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: String, trim: true })
  recurrenceGroupId?: string;
}

export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingList);

ShoppingListSchema.index({ familyId: 1, status: 1, createdAt: -1 });
ShoppingListSchema.index({ familyId: 1, plannedFor: 1 });
ShoppingListSchema.index({ 'items.foodId': 1 });
ShoppingListSchema.index({ 'items.categoryId': 1 });
