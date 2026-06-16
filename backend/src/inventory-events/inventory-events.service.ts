import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  InventoryEvent,
  INVENTORY_EVENT_SOURCES,
  INVENTORY_EVENT_TYPES,
} from './schemas/inventory-event.schema';

export type CreateInventoryEventInput = {
  familyId: Types.ObjectId;
  pantryItemId?: Types.ObjectId;
  foodId?: Types.ObjectId;
  categoryId?: Types.ObjectId;
  name: string;
  quantityDelta: number;
  quantityAfter: number;
  unit: string;
  type: (typeof INVENTORY_EVENT_TYPES)[number];
  source?: (typeof INVENTORY_EVENT_SOURCES)[number];
  createdBy?: Types.ObjectId;
  note?: string;
  createdAt?: Date;
};

@Injectable()
export class InventoryEventsService {
  constructor(
    @InjectModel(InventoryEvent.name)
    private readonly inventoryEventModel: Model<InventoryEvent>,
  ) {}

  async create(input: CreateInventoryEventInput) {
    return this.inventoryEventModel.create(input);
  }

  async createMany(inputs: CreateInventoryEventInput[]) {
    if (inputs.length === 0) {
      return [];
    }

    return this.inventoryEventModel.insertMany(inputs);
  }
}
