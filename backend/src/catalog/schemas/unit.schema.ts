import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UnitDocument = HydratedDocument<Unit>;

export const UNIT_TYPES = ['weight', 'volume', 'count', 'package'] as const;
export const UNIT_STATUSES = ['active', 'archived'] as const;

const UNIT_CODE_DISPLAY_MAP: Record<string, string> = {
  bo: 'bó',
  cai: 'cái',
  chai: 'chai',
  g: 'g',
  goi: 'gói',
  hop: 'hộp',
  kg: 'kg',
  l: 'l',
  ml: 'ml',
  muong: 'muỗng',
  qua: 'quả',
};

const UNIT_NAME_DISPLAY_MAP: Record<string, string> = {
  bó: 'Bó',
  cái: 'Cái',
  chai: 'Chai',
  g: 'Gam',
  gói: 'Gói',
  hộp: 'Hộp',
  kg: 'Kilôgam',
  l: 'Lít',
  ml: 'Mililít',
  muỗng: 'Muỗng',
  quả: 'Quả',
};

export function toVietnameseUnitCode(code: string) {
  return UNIT_CODE_DISPLAY_MAP[code] ?? code;
}

export function toVietnameseUnitName(code: string, name: string) {
  return UNIT_NAME_DISPLAY_MAP[toVietnameseUnitCode(code)] ?? name;
}

@Schema({
  collection: 'units',
  timestamps: true,
})
export class Unit {
  _id!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true, lowercase: true })
  code!: string;

  @Prop({ type: String, required: true, trim: true, maxlength: 80 })
  name!: string;

  @Prop({ type: String, enum: UNIT_TYPES, required: true })
  type!: (typeof UNIT_TYPES)[number];

  @Prop({ type: String, enum: UNIT_STATUSES, default: 'active' })
  status!: (typeof UNIT_STATUSES)[number];
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

UnitSchema.index({ code: 1 }, { unique: true });
UnitSchema.index({ type: 1, status: 1 });
