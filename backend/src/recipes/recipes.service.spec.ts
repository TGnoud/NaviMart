import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  createMockModel,
  MockModel,
  mockQuery,
} from '../../test/utils/mock-model';
import {
  makeFamily,
  makeIngredient,
  makePantryItem,
  makeRecipe,
  makeUser,
} from '../../test/utils/fixtures';
import { MissingIngredientsService } from '../meals/missing-ingredients.service';
import { RecipesService } from './recipes.service';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('RecipesService', () => {
  let service: RecipesService;
  let recipeModel: MockModel;
  let recipeFavoriteModel: MockModel;
  let foodModel: MockModel;
  let categoryModel: MockModel;
  let familyModel: MockModel;
  let pantryItemModel: MockModel;
  let shoppingListGenerationService: { generateFromRecipe: jest.Mock };

  beforeEach(() => {
    recipeModel = createMockModel();
    recipeFavoriteModel = createMockModel();
    foodModel = createMockModel();
    categoryModel = createMockModel();
    familyModel = createMockModel();
    pantryItemModel = createMockModel();

    // Use a real MissingIngredientsService so the matching logic exercised by
    // suggestion ranking is the production code, not a stub.
    const missingIngredientsService = new MissingIngredientsService(
      familyModel as never,
      pantryItemModel as never,
      recipeModel as never,
    );
    shoppingListGenerationService = {
      generateFromRecipe: jest.fn().mockResolvedValue({ ok: true }),
    };

    service = new RecipesService(
      recipeModel as never,
      recipeFavoriteModel as never,
      foodModel as never,
      categoryModel as never,
      familyModel as never,
      pantryItemModel as never,
      missingIngredientsService,
      shoppingListGenerationService as never,
    );
  });

  function withActiveFamily(user = makeUser()) {
    familyModel.findById.mockReturnValue(
      mockQuery(
        makeFamily({
          members: [
            { userId: new Types.ObjectId(user.userId), status: 'active' },
          ],
        }),
      ),
    );
    return user;
  }

  describe('getSuggestions', () => {
    it('ranks recipes by match ratio and filters below minMatch', async () => {
      const user = withActiveFamily();
      const fullyMatched = makeRecipe({
        name: 'Rice bowl',
        ingredients: [makeIngredient({ name: 'Rice', quantity: 2, unit: 'g' })],
      });
      const partiallyMatched = makeRecipe({
        name: 'Beef rice',
        ingredients: [
          makeIngredient({ name: 'Rice', quantity: 2, unit: 'g' }),
          makeIngredient({ name: 'Beef', quantity: 1, unit: 'kg' }),
        ],
      });

      pantryItemModel.find.mockReturnValue(
        mockQuery([makePantryItem({ name: 'Rice', quantity: 5, unit: 'g' })]),
      );
      recipeModel.find.mockReturnValue(
        mockQuery([partiallyMatched, fullyMatched]),
      );

      const all = await service.getSuggestions(user, {});
      expect(all.map((s) => s.recipe.name)).toEqual(['Rice bowl', 'Beef rice']);
      expect(all[0].matchRatio).toBe(1);
      expect(all[1].matchRatio).toBe(0.5);

      const filtered = await service.getSuggestions(user, { minMatch: 0.6 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].recipe.name).toBe('Rice bowl');
    });

    it('respects the limit', async () => {
      const user = withActiveFamily();
      pantryItemModel.find.mockReturnValue(
        mockQuery([makePantryItem({ name: 'Rice', quantity: 5, unit: 'g' })]),
      );
      recipeModel.find.mockReturnValue(
        mockQuery([
          makeRecipe({
            name: 'A',
            ingredients: [makeIngredient({ name: 'Rice', quantity: 1, unit: 'g' })],
          }),
          makeRecipe({
            name: 'B',
            ingredients: [makeIngredient({ name: 'Rice', quantity: 1, unit: 'g' })],
          }),
        ]),
      );

      const result = await service.getSuggestions(user, { limit: 1 });
      expect(result).toHaveLength(1);
    });

    it('boosts recipes with expiring matched items when prioritizeExpiring is set', async () => {
      const user = withActiveFamily();
      const expiringSoon = new Date(Date.now() + DAY_MS);
      const farFuture = new Date(Date.now() + 60 * DAY_MS);

      const expiringRecipe = makeRecipe({
        name: 'Use the milk',
        ingredients: [makeIngredient({ name: 'Milk', quantity: 1, unit: 'l' })],
      });
      const safeRecipe = makeRecipe({
        name: 'Rice bowl',
        ingredients: [makeIngredient({ name: 'Rice', quantity: 1, unit: 'g' })],
      });

      pantryItemModel.find.mockReturnValue(
        mockQuery([
          makePantryItem({
            name: 'Milk',
            quantity: 5,
            unit: 'l',
            expiryDate: expiringSoon,
          }),
          makePantryItem({
            name: 'Rice',
            quantity: 5,
            unit: 'g',
            expiryDate: farFuture,
          }),
        ]),
      );
      recipeModel.find.mockReturnValue(mockQuery([safeRecipe, expiringRecipe]));

      const result = await service.getSuggestions(user, {
        prioritizeExpiring: true,
      });
      expect(result[0].recipe.name).toBe('Use the milk');
      expect(result[0].expiringMatchedCount).toBe(1);
    });

    it('filters recipes by query q matching only names and all words', async () => {
      const user = withActiveFamily();
      pantryItemModel.find.mockReturnValue(mockQuery([]));
      recipeModel.find.mockReturnValue(mockQuery([]));

      await service.getSuggestions(user, { q: 'gà rán' });

      expect(recipeModel.find).toHaveBeenCalledWith({
        status: 'approved',
        $and: [
          { name: { $regex: new RegExp('gà', 'i') } },
          { name: { $regex: new RegExp('rán', 'i') } },
        ],
      });
    });
  });

  describe('findAll', () => {
    it('builds an approved-status filter and createdAt sort by default', async () => {
      const user = makeUser();
      const query = mockQuery([]);
      recipeModel.find.mockReturnValue(query);
      recipeFavoriteModel.find.mockReturnValue(mockQuery([]));

      await service.findAll(user, {});

      expect(recipeModel.find).toHaveBeenCalledWith({ status: 'approved' });
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(query.limit).toHaveBeenCalledWith(30);
    });

    it('uses name regex filter and createdAt sort when q is present', async () => {
      const user = makeUser();
      const query = mockQuery([]);
      recipeModel.find.mockReturnValue(query);
      recipeFavoriteModel.find.mockReturnValue(mockQuery([]));

      await service.findAll(user, { q: '  pho  ' });

      expect(recipeModel.find).toHaveBeenCalledWith({
        status: 'approved',
        $and: [
          { name: { $regex: new RegExp('pho', 'i') } },
        ],
      });
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('flags favorite recipes', async () => {
      const user = makeUser();
      const recipe = makeRecipe();
      recipeModel.find.mockReturnValue(mockQuery([recipe]));
      recipeFavoriteModel.find.mockReturnValue(
        mockQuery([{ recipeId: recipe._id }]),
      );

      const result = await service.findAll(user, {});
      expect(result[0].isFavorite).toBe(true);
    });
  });

  describe('findOne', () => {
    it('throws NotFound when the recipe is archived', async () => {
      recipeModel.findById.mockReturnValue(
        mockQuery(makeRecipe({ status: 'archived' })),
      );
      await expect(
        service.findOne(makeUser(), 'id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns recipe detail with favorite flag', async () => {
      const recipe = makeRecipe();
      recipeModel.findById.mockReturnValue(mockQuery(recipe));
      recipeFavoriteModel.exists.mockReturnValue(mockQuery({ _id: recipe._id }));

      const result = await service.findOne(makeUser(), recipe._id.toString());
      expect(result.id).toBe(recipe._id.toString());
      expect(result.isFavorite).toBe(true);
    });
  });

  describe('addFavorite / removeFavorite', () => {
    it('increments favoritesCount only on a new favorite', async () => {
      const recipe = makeRecipe({ favoritesCount: 2 });
      recipeModel.findById.mockReturnValue(mockQuery(recipe));
      recipeFavoriteModel.updateOne.mockReturnValue(
        mockQuery({ upsertedCount: 1 }),
      );
      recipeModel.updateOne.mockReturnValue(mockQuery({ modifiedCount: 1 }));

      const result = await service.addFavorite(makeUser(), recipe._id.toString());
      expect(result.isFavorite).toBe(true);
      expect(result.favoritesCount).toBe(3);
      expect(recipeModel.updateOne).toHaveBeenCalled();
    });

    it('does not increment when the favorite already exists', async () => {
      const recipe = makeRecipe({ favoritesCount: 2 });
      recipeModel.findById.mockReturnValue(mockQuery(recipe));
      recipeFavoriteModel.updateOne.mockReturnValue(
        mockQuery({ upsertedCount: 0 }),
      );

      const result = await service.addFavorite(makeUser(), recipe._id.toString());
      expect(result.favoritesCount).toBe(2);
      expect(recipeModel.updateOne).not.toHaveBeenCalled();
    });

    it('decrements favoritesCount when a favorite is removed', async () => {
      const recipe = makeRecipe({ favoritesCount: 2 });
      recipeModel.findById.mockReturnValue(mockQuery(recipe));
      recipeFavoriteModel.deleteOne.mockReturnValue(
        mockQuery({ deletedCount: 1 }),
      );
      recipeModel.updateOne.mockReturnValue(mockQuery({ modifiedCount: 1 }));

      const result = await service.removeFavorite(
        makeUser(),
        recipe._id.toString(),
      );
      expect(result.isFavorite).toBe(false);
      expect(result.favoritesCount).toBe(1);
    });
  });

  describe('findFavorites', () => {
    it('returns favorite recipes in saved order, flagged as favorite', async () => {
      const recipe = makeRecipe();
      recipeFavoriteModel.find.mockReturnValue(
        mockQuery([{ recipeId: recipe._id }]),
      );
      recipeModel.find.mockReturnValue(mockQuery([recipe]));

      const result = await service.findFavorites(makeUser());
      expect(result).toHaveLength(1);
      expect(result[0].isFavorite).toBe(true);
    });
  });

  describe('create', () => {
    it('defaults a non-admin recipe to pending status', async () => {
      const created = makeRecipe({ status: 'pending' });
      recipeModel.create.mockResolvedValue(created);

      await service.create(makeUser({ role: 'user' }), {
        name: 'New dish',
        cookTimeMinutes: 10,
        ingredients: [{ name: 'Salt', quantity: 1, unit: 'g' }],
        steps: ['mix'],
      } as never);

      const createArg = recipeModel.create.mock.calls[0][0];
      expect(createArg.status).toBe('pending');
      expect(createArg.normalizedName).toBe('new dish');
    });

    it('auto-approves a recipe created by an admin', async () => {
      recipeModel.create.mockResolvedValue(makeRecipe({ status: 'approved' }));

      await service.create(makeUser({ role: 'admin' }), {
        name: 'Admin dish',
        cookTimeMinutes: 10,
        ingredients: [{ name: 'Salt', quantity: 1, unit: 'g' }],
        steps: ['mix'],
      } as never);

      expect(recipeModel.create.mock.calls[0][0].status).toBe('approved');
    });
  });

  describe('generateShoppingList', () => {
    it('delegates to the generation service', async () => {
      const dto = { servings: 2 };
      const result = await service.generateShoppingList(
        makeUser(),
        'r1',
        dto as never,
      );
      expect(shoppingListGenerationService.generateFromRecipe).toHaveBeenCalledWith(
        expect.anything(),
        'r1',
        dto,
      );
      expect(result).toEqual({ ok: true });
    });
  });

  describe('addFavorite (visibility)', () => {
    it('throws NotFound when the recipe is archived', async () => {
      recipeModel.findById.mockReturnValue(
        mockQuery(makeRecipe({ status: 'archived' })),
      );
      await expect(
        service.addFavorite(makeUser(), 'r1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update / remove authorization', () => {
    it('forbids a non-admin from updating another author’s recipe', async () => {
      const recipe = makeRecipe({ authorId: new Types.ObjectId() });
      recipeModel.findById.mockReturnValue(mockQuery(recipe));

      await expect(
        service.update(makeUser({ role: 'user' }), recipe._id.toString(), {
          name: 'x',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('forbids a non-admin from changing recipe status', async () => {
      const author = makeUser({ role: 'user' });
      const recipe = makeRecipe({
        authorId: new Types.ObjectId(author.userId),
      });
      recipeModel.findById.mockReturnValue(mockQuery(recipe));

      await expect(
        service.update(author, recipe._id.toString(), { status: 'approved' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('archives a recipe on remove by its author', async () => {
      const author = makeUser({ role: 'user' });
      const recipe = makeRecipe({
        authorId: new Types.ObjectId(author.userId),
      });
      recipeModel.findById.mockReturnValue(mockQuery(recipe));

      const result = await service.remove(author, recipe._id.toString());
      expect(result).toEqual({ success: true });
      expect(recipe.status).toBe('archived');
      expect(recipe.save).toHaveBeenCalled();
    });
  });
});
