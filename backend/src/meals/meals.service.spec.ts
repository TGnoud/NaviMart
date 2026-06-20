import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  createMockModel,
  MockModel,
  mockQuery,
} from '../../test/utils/mock-model';
import { makeFamily, makeRecipe, makeUser, oid } from '../../test/utils/fixtures';
import { MealsService } from './meals.service';

function makeMealDoc(overrides: Record<string, unknown> = {}) {
  const doc = {
    _id: oid(),
    familyId: oid(),
    date: new Date('2026-06-13'),
    session: 'dinner',
    customSessionName: undefined,
    recipeId: undefined as Types.ObjectId | undefined,
    customName: undefined,
    servings: 2,
    isCompleted: false,
    note: undefined,
    createdBy: oid(),
    save: jest.fn(),
    deleteOne: jest.fn(),
    ...overrides,
  };
  doc.save = (overrides.save as jest.Mock) ?? jest.fn().mockResolvedValue(doc);
  doc.deleteOne =
    (overrides.deleteOne as jest.Mock) ?? jest.fn().mockResolvedValue(doc);
  return doc;
}

describe('MealsService', () => {
  let service: MealsService;
  let mealPlanModel: MockModel;
  let familyModel: MockModel;
  let recipeModel: MockModel;
  let pantryItemModel: MockModel;
  let shoppingListModel: MockModel;
  let missingIngredientsService: {
    getRecipeMissingIngredients: jest.Mock;
    findMatchingPantryItems: jest.Mock;
  };
  let shoppingListGenerationService: {
    generateFromMeal: jest.Mock;
    createFromMissingItems: jest.Mock;
    removeGeneratedList: jest.Mock;
  };
  let inventoryEventsService: { create: jest.Mock; createMany: jest.Mock };
  let user: ReturnType<typeof makeUser>;

  beforeEach(() => {
    mealPlanModel = createMockModel();
    familyModel = createMockModel();
    recipeModel = createMockModel();
    pantryItemModel = createMockModel();
    shoppingListModel = createMockModel();
    missingIngredientsService = {
      getRecipeMissingIngredients: jest.fn().mockResolvedValue({ ok: true }),
      findMatchingPantryItems: jest.fn().mockReturnValue([]),
    };
    shoppingListGenerationService = {
      generateFromMeal: jest.fn().mockResolvedValue({ ok: true }),
      createFromMissingItems: jest
        .fn()
        .mockResolvedValue({ id: oid().toString(), name: 'Con thieu cho Test Recipe' }),
      removeGeneratedList: jest.fn().mockResolvedValue(undefined),
    };
    inventoryEventsService = {
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue([]),
    };
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

    service = new MealsService(
      mealPlanModel as never,
      familyModel as never,
      recipeModel as never,
      pantryItemModel as never,
      shoppingListModel as never,
      missingIngredientsService as never,
      shoppingListGenerationService as never,
      inventoryEventsService as never,
    );
  });

  describe('findAll', () => {
    it('filters by family and date range and attaches batched recipe names', async () => {
      const recipe = makeRecipe({ name: 'Pho' });
      const meal = makeMealDoc({ recipeId: recipe._id });
      const findQuery = mockQuery([meal]);
      mealPlanModel.find.mockReturnValue(findQuery);
      recipeModel.find.mockReturnValue(
        mockQuery([{ _id: recipe._id, name: 'Pho' }]),
      );

      const result = await service.findAll(user, {
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-06-30'),
      } as never);

      const filter = mealPlanModel.find.mock.calls[0][0];
      expect(filter.date).toEqual({
        $gte: new Date('2026-06-01'),
        $lte: new Date('2026-06-30'),
      });
      expect(findQuery.sort).toHaveBeenCalledWith({ date: 1, session: 1 });
      expect(result[0].recipeName).toBe('Pho');
    });
  });

  describe('create', () => {
    it('throws NotFound when the referenced recipe is missing', async () => {
      recipeModel.findOne.mockReturnValue(mockQuery(null));
      await expect(
        service.create(user, {
          date: new Date(),
          session: 'lunch',
          recipeId: oid().toString(),
        } as never),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('defaults servings from the recipe when omitted', async () => {
      const recipe = makeRecipe({ servings: 4 });
      recipeModel.findOne.mockReturnValue(mockQuery(recipe));
      const created = makeMealDoc({ recipeId: recipe._id, servings: 4 });
      mealPlanModel.create.mockResolvedValue(created);

      await service.create(user, {
        date: new Date(),
        session: 'dinner',
        recipeId: recipe._id.toString(),
      } as never);

      const createArg = mealPlanModel.create.mock.calls[0][0];
      expect(createArg.servings).toBe(4);
    });
  });

  describe('getMissingIngredients', () => {
    it('throws BadRequest when the meal has no recipe', async () => {
      mealPlanModel.findOne.mockReturnValue(
        mockQuery(makeMealDoc({ recipeId: undefined })),
      );
      await expect(
        service.getMissingIngredients(user, oid().toString()),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('delegates to the missing-ingredients service with the meal servings', async () => {
      const recipeId = oid();
      mealPlanModel.findOne.mockReturnValue(
        mockQuery(makeMealDoc({ recipeId, servings: 3 })),
      );

      await service.getMissingIngredients(user, oid().toString());

      expect(
        missingIngredientsService.getRecipeMissingIngredients,
      ).toHaveBeenCalledWith(user, recipeId.toString(), 3);
    });
  });

  describe('generateShoppingList', () => {
    it('throws BadRequest when the meal has no recipe', async () => {
      mealPlanModel.findOne.mockReturnValue(
        mockQuery(makeMealDoc({ recipeId: undefined })),
      );
      await expect(
        service.generateShoppingList(user, oid().toString(), {} as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('delegates to the generation service using the meal date as plannedFor', async () => {
      const recipeId = oid();
      const meal = makeMealDoc({ recipeId, servings: 2, date: new Date('2026-07-01') });
      mealPlanModel.findOne.mockReturnValue(mockQuery(meal));

      await service.generateShoppingList(user, oid().toString(), {} as never);

      expect(shoppingListGenerationService.generateFromMeal).toHaveBeenCalledWith(
        user,
        recipeId.toString(),
        2,
        expect.objectContaining({ plannedFor: meal.date }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFound when the meal is not in the family', async () => {
      mealPlanModel.findOne.mockReturnValue(mockQuery(null));
      await expect(
        service.findOne(user, oid().toString()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the meal with its looked-up recipe name', async () => {
      const recipeId = oid();
      mealPlanModel.findOne.mockReturnValue(
        mockQuery(makeMealDoc({ recipeId })),
      );
      recipeModel.findById.mockReturnValue(mockQuery({ name: 'Bun bo' }));

      const result = await service.findOne(user, oid().toString());
      expect(result.recipeName).toBe('Bun bo');
    });
  });

  describe('update', () => {
    it('updates simple fields and persists the meal', async () => {
      const meal = makeMealDoc({ recipeId: undefined, servings: 2 });
      mealPlanModel.findOne.mockReturnValue(mockQuery(meal));

      await service.update(user, meal._id.toString(), {
        servings: 5,
        isCompleted: true,
      } as never);

      expect(meal.servings).toBe(5);
      expect(meal.isCompleted).toBe(true);
      expect(meal.save).toHaveBeenCalled();
    });

    it('deducts recipe ingredients from the pantry when a meal is completed', async () => {
      const recipe = makeRecipe({
        servings: 2,
        ingredients: [
          { name: 'Tao', quantity: 2, unit: 'quả', optional: false },
        ],
      });
      const meal = makeMealDoc({
        recipeId: recipe._id,
        servings: 4, // 2x the recipe -> needs 4 qua
        isCompleted: false,
        ingredientsConsumed: false,
        consumedItems: [],
      });
      mealPlanModel.findOne.mockReturnValue(mockQuery(meal));
      recipeModel.findById.mockReturnValue(mockQuery(recipe));

      const pantryItem = {
        _id: oid(),
        familyId: meal.familyId,
        name: 'Tao',
        quantity: 5,
        unit: 'quả',
        status: 'active',
        expiryDate: new Date('2026-06-25'),
        location: 'fridge',
        save: jest.fn().mockResolvedValue(undefined),
      };
      pantryItemModel.find.mockReturnValue(mockQuery([pantryItem]));
      missingIngredientsService.findMatchingPantryItems.mockReturnValue([
        pantryItem,
      ]);

      await service.update(user, meal._id.toString(), {
        isCompleted: true,
      } as never);

      // 4 of 5 consumed, item stays active with 1 left
      expect(pantryItem.quantity).toBe(1);
      expect(pantryItem.save).toHaveBeenCalled();
      expect(inventoryEventsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'consumed', source: 'meal', quantityDelta: -4 }),
      );
      expect(meal.ingredientsConsumed).toBe(true);
      expect(meal.consumedItems).toHaveLength(1);
    });

    it('builds a shopping list and returns shortages when the pantry is short', async () => {
      const recipe = makeRecipe({
        servings: 2,
        ingredients: [
          { name: 'Tao', quantity: 4, unit: 'quả', optional: false },
        ],
      });
      const meal = makeMealDoc({
        recipeId: recipe._id,
        servings: 2, // needs 4 qua
        isCompleted: false,
        ingredientsConsumed: false,
        consumedItems: [],
      });
      mealPlanModel.findOne.mockReturnValue(mockQuery(meal));
      recipeModel.findById.mockReturnValue(mockQuery(recipe));

      const pantryItem = {
        _id: oid(),
        familyId: meal.familyId,
        name: 'Tao',
        quantity: 1, // only 1 of 4 available
        unit: 'quả',
        status: 'active',
        expiryDate: new Date('2026-06-25'),
        location: 'fridge',
        save: jest.fn().mockResolvedValue(undefined),
      };
      pantryItemModel.find.mockReturnValue(mockQuery([pantryItem]));
      missingIngredientsService.findMatchingPantryItems.mockReturnValue([
        pantryItem,
      ]);
      const listId = oid().toString();
      shoppingListGenerationService.createFromMissingItems.mockResolvedValue({
        id: listId,
        name: 'Con thieu cho Test Recipe',
      });
      // The just-created shortfall list is still active -> meal is "waiting".
      shoppingListModel.findById.mockReturnValue(mockQuery({ status: 'active' }));

      const result = await service.update(user, meal._id.toString(), {
        isCompleted: true,
      } as never);

      // The 1 in stock is used up, leaving a shortage of 3.
      expect(pantryItem.quantity).toBe(0);
      expect(shoppingListGenerationService.createFromMissingItems).toHaveBeenCalledWith(
        user,
        meal.familyId,
        'Test Recipe',
        expect.arrayContaining([
          expect.objectContaining({ name: 'Tao', quantity: 3, unit: 'quả' }),
        ]),
        meal.date,
      );
      expect(result.completion?.shortages).toEqual([
        { name: 'Tao', unit: 'quả', missingQuantity: 3 },
      ]);
      expect(result.completion?.shoppingListId).toBe(listId);
      // The created list is remembered on the meal so re-completing won't duplicate it.
      expect(meal.shortageListId?.toString()).toBe(listId);
      // Completed but shortfall list still active -> waiting (yellow on client).
      expect(result.awaitingIngredients).toBe(true);
    });

    it('restores ingredients and retires the shortfall list when un-completed', async () => {
      const pantryId = oid();
      const shortageListId = oid();
      const meal = makeMealDoc({
        recipeId: oid(),
        isCompleted: true,
        ingredientsConsumed: true,
        shortageListId,
        consumedItems: [
          {
            pantryItemId: pantryId,
            name: 'Tao',
            quantity: 4,
            unit: 'quả',
            expiryDate: new Date('2026-06-25'),
            location: 'fridge',
          },
        ],
      });
      mealPlanModel.findOne.mockReturnValue(mockQuery(meal));

      const existing = {
        _id: pantryId,
        familyId: meal.familyId,
        name: 'Tao',
        quantity: 1,
        unit: 'quả',
        status: 'active',
        save: jest.fn().mockResolvedValue(undefined),
      };
      pantryItemModel.findById.mockReturnValue(mockQuery(existing));

      await service.update(user, meal._id.toString(), {
        isCompleted: false,
      } as never);

      expect(existing.quantity).toBe(5); // 1 + 4 restored
      expect(existing.save).toHaveBeenCalled();
      // The auto-created shortfall list is archived and forgotten.
      expect(
        shoppingListGenerationService.removeGeneratedList,
      ).toHaveBeenCalledWith(meal.familyId, shortageListId);
      expect(meal.shortageListId).toBeUndefined();
      expect(meal.ingredientsConsumed).toBe(false);
      expect(meal.consumedItems).toHaveLength(0);
    });
  });

  describe('remove', () => {
    it('deletes the meal plan', async () => {
      const meal = makeMealDoc();
      mealPlanModel.findOne.mockReturnValue(mockQuery(meal));
      const result = await service.remove(user, meal._id.toString());
      expect(meal.deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });
});
