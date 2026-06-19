import { createMockModel, MockModel, mockQuery } from '../../test/utils/mock-model';
import { oid } from '../../test/utils/fixtures';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let categoryModel: MockModel;
  let foodModel: MockModel;
  let unitModel: MockModel;

  beforeEach(() => {
    categoryModel = createMockModel();
    foodModel = createMockModel();
    unitModel = createMockModel();
    service = new CatalogService(
      categoryModel as never,
      foodModel as never,
      unitModel as never,
    );
  });

  describe('findAllCategories', () => {
    it('returns only active categories sorted by name, mapped to response', async () => {
      const query = mockQuery([
        { _id: oid(), name: 'Dairy', slug: 'dairy', description: 'd', icon: 'i' },
      ]);
      categoryModel.find.mockReturnValue(query);

      const result = await service.findAllCategories();

      expect(categoryModel.find).toHaveBeenCalledWith({ status: 'active' });
      expect(query.sort).toHaveBeenCalledWith({ name: 1 });
      expect(result[0]).toMatchObject({ name: 'Dairy', slug: 'dairy' });
    });
  });

  describe('findAllFoods', () => {
    it('defaults to active status and a limit of 10', async () => {
      const query = mockQuery([]);
      foodModel.find.mockReturnValue(query);

      await service.findAllFoods({} as never);

      expect(foodModel.find).toHaveBeenCalledWith({ status: 'active' });
      expect(query.limit).toHaveBeenCalledWith(10);
    });

    it('filters by exact barcode when provided', async () => {
      foodModel.find.mockReturnValue(mockQuery([]));

      await service.findAllFoods({ barcode: '8938505970013' } as never);

      expect(foodModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ barcode: '8938505970013' }),
      );
    });

    it('filters foods by categoryId when provided', async () => {
      foodModel.find.mockReturnValue(mockQuery([]));
      const categoryId = oid().toString();

      await service.findAllFoods({ categoryId } as never);

      const filter = foodModel.find.mock.calls[0][0];
      expect(filter.categoryId.toString()).toBe(categoryId);
    });

    it('builds a case-insensitive escaped regex $or for the search term', async () => {
      foodModel.find.mockReturnValue(mockQuery([]));

      await service.findAllFoods({ q: ' a.b ', limit: 5 } as never);

      const filter = foodModel.find.mock.calls[0][0];
      // term is trimmed and regex-escaped (the dot becomes \.)
      expect(filter.$or).toEqual([
        { name: { $regex: 'a\\.b', $options: 'i' } },
        { normalizedName: { $regex: 'a\\.b', $options: 'i' } },
        { aliases: { $regex: 'a\\.b', $options: 'i' } },
      ]);
    });

    it('maps food documents to the response shape', async () => {
      const categoryId = oid();
      foodModel.find.mockReturnValue(
        mockQuery([
          {
            _id: oid(),
            name: 'Milk',
            categoryId,
            defaultUnit: 'l',
            aliases: ['sữa'],
            defaultStorageLocation: 'fridge',
            defaultShelfLifeDays: 7,
            storageTips: 'cold',
            imageUrl: undefined,
            barcode: undefined,
          },
        ]),
      );

      const result = await service.findAllFoods({} as never);

      expect(result[0]).toMatchObject({
        name: 'Milk',
        categoryId: categoryId.toString(),
        defaultUnit: 'l',
      });
    });
  });

  describe('findAllUnits', () => {
    it('returns only active units sorted by code', async () => {
      const query = mockQuery([
        { _id: oid(), code: 'g', name: 'gram', type: 'mass' },
      ]);
      unitModel.find.mockReturnValue(query);

      const result = await service.findAllUnits();

      expect(unitModel.find).toHaveBeenCalledWith({ status: 'active' });
      expect(query.sort).toHaveBeenCalledWith({ code: 1 });
      expect(result[0]).toMatchObject({ code: 'g', name: 'gram' });
    });
  });
});
