import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RecipeDocument = HydratedDocument<Recipe>;

export const RECIPE_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export const RECIPE_STATUSES = ['pending', 'approved', 'rejected', 'archived'] as const;
export const RECIPE_VISIBILITIES = ['personal', 'shared'] as const;

@Schema({ _id: false })
export class RecipeIngredient {
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
  optional!: boolean;
}

export const RecipeIngredientSchema =
  SchemaFactory.createForClass(RecipeIngredient);

@Schema({ _id: false })
export class RecipeNutrition {
  @Prop({ type: Number, min: 0 })
  calories?: number;

  @Prop({ type: Number, min: 0 })
  protein?: number;

  @Prop({ type: Number, min: 0 })
  carbs?: number;

  @Prop({ type: Number, min: 0 })
  fat?: number;
}

export const RecipeNutritionSchema =
  SchemaFactory.createForClass(RecipeNutrition);

@Schema({
  collection: 'recipes',
  timestamps: true,
})
export class Recipe {
  _id!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true, maxlength: 200 })
  name!: string;

  @Prop({ type: String, required: true, trim: true, lowercase: true })
  normalizedName!: string;

  @Prop({ type: String, trim: true, maxlength: 800 })
  description?: string;

  @Prop({ type: String, trim: true })
  imageUrl?: string;

  @Prop({ type: Number, required: true, min: 1 })
  cookTimeMinutes!: number;

  @Prop({ type: String, enum: RECIPE_DIFFICULTIES, default: 'easy' })
  difficulty!: (typeof RECIPE_DIFFICULTIES)[number];

  @Prop({ type: Number, default: 1, min: 1 })
  servings!: number;

  @Prop({ type: [RecipeIngredientSchema], default: [] })
  ingredients!: RecipeIngredient[];

  @Prop({ type: [String], default: [] })
  steps!: string[];

  @Prop({ type: RecipeNutritionSchema, default: () => ({}) })
  nutrition!: RecipeNutrition;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  authorId?: Types.ObjectId;

  @Prop({ type: String, enum: RECIPE_STATUSES, default: 'pending' })
  status!: (typeof RECIPE_STATUSES)[number];

  @Prop({ type: String, enum: RECIPE_VISIBILITIES, default: 'shared' })
  visibility!: (typeof RECIPE_VISIBILITIES)[number];

  @Prop({ type: String, trim: true, maxlength: 300 })
  moderationNote?: string;

  @Prop({ type: Number, default: 0, min: 0 })
  favoritesCount!: number;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);

RecipeSchema.index({ status: 1, difficulty: 1, cookTimeMinutes: 1 });
RecipeSchema.index({ visibility: 1, status: 1 });
RecipeSchema.index({ status: 1, favoritesCount: -1 });
RecipeSchema.index({ 'ingredients.foodId': 1 });
RecipeSchema.index({ 'ingredients.categoryId': 1 });
RecipeSchema.index({ authorId: 1, createdAt: -1 });
RecipeSchema.index({
  name: 'text',
  normalizedName: 'text',
  description: 'text',
  'ingredients.name': 'text',
  tags: 'text',
});
