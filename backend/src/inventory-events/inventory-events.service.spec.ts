import { Types } from 'mongoose';
import { oid } from '../../test/utils/fixtures';
import { InventoryEventsService } from './inventory-events.service';

function makeInput(overrides: Record<string, unknown> = {}) {
  return {
    familyId: oid(),
    pantryItemId: oid(),
    name: 'Milk',
    quantityDelta: 1,
    quantityAfter: 2,
    unit: 'l',
    type: 'added',
    source: 'manual',
    createdBy: oid(),
    ...overrides,
  };
}

describe('InventoryEventsService', () => {
  it('creates and saves a single event with default timestamps', async () => {
    const saved = { _id: oid() };
    const save = jest.fn().mockResolvedValue(saved);
    const Model = jest.fn(() => ({ save }));
    const service = new InventoryEventsService(Model as never);
    const input = makeInput();

    const result = await service.create(input as never);

    expect(Model).toHaveBeenCalledWith(input);
    expect(save).toHaveBeenCalledWith();
    expect(result).toBe(saved);
  });

  it('preserves manual createdAt values by disabling timestamps', async () => {
    const createdAt = new Date('2026-06-01T00:00:00.000Z');
    let doc: Record<string, unknown> = {};
    const save = jest.fn().mockResolvedValue('saved');
    const Model = jest.fn((input) => {
      doc = { ...input, save };
      return doc;
    });
    const service = new InventoryEventsService(Model as never);

    const result = await service.create(
      makeInput({ createdAt }) as Parameters<InventoryEventsService['create']>[0],
    );

    expect(doc.createdAt).toBe(createdAt);
    expect(save).toHaveBeenCalledWith({ timestamps: false });
    expect(result).toBe('saved');
  });

  it('returns early for empty createMany input', async () => {
    const Model = Object.assign(jest.fn(), { insertMany: jest.fn() });
    const service = new InventoryEventsService(Model as never);

    await expect(service.createMany([])).resolves.toEqual([]);
    expect(Model.insertMany).not.toHaveBeenCalled();
  });

  it('inserts many events with timestamps disabled', async () => {
    const docs = [{ _id: new Types.ObjectId() }];
    const Model = Object.assign(jest.fn(), {
      insertMany: jest.fn().mockResolvedValue(docs),
    });
    const service = new InventoryEventsService(Model as never);
    const inputs = [makeInput() as never];

    await expect(service.createMany(inputs)).resolves.toBe(docs);
    expect(Model.insertMany).toHaveBeenCalledWith(inputs, {
      timestamps: false,
    });
  });
});
