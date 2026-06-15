import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MealPlanDocument = HydratedDocument<MealPlan>;

export const MEAL_SESSIONS = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'custom',
] as const;

// Snapshot of exactly what was deducted from the pantry when a meal was marked
// complete, so un-marking it can restore the same quantities precisely.
@Schema({ _id: false })
export class ConsumedPantryEntry {
  @Prop({ type: Types.ObjectId, ref: 'PantryItem' })
  pantryItemId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Food' })
  foodId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId?: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Number, required: true })
  quantity!: number;

  @Prop({ type: String, required: true })
  unit!: string;

  @Prop({ type: Date })
  expiryDate?: Date;

  @Prop({ type: String })
  location?: string;
}

export const ConsumedPantryEntrySchema =
  SchemaFactory.createForClass(ConsumedPantryEntry);

@Schema({
  collection: 'mealPlans',
  timestamps: true,
})
export class MealPlan {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop({ type: String, enum: MEAL_SESSIONS, required: true })
  session!: (typeof MEAL_SESSIONS)[number];

  @Prop({ type: String, trim: true, maxlength: 80 })
  customSessionName?: string;

  @Prop({ type: Types.ObjectId, ref: 'Recipe' })
  recipeId?: Types.ObjectId;

  @Prop({ type: String, trim: true, maxlength: 200 })
  customName?: string;

  @Prop({ type: Number, default: 1, min: 1 })
  servings!: number;

  @Prop({ type: Boolean, default: false })
  isCompleted!: boolean;

  // True once the meal's ingredients have been deducted from the pantry, so we
  // never double-deduct and know whether un-completing should restore them.
  @Prop({ type: Boolean, default: false })
  ingredientsConsumed!: boolean;

  @Prop({ type: [ConsumedPantryEntrySchema], default: [] })
  consumedItems!: ConsumedPantryEntry[];

  // The shopping list auto-created for this meal's ingredient shortfall, so it
  // can be reused/cleaned up instead of duplicated when toggling completion.
  @Prop({ type: Types.ObjectId, ref: 'ShoppingList' })
  shortageListId?: Types.ObjectId;

  @Prop({ type: String, trim: true, maxlength: 300 })
  note?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;
}

export const MealPlanSchema = SchemaFactory.createForClass(MealPlan);

MealPlanSchema.index({ familyId: 1, date: 1, session: 1 });
MealPlanSchema.index({ familyId: 1, recipeId: 1 });
