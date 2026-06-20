import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  createMockModel,
  MockModel,
  mockQuery,
} from '../../test/utils/mock-model';
import { makeFamily, makeUser, oid } from '../../test/utils/fixtures';
import { ShoppingListsService } from './shopping-lists.service';

function makeListItem(overrides: Record<string, unknown> = {}) {
  return {
    _id: oid(),
    foodId: undefined as Types.ObjectId | undefined,
    categoryId: undefined as Types.ObjectId | undefined,
    name: 'Milk',
    quantity: 1,
    unit: 'l',
    checked: false,
    status: 'pending',
    note: undefined as string | undefined,
    boughtAt: undefined as Date | undefined,
    ...overrides,
  };
}

function makeListDoc(overrides: Record<string, unknown> = {}) {
  const doc = {
    _id: oid(),
    familyId: oid(),
    name: 'Groceries',
    type: 'custom',
    status: 'active',
    plannedFor: undefined as Date | undefined,
    completedAt: undefined as Date | undefined,
    createdBy: oid(),
    items: [] as Array<Record<string, unknown>>,
    save: jest.fn(),
    ...overrides,
  };
  doc.save = (overrides.save as jest.Mock) ?? jest.fn().mockResolvedValue(doc);
  return doc;
}

describe('ShoppingListsService', () => {
  let service: ShoppingListsService;
  let shoppingListModel: MockModel;
  let familyModel: MockModel;
  let foodModel: MockModel;
  let categoryModel: MockModel;
  let pantryItemModel: MockModel;
  let inventoryEventsService: { create: jest.Mock; createMany: jest.Mock };
  let realtimeService: { emitToFamily: jest.Mock };
  let user: ReturnType<typeof makeUser>;

  beforeEach(() => {
    shoppingListModel = createMockModel();
    familyModel = createMockModel();
    foodModel = createMockModel();
    categoryModel = createMockModel();
    pantryItemModel = createMockModel();
    inventoryEventsService = {
      create: jest.fn().mockResolvedValue(undefined),
      createMany: jest.fn().mockResolvedValue(undefined),
    };
    realtimeService = { emitToFamily: jest.fn() };
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

    service = new ShoppingListsService(
      shoppingListModel as never,
      familyModel as never,
      foodModel as never,
      categoryModel as never,
      pantryItemModel as never,
      inventoryEventsService as never,
      realtimeService as never,
    );
  });

  describe('findOne', () => {
    it('throws NotFound when the list is not in the family', async () => {
      shoppingListModel.findOne.mockReturnValue(mockQuery(null));
      await expect(
        service.findOne(user, oid().toString()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a list and broadcasts the update', async () => {
      const created = makeListDoc();
      shoppingListModel.create.mockResolvedValue(created);

      const result = await service.create(user, { name: 'Groceries' } as never);

      expect(result.id).toBe(created._id.toString());
      expect(realtimeService.emitToFamily).toHaveBeenCalledWith(
        created.familyId.toString(),
        'shoppingList:updated',
        expect.objectContaining({ id: created._id.toString() }),
      );
    });
  });

  describe('updateItem', () => {
    it('syncs status/boughtAt when an item is checked', async () => {
      const item = makeListItem();
      const list = makeListDoc({ items: [item] });
      shoppingListModel.findOne.mockReturnValue(mockQuery(list));

      await service.updateItem(user, list._id.toString(), item._id.toString(), {
        checked: true,
      } as never);

      expect(item.checked).toBe(true);
      expect(item.status).toBe('bought');
      expect(item.boughtAt).toBeInstanceOf(Date);
    });

    it('throws NotFound for an unknown item', async () => {
      const list = makeListDoc({ items: [] });
      shoppingListModel.findOne.mockReturnValue(mockQuery(list));
      await expect(
        service.updateItem(user, list._id.toString(), oid().toString(), {
          name: 'x',
        } as never),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('filters by family (and status when given) and maps responses', async () => {
      const query = mockQuery([makeListDoc()]);
      shoppingListModel.find.mockReturnValue(query);

      const result = await service.findAll(user, { status: 'active' } as never);

      const filter = shoppingListModel.find.mock.calls[0][0];
      expect(filter.status).toBe('active');
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('stamps completedAt when the status moves to completed', async () => {
      const list = makeListDoc({ status: 'active' });
      shoppingListModel.findOne.mockReturnValue(mockQuery(list));

      await service.update(user, list._id.toString(), {
        status: 'completed',
      } as never);

      expect(list.status).toBe('completed');
      expect(list.completedAt).toBeInstanceOf(Date);
      expect(realtimeService.emitToFamily).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('archives the list and broadcasts a removal', async () => {
      const list = makeListDoc();
      shoppingListModel.findOne.mockReturnValue(mockQuery(list));

      const result = await service.remove(user, list._id.toString());

      expect(list.status).toBe('archived');
      expect(realtimeService.emitToFamily).toHaveBeenCalledWith(
        list.familyId.toString(),
        'shoppingList:removed',
        { id: list._id.toString() },
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('addItem / removeItem', () => {
    it('appends an ad-hoc item (validating its category) and saves', async () => {
      const list = makeListDoc({ items: [] });
      // Mongoose stamps an _id on subdocuments at push time; mimic that so the
      // response mapper (which reads item._id) behaves like production.
      const realPush = list.items.push.bind(list.items);
      list.items.push = (...items: Array<Record<string, unknown>>) => {
        items.forEach((item) => {
          item._id = oid();
        });
        return realPush(...items);
      };
      shoppingListModel.findOne.mockReturnValue(mockQuery(list));
      categoryModel.exists.mockReturnValue(mockQuery({ _id: oid() }));

      await service.addItem(user, list._id.toString(), {
        name: 'Bread',
        quantity: 2,
        unit: 'loaf',
        categoryId: oid().toString(),
      } as never);

      expect(categoryModel.exists).toHaveBeenCalled();
      expect(list.items).toHaveLength(1);
      expect(list.save).toHaveBeenCalled();
    });

    it('removes an item by id', async () => {
      const item = makeListItem();
      const list = makeListDoc({ items: [item] });
      shoppingListModel.findOne.mockReturnValue(mockQuery(list));

      await service.removeItem(user, list._id.toString(), item._id.toString());

      expect(list.items).toHaveLength(0);
      expect(list.save).toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('rejects completing an already-completed list', async () => {
      shoppingListModel.findOne.mockReturnValue(
        mockQuery(makeListDoc({ status: 'completed' })),
      );
      await expect(
        service.complete(user, oid().toString(), {} as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects completing a list with no checked items', async () => {
      shoppingListModel.findOne.mockReturnValue(
        mockQuery(makeListDoc({ items: [makeListItem({ checked: false })] })),
      );
      await expect(
        service.complete(user, oid().toString(), {} as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates a new pantry item when nothing matches, and completes the list', async () => {
      const boughtItem = makeListItem({
        name: 'Eggs',
        quantity: 12,
        unit: 'pcs',
        checked: true,
        status: 'bought',
      });
      const list = makeListDoc({ items: [boughtItem] });
      shoppingListModel.findOne.mockReturnValue(mockQuery(list));
      foodModel.find.mockReturnValue(mockQuery([]));

      // No existing active item matches -> findOneAndUpdate returns null.
      pantryItemModel.findOneAndUpdate.mockReturnValue(mockQuery(null));
      pantryItemModel.create.mockResolvedValue({
        _id: oid(),
        familyId: list.familyId,
        name: 'Eggs',
        quantity: 12,
        unit: 'pcs',
        expiryDate: new Date('2099-01-01'),
        location: 'fridge',
        status: 'active',
        source: 'shopping',
      });

      const result = await service.complete(user, list._id.toString(), {
        defaultExpiryDays: 7,
      } as never);

      expect(pantryItemModel.findOneAndUpdate).toHaveBeenCalled();
      expect(pantryItemModel.create).toHaveBeenCalled();
      expect(inventoryEventsService.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: 'added', source: 'shopping' }),
        ]),
      );
      expect(list.status).toBe('completed');
      expect(list.completedAt).toBeInstanceOf(Date);
      expect(result.pantryItems).toHaveLength(1);
      expect(result.pantryItems[0].name).toBe('Eggs');
    });

    it('merges into an existing active item with the same food, unit and expiry day', async () => {
      const boughtItem = makeListItem({
        name: 'Eggs',
        quantity: 6,
        unit: 'pcs',
        checked: true,
        status: 'bought',
      });
      const list = makeListDoc({ items: [boughtItem] });
      shoppingListModel.findOne.mockReturnValue(mockQuery(list));
      foodModel.find.mockReturnValue(mockQuery([]));

      // An existing active item matches -> findOneAndUpdate returns the merged doc.
      const mergedDoc = {
        _id: oid(),
        familyId: list.familyId,
        name: 'Eggs',
        quantity: 18,
        unit: 'pcs',
        expiryDate: new Date('2099-01-01'),
        location: 'fridge',
        status: 'active',
        source: 'shopping',
      };
      pantryItemModel.findOneAndUpdate.mockReturnValue(mockQuery(mergedDoc));

      const result = await service.complete(user, list._id.toString(), {
        defaultExpiryDays: 7,
      } as never);

      expect(pantryItemModel.findOneAndUpdate).toHaveBeenCalled();
      // No new row is created when an existing item absorbs the purchase.
      expect(pantryItemModel.create).not.toHaveBeenCalled();
      expect(result.pantryItems).toHaveLength(1);
      expect(result.pantryItems[0].quantity).toBe(18);
    });
  });
});
