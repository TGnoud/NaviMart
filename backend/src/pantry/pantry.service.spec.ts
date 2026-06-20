import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  createMockModel,
  MockModel,
  mockQuery,
} from '../../test/utils/mock-model';
import { makeFamily, makeUser, oid } from '../../test/utils/fixtures';
import { PantryService } from './pantry.service';

function makePantryDoc(overrides: Record<string, unknown> = {}) {
  const doc = {
    _id: oid(),
    familyId: oid(),
    foodId: oid(),
    categoryId: oid(),
    name: 'Milk',
    quantity: 5,
    unit: 'l',
    expiryDate: new Date('2099-01-01'),
    location: 'fridge',
    status: 'active',
    source: 'manual',
    createdBy: oid(),
    note: undefined as string | undefined,
    consumedAt: undefined as Date | undefined,
    wastedAt: undefined as Date | undefined,
    save: jest.fn(),
    deleteOne: jest.fn(),
    ...overrides,
  };
  doc.save = (overrides.save as jest.Mock) ?? jest.fn().mockResolvedValue(doc);
  doc.deleteOne =
    (overrides.deleteOne as jest.Mock) ?? jest.fn().mockResolvedValue(doc);
  return doc;
}

describe('PantryService', () => {
  let service: PantryService;
  let pantryItemModel: MockModel;
  let familyModel: MockModel;
  let foodModel: MockModel;
  let categoryModel: MockModel;
  let inventoryEventsService: { create: jest.Mock };
  let user: ReturnType<typeof makeUser>;

  beforeEach(() => {
    pantryItemModel = createMockModel();
    familyModel = createMockModel();
    foodModel = createMockModel();
    categoryModel = createMockModel();
    inventoryEventsService = { create: jest.fn().mockResolvedValue(undefined) };
    user = makeUser();

    familyModel.findById.mockReturnValue(
      mockQuery(
        makeFamily({
          members: [
            { userId: new Types.ObjectId(user.userId), status: 'active' },
          ],
        }),
      ),
    );

    service = new PantryService(
      pantryItemModel as never,
      familyModel as never,
      foodModel as never,
      categoryModel as never,
      inventoryEventsService as never,
    );
  });

  describe('findAll buildFilter', () => {
    it('defaults to active status and adds a case-insensitive name regex', async () => {
      const query = mockQuery([]);
      pantryItemModel.find.mockReturnValue(query);

      await service.findAll(user, { q: '  sua  ' } as never);

      const filter = pantryItemModel.find.mock.calls[0][0];
      expect(filter.status).toBe('active');
      expect(filter.name).toEqual({ $regex: 'sua', $options: 'i' });
      expect(query.sort).toHaveBeenCalledWith({ expiryDate: 1, createdAt: -1 });
    });
  });

  describe('findOne', () => {
    it('throws NotFound when the item does not belong to the family', async () => {
      pantryItemModel.findOne.mockReturnValue(mockQuery(null));
      await expect(
        service.findOne(user, oid().toString()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('consume', () => {
    it('rejects consuming a non-active item', async () => {
      pantryItemModel.findOne.mockReturnValue(
        mockQuery(makePantryDoc({ status: 'used_up' })),
      );
      await expect(
        service.consume(user, oid().toString(), { quantity: 1 } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects consuming more than the current stock', async () => {
      pantryItemModel.findOne.mockReturnValue(
        mockQuery(makePantryDoc({ quantity: 2 })),
      );
      await expect(
        service.consume(user, oid().toString(), { quantity: 3 } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deducts atomically (guarded), marks used_up when fully consumed, and records an event', async () => {
      const doc = makePantryDoc({ quantity: 2 });
      pantryItemModel.findOne.mockReturnValue(mockQuery(doc));
      // The atomic decrement returns the post-update document.
      const updated = makePantryDoc({
        _id: doc._id,
        quantity: 0,
        status: 'used_up',
        consumedAt: new Date(),
      });
      pantryItemModel.findOneAndUpdate = jest.fn(() => mockQuery(updated));

      const result = await service.consume(user, doc._id.toString(), {
        quantity: 2,
      } as never);

      // Guarded by a stock floor so concurrent consumes cannot oversell.
      const [filter, update] = pantryItemModel.findOneAndUpdate.mock.calls[0];
      expect(filter).toMatchObject({ status: 'active', quantity: { $gte: 2 } });
      expect(Array.isArray(update)).toBe(true); // aggregation-pipeline update
      expect(inventoryEventsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'consumed',
          quantityDelta: -2,
          quantityAfter: 0,
        }),
      );
      expect(result.status).toBe('used_up');
    });

    it('rejects when a concurrent consume already drained the stock', async () => {
      const doc = makePantryDoc({ quantity: 2 });
      pantryItemModel.findOne.mockReturnValue(mockQuery(doc));
      // Guarded update matches nothing → another request won the race.
      pantryItemModel.findOneAndUpdate = jest.fn(() => mockQuery(null));

      await expect(
        service.consume(user, doc._id.toString(), { quantity: 2 } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(inventoryEventsService.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('reactivates a used_up item when quantity becomes positive', async () => {
      const doc = makePantryDoc({ status: 'used_up', quantity: 0 });
      pantryItemModel.findOne.mockReturnValue(mockQuery(doc));

      await service.update(user, doc._id.toString(), { quantity: 3 } as never);

      expect(doc.status).toBe('active');
      expect(doc.quantity).toBe(3);
      expect(inventoryEventsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'adjusted' }),
      );
    });

    it('replaces item fields from the catalog when foodId changes', async () => {
      const doc = makePantryDoc();
      pantryItemModel.findOne.mockReturnValue(mockQuery(doc));
      const food = makeFood({ name: 'Cheese', defaultUnit: 'g' });
      foodModel.findOne.mockReturnValue(mockQuery(food));

      await service.update(user, doc._id.toString(), {
        foodId: food._id.toString(),
      } as never);

      expect(doc.name).toBe('Cheese');
      expect(doc.unit).toBe('g');
    });

    it('validates a new categoryId via the category catalog', async () => {
      const doc = makePantryDoc();
      pantryItemModel.findOne.mockReturnValue(mockQuery(doc));
      categoryModel.exists.mockReturnValue(mockQuery({ _id: oid() }));

      await service.update(user, doc._id.toString(), {
        categoryId: oid().toString(),
      } as never);

      expect(categoryModel.exists).toHaveBeenCalled();
    });

    it('records a wasted event when status changes to wasted', async () => {
      const doc = makePantryDoc({ status: 'active' });
      pantryItemModel.findOne.mockReturnValue(mockQuery(doc));

      await service.update(user, doc._id.toString(), {
        status: 'wasted',
      } as never);

      expect(doc.status).toBe('wasted');
      expect(inventoryEventsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'wasted' }),
      );
    });
  });

  describe('markWasted', () => {
    it('sets the item wasted and records a wasted event', async () => {
      const doc = makePantryDoc();
      pantryItemModel.findOne.mockReturnValue(mockQuery(doc));

      const result = await service.markWasted(user, doc._id.toString());

      expect(doc.status).toBe('wasted');
      expect(doc.wastedAt).toBeInstanceOf(Date);
      expect(inventoryEventsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'wasted' }),
      );
      expect(result.status).toBe('wasted');
    });
  });

  describe('remove', () => {
    it('records a deleted event and deletes the document', async () => {
      const doc = makePantryDoc();
      pantryItemModel.findOne.mockReturnValue(mockQuery(doc));

      const result = await service.remove(user, doc._id.toString());

      expect(inventoryEventsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'deleted', quantityAfter: 0 }),
      );
      expect(doc.deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  function makeFood(overrides: Record<string, unknown> = {}) {
    return {
      _id: oid(),
      name: 'Milk',
      categoryId: oid(),
      defaultUnit: 'l',
      defaultStorageLocation: 'fridge',
      ...overrides,
    };
  }

  describe('create', () => {
    it('derives fields from the food catalog when a foodId is given', async () => {
      const food = makeFood({ name: 'Yogurt', defaultUnit: 'cup' });
      foodModel.findOne.mockReturnValue(mockQuery(food));
      const created = makePantryDoc();
      pantryItemModel.create.mockResolvedValue(created);

      await service.create(user, {
        foodId: food._id.toString(),
        quantity: 3,
        expiryDate: new Date('2099-01-01'),
      } as never);

      const createArg = pantryItemModel.create.mock.calls[0][0];
      expect(createArg.name).toBe('Yogurt');
      expect(createArg.unit).toBe('cup');
    });

    it('throws NotFound when the referenced food does not exist', async () => {
      foodModel.findOne.mockReturnValue(mockQuery(null));
      await expect(
        service.create(user, {
          foodId: oid().toString(),
          quantity: 1,
          expiryDate: new Date(),
        } as never),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('creates an ad-hoc item (no foodId), defaults source/location, records an added event', async () => {
      const created = makePantryDoc({ source: 'manual', location: 'fridge' });
      pantryItemModel.create.mockResolvedValue(created);

      const result = await service.create(user, {
        name: 'Eggs',
        quantity: 12,
        unit: 'pcs',
        expiryDate: new Date('2099-02-01'),
      } as never);

      const createArg = pantryItemModel.create.mock.calls[0][0];
      expect(createArg.source).toBe('manual');
      expect(createArg.location).toBe('fridge');
      expect(inventoryEventsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'added' }),
      );
      expect(result.id).toBe(created._id.toString());
    });
  });
});
