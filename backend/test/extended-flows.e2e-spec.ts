import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import type { AddressInfo } from 'net';
import { io, Socket } from 'socket.io-client';
import request from 'supertest';
import { App } from 'supertest/types';
import { Category } from '../src/catalog/schemas/category.schema';
import { Food } from '../src/catalog/schemas/food.schema';
import { Unit } from '../src/catalog/schemas/unit.schema';
import { Recipe } from '../src/recipes/schemas/recipe.schema';
import { User } from '../src/users/schemas/user.schema';

type AuthContext = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  familyId: string;
};

const USER_PASSWORD = 'Sup3rSecret!';
const NEW_USER_PASSWORD = 'N3wSup3rSecret!';
const BEEF_BARCODE = '8934673001234';

describe('Extended flows (e2e)', () => {
  let app: INestApplication<App>;
  let mongo: MongoMemoryServer | undefined;
  let dbConnection: Connection;
  let userModel: Model<User>;
  let httpPort: number;
  const openSockets: Socket[] = [];

  let auth: AuthContext;
  let admin: AuthContext;
  let categoryId: string;
  let beefFoodId: string;
  let carrotFoodId: string;
  let recipeId: string;
  let recipeListId: string;
  let recipeListItemId: string;

  beforeAll(async () => {
    mongo =
      process.env.E2E_USE_MEMORY_MONGO === 'true'
        ? await MongoMemoryServer.create()
        : undefined;

    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI =
      process.env.E2E_MONGODB_URI ??
      mongo?.getUri() ??
      `mongodb://127.0.0.1:27017/navimart_e2e_ext_${Date.now()}`;
    process.env.MONGODB_DB_NAME = `navimart_e2e_ext_${Date.now()}`;
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    // Once a year at midnight Jan 1 — effectively disables the job during tests.
    process.env.EXPIRY_NOTIFICATION_CRON = '0 0 1 1 *';
    // Deterministic AI Chef status: empty string is dropped by validateEnv and
    // is falsy for the process.env fallback in TimelyService, so configured=false
    // even when a developer's .env defines TIMELY_API_KEY.
    process.env.TIMELY_API_KEY = '';

    // AppModule must be imported AFTER the env vars above are set:
    // ConfigModule.forRoot({ validate }) snapshots process.env at import time.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { AppModule } =
      require('../src/app.module') as typeof import('../src/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
    // Listen on a real port so the socket.io gateway accepts connections.
    // supertest keeps working against an already-listening server.
    await app.listen(0);
    httpPort = (app.getHttpServer().address() as AddressInfo).port;

    dbConnection = moduleFixture.get<Connection>(getConnectionToken());
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));

    await seedCatalogAndRecipe(moduleFixture);
  }, 120000);

  afterAll(async () => {
    for (const socket of openSockets) {
      socket.disconnect();
    }
    await dbConnection?.dropDatabase();
    await app?.close();
    await mongo?.stop();
  });

  it('registers a user and promotes a second account to admin', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'linh.ext@example.com',
        password: USER_PASSWORD,
        firstName: 'Linh',
        lastName: 'Nguyen',
        familyName: 'Gia dinh Extended',
      })
      .expect(201);

    auth = {
      accessToken: registerResponse.body.tokens.accessToken,
      refreshToken: registerResponse.body.tokens.refreshToken,
      userId: registerResponse.body.user.id,
      familyId: registerResponse.body.user.activeFamilyId,
    };

    expect(auth.familyId).toBeDefined();
    // Registered users get the housewife role (needed later to create recipes).
    expect(registerResponse.body.user.role).toBe('housewife');

    const adminRegisterResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'admin.ext@example.com',
        password: USER_PASSWORD,
        firstName: 'Quan',
        lastName: 'Tri',
        familyName: 'Admin Family',
      })
      .expect(201);

    await userModel
      .updateOne(
        { _id: adminRegisterResponse.body.user.id },
        { $set: { role: 'admin' } },
      )
      .exec();

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ identifier: 'admin.ext@example.com', password: USER_PASSWORD })
      .expect(200);

    expect(adminLoginResponse.body.user.role).toBe('admin');

    admin = {
      accessToken: adminLoginResponse.body.tokens.accessToken,
      refreshToken: adminLoginResponse.body.tokens.refreshToken,
      userId: adminLoginResponse.body.user.id,
      familyId: adminLoginResponse.body.user.activeFamilyId,
    };
  });

  it('serves catalog categories, foods (search + barcode), and units with stable shapes', async () => {
    const categoriesResponse = await request(app.getHttpServer())
      .get('/api/catalog/categories')
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    expect(Array.isArray(categoriesResponse.body)).toBe(true);
    expect(categoriesResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: categoryId,
          name: 'Thit ca ext',
          slug: 'thit-ca-ext',
        }),
      ]),
    );

    const searchResponse = await request(app.getHttpServer())
      .get('/api/catalog/foods')
      .query({ q: 'Thit bo' })
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    expect(Array.isArray(searchResponse.body)).toBe(true);
    const beef = searchResponse.body.find(
      (food: { id: string }) => food.id === beefFoodId,
    );
    expect(beef).toMatchObject({
      id: beefFoodId,
      name: 'Thit bo ext',
      categoryId,
      defaultUnit: 'g',
      defaultStorageLocation: 'fridge',
      storageTips: 'Bao quan ngan mat 0-4 do C.',
      barcode: BEEF_BARCODE,
    });
    expect(beef.defaultShelfLifeDays).toBe(3);

    const barcodeResponse = await request(app.getHttpServer())
      .get('/api/catalog/foods')
      .query({ barcode: BEEF_BARCODE })
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    expect(barcodeResponse.body).toHaveLength(1);
    expect(barcodeResponse.body[0]).toMatchObject({
      id: beefFoodId,
      barcode: BEEF_BARCODE,
    });

    const unitsResponse = await request(app.getHttpServer())
      .get('/api/catalog/units')
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    expect(Array.isArray(unitsResponse.body)).toBe(true);
    expect(unitsResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'g',
          name: 'Gam',
          type: 'weight',
        }),
      ]),
    );
    expect(unitsResponse.body[0].id).toEqual(expect.any(String));
  });

  it('adds and removes recipe favorites, keeping counts in sync', async () => {
    const addResponse = await request(app.getHttpServer())
      .post(`/api/recipes/${recipeId}/favorite`)
      .set('Authorization', bearer(auth.accessToken))
      .expect(201);

    expect(addResponse.body).toEqual({
      recipeId,
      isFavorite: true,
      favoritesCount: 1,
    });

    const detailResponse = await request(app.getHttpServer())
      .get(`/api/recipes/${recipeId}`)
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    expect(detailResponse.body.isFavorite).toBe(true);
    expect(detailResponse.body.favoritesCount).toBe(1);

    const favoritesResponse = await request(app.getHttpServer())
      .get('/api/recipes/favorites')
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    expect(favoritesResponse.body).toHaveLength(1);
    expect(favoritesResponse.body[0]).toMatchObject({
      id: recipeId,
      isFavorite: true,
      favoritesCount: 1,
    });

    await request(app.getHttpServer())
      .delete(`/api/recipes/${recipeId}/favorite`)
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    const afterRemoveResponse = await request(app.getHttpServer())
      .get(`/api/recipes/${recipeId}`)
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    expect(afterRemoveResponse.body.isFavorite).toBe(false);
    expect(afterRemoveResponse.body.favoritesCount).toBe(0);

    const emptyFavoritesResponse = await request(app.getHttpServer())
      .get('/api/recipes/favorites')
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    expect(emptyFavoritesResponse.body).toHaveLength(0);
  });

  it('suggests recipes from pantry coverage with the exact suggestion shape', async () => {
    // Cover only the beef ingredient (700 g needed, 1000 g stocked); carrot stays missing.
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 10);

    await request(app.getHttpServer())
      .post('/api/pantry')
      .set('Authorization', bearer(auth.accessToken))
      .send({
        foodId: beefFoodId,
        name: 'Thit bo ext',
        quantity: 1000,
        unit: 'g',
        expiryDate: expiryDate.toISOString(),
        location: 'fridge',
        source: 'manual',
      })
      .expect(201);

    const suggestionsResponse = await request(app.getHttpServer())
      .get('/api/recipes/suggestions')
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    expect(Array.isArray(suggestionsResponse.body)).toBe(true);
    const suggestion = suggestionsResponse.body.find(
      (entry: { recipe: { id: string } }) => entry.recipe.id === recipeId,
    );
    expect(suggestion).toBeDefined();

    // Lock down the exact contract of a suggestion entry.
    expect(Object.keys(suggestion).sort()).toEqual([
      'availableCount',
      'expiringMatchedCount',
      'matchRatio',
      'missingIngredients',
      'recipe',
      'totalCount',
    ]);
    expect(suggestion).toEqual({
      recipe: expect.objectContaining({
        id: recipeId,
        name: 'Thit bo xao ca rot ext',
        status: 'approved',
      }),
      availableCount: 1,
      totalCount: 2,
      matchRatio: 0.5,
      expiringMatchedCount: 0,
      missingIngredients: ['Ca rot ext'],
    });
  });

  it('returns { shoppingList, missingSummary } when generating from a recipe (contract)', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/recipes/${recipeId}/generate-shopping-list`)
      .set('Authorization', bearer(auth.accessToken))
      .send({ name: 'Mua do recipe ext' })
      .expect(201);

    // Regression: the response is NOT a plain shopping list.
    expect(response.body.items).toBeUndefined();
    expect(response.body.id).toBeUndefined();
    expect(Object.keys(response.body).sort()).toEqual([
      'missingSummary',
      'shoppingList',
    ]);

    const { shoppingList, missingSummary } = response.body;
    expect(shoppingList.id).toEqual(expect.any(String));
    expect(shoppingList.name).toBe('Mua do recipe ext');
    expect(Array.isArray(shoppingList.items)).toBe(true);
    expect(shoppingList.items).toHaveLength(1);
    expect(shoppingList.items[0]).toMatchObject({
      foodId: carrotFoodId,
      name: 'Ca rot ext',
      quantity: 300,
      unit: 'g',
    });
    expect(shoppingList.progress).toEqual({ bought: 0, total: 1 });

    expect(Array.isArray(missingSummary.missingIngredients)).toBe(true);
    expect(missingSummary.hasMissingIngredients).toBe(true);
    expect(missingSummary.missingIngredients).toEqual([
      expect.objectContaining({
        foodId: carrotFoodId,
        name: 'Ca rot ext',
        missingQuantity: 300,
        isMissing: true,
      }),
    ]);

    recipeListId = shoppingList.id;
    recipeListItemId = shoppingList.items[0].id;
  });

  it('returns { shoppingList, missingSummary } when generating from a meal (contract)', async () => {
    const mealResponse = await request(app.getHttpServer())
      .post('/api/meals')
      .set('Authorization', bearer(auth.accessToken))
      .send({
        date: '2026-06-13T00:00:00.000Z',
        session: 'dinner',
        recipeId,
        servings: 2,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(`/api/meals/${mealResponse.body.id}/generate-shopping-list`)
      .set('Authorization', bearer(auth.accessToken))
      .send({ name: 'Mua do meal ext' })
      .expect(201);

    expect(response.body.items).toBeUndefined();
    expect(Object.keys(response.body).sort()).toEqual([
      'missingSummary',
      'shoppingList',
    ]);
    expect(response.body.shoppingList.name).toBe('Mua do meal ext');
    expect(response.body.shoppingList.id).toEqual(expect.any(String));
    expect(Array.isArray(response.body.shoppingList.items)).toBe(true);
    expect(response.body.shoppingList.progress.total).toBe(1);
    expect(
      Array.isArray(response.body.missingSummary.missingIngredients),
    ).toBe(true);
  });

  it('returns { shoppingList, pantryItems } when completing a shopping list (contract)', async () => {
    await request(app.getHttpServer())
      .patch(`/api/shopping-lists/${recipeListId}/items/${recipeListItemId}`)
      .set('Authorization', bearer(auth.accessToken))
      .send({ checked: true })
      .expect(200);

    const response = await request(app.getHttpServer())
      .post(`/api/shopping-lists/${recipeListId}/complete`)
      .set('Authorization', bearer(auth.accessToken))
      .send({ defaultExpiryDays: 4, defaultLocation: 'fridge' })
      .expect(200);

    expect(Object.keys(response.body).sort()).toEqual([
      'pantryItems',
      'shoppingList',
    ]);
    expect(response.body.shoppingList).toMatchObject({
      id: recipeListId,
      status: 'completed',
    });
    expect(Array.isArray(response.body.pantryItems)).toBe(true);
    expect(response.body.pantryItems).toHaveLength(1);
    expect(response.body.pantryItems[0]).toMatchObject({
      foodId: carrotFoodId,
      name: 'Ca rot ext',
      quantity: 300,
    });
  });

  it('returns the profile shape and auto-updates displayName on PATCH /users/me', async () => {
    const profileResponse = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    expect(profileResponse.body).toMatchObject({
      id: auth.userId,
      email: 'linh.ext@example.com',
      firstName: 'Linh',
      role: 'housewife',
      status: 'active',
      activeFamilyId: auth.familyId,
    });
    expect(profileResponse.body.notificationSettings).toMatchObject({
      expiryReminder: expect.any(Boolean),
      expiryReminderDays: expect.any(Number),
      shoppingReminder: expect.any(Boolean),
    });

    const updateResponse = await request(app.getHttpServer())
      .patch('/api/users/me')
      .set('Authorization', bearer(auth.accessToken))
      .send({ firstName: 'Linh Chi', lastName: 'Pham' })
      .expect(200);

    expect(updateResponse.body.firstName).toBe('Linh Chi');
    expect(updateResponse.body.lastName).toBe('Pham');
    expect(updateResponse.body.displayName).toBe('Linh Chi Pham');
  });

  it('resets a forgotten password via the dev reset token', async () => {
    const forgotResponse = await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({ identifier: 'linh.ext@example.com' })
      .expect(200);

    expect(forgotResponse.body.success).toBe(true);
    // NODE_ENV=test (not production), so the dev token is exposed.
    expect(forgotResponse.body.devResetToken).toEqual(expect.any(String));

    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({
        token: forgotResponse.body.devResetToken,
        newPassword: NEW_USER_PASSWORD,
      })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ identifier: 'linh.ext@example.com', password: USER_PASSWORD })
      .expect(401);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ identifier: 'linh.ext@example.com', password: NEW_USER_PASSWORD })
      .expect(200);

    auth.accessToken = loginResponse.body.tokens.accessToken;
    auth.refreshToken = loginResponse.body.tokens.refreshToken;
  });

  it('returns admin stats with the documented shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/admin/stats')
      .set('Authorization', bearer(admin.accessToken))
      .expect(200);

    expect(Object.keys(response.body).sort()).toEqual([
      'families',
      'recipes',
      'users',
    ]);
    expect(response.body.users).toEqual({
      total: expect.any(Number),
      active: expect.any(Number),
    });
    expect(response.body.users.total).toBeGreaterThanOrEqual(2);
    expect(response.body.recipes.total).toBeGreaterThanOrEqual(1);
    expect(response.body.recipes.byStatus).toMatchObject({
      approved: expect.any(Number),
      pending: expect.any(Number),
    });
    expect(response.body.families).toEqual({ total: expect.any(Number) });

    // Normal users must not reach admin endpoints.
    await request(app.getHttpServer())
      .get('/api/admin/stats')
      .set('Authorization', bearer(auth.accessToken))
      .expect(403);
  });

  it('lists users with pagination and bans/unbans an account', async () => {
    const victimRegisterResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'victim.ext@example.com',
        password: USER_PASSWORD,
        firstName: 'Nan',
        lastName: 'Nhan',
        familyName: 'Victim Family',
      })
      .expect(201);

    const victimId = victimRegisterResponse.body.user.id;

    const listResponse = await request(app.getHttpServer())
      .get('/api/admin/users')
      .set('Authorization', bearer(admin.accessToken))
      .expect(200);

    expect(Object.keys(listResponse.body).sort()).toEqual([
      'items',
      'limit',
      'page',
      'total',
      'totalPages',
    ]);
    expect(Array.isArray(listResponse.body.items)).toBe(true);
    expect(listResponse.body.total).toBeGreaterThanOrEqual(3);
    expect(listResponse.body.page).toBe(1);
    expect(listResponse.body.limit).toBe(20);
    expect(listResponse.body.totalPages).toBeGreaterThanOrEqual(1);

    const banResponse = await request(app.getHttpServer())
      .patch(`/api/admin/users/${victimId}`)
      .set('Authorization', bearer(admin.accessToken))
      .send({ status: 'banned' })
      .expect(200);

    expect(banResponse.body.status).toBe('banned');

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ identifier: 'victim.ext@example.com', password: USER_PASSWORD })
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/api/admin/users/${victimId}`)
      .set('Authorization', bearer(admin.accessToken))
      .send({ status: 'active' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ identifier: 'victim.ext@example.com', password: USER_PASSWORD })
      .expect(200);
  });

  it('moderates a user-submitted recipe from pending to approved', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/recipes')
      .set('Authorization', bearer(auth.accessToken))
      .send({
        name: 'Ca rot luoc ext',
        cookTimeMinutes: 10,
        servings: 2,
        // Shared recipes are user submissions that require moderation; personal
        // recipes auto-approve, so the moderation flow needs visibility 'shared'.
        visibility: 'shared',
        ingredients: [{ foodId: carrotFoodId, quantity: 200, unit: 'g' }],
        steps: ['Rua ca rot', 'Luoc chin'],
      })
      .expect(201);

    const pendingRecipeId = createResponse.body.id;
    expect(createResponse.body.status).toBe('pending');

    // Pending recipes are hidden from the public approved listing.
    const publicBeforeResponse = await request(app.getHttpServer())
      .get('/api/recipes')
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);
    expect(
      publicBeforeResponse.body.some(
        (recipe: { id: string }) => recipe.id === pendingRecipeId,
      ),
    ).toBe(false);

    const moderationListResponse = await request(app.getHttpServer())
      .get('/api/admin/recipes')
      .query({ status: 'pending' })
      .set('Authorization', bearer(admin.accessToken))
      .expect(200);

    expect(Object.keys(moderationListResponse.body).sort()).toEqual([
      'items',
      'limit',
      'page',
      'total',
      'totalPages',
    ]);
    expect(
      moderationListResponse.body.items.some(
        (recipe: { id: string }) => recipe.id === pendingRecipeId,
      ),
    ).toBe(true);

    const approveResponse = await request(app.getHttpServer())
      .patch(`/api/admin/recipes/${pendingRecipeId}/status`)
      .set('Authorization', bearer(admin.accessToken))
      .send({ status: 'approved' })
      .expect(200);

    expect(approveResponse.body.status).toBe('approved');

    const publicAfterResponse = await request(app.getHttpServer())
      .get('/api/recipes')
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);
    expect(
      publicAfterResponse.body.some(
        (recipe: { id: string }) => recipe.id === pendingRecipeId,
      ),
    ).toBe(true);
  });

  it('lets an admin create and archive catalog categories and foods', async () => {
    const categoryResponse = await request(app.getHttpServer())
      .post('/api/admin/catalog/categories')
      .set('Authorization', bearer(admin.accessToken))
      .send({ name: 'Do kho ext', description: 'Do kho cho e2e.' })
      .expect(201);

    expect(categoryResponse.body).toMatchObject({
      id: expect.any(String),
      name: 'Do kho ext',
      slug: 'do-kho-ext',
      status: 'active',
    });
    const newCategoryId = categoryResponse.body.id;

    const foodResponse = await request(app.getHttpServer())
      .post('/api/admin/catalog/foods')
      .set('Authorization', bearer(admin.accessToken))
      .send({
        name: 'Mi goi ext',
        categoryId: newCategoryId,
        defaultUnit: 'goi',
        defaultStorageLocation: 'pantry',
        defaultShelfLifeDays: 180,
        storageTips: 'De noi kho rao.',
        barcode: '8934673009999',
      })
      .expect(201);

    expect(foodResponse.body).toMatchObject({
      id: expect.any(String),
      name: 'Mi goi ext',
      categoryId: newCategoryId,
      // Legacy unit code 'goi' is normalized to its canonical diacritic form.
      defaultUnit: 'gói',
      barcode: '8934673009999',
    });
    const newFoodId = foodResponse.body.id;

    // The new food is visible through the public barcode lookup...
    const barcodeResponse = await request(app.getHttpServer())
      .get('/api/catalog/foods')
      .query({ barcode: '8934673009999' })
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);
    expect(barcodeResponse.body).toHaveLength(1);

    // ...until it is archived (soft delete).
    const deleteFoodResponse = await request(app.getHttpServer())
      .delete(`/api/admin/catalog/foods/${newFoodId}`)
      .set('Authorization', bearer(admin.accessToken))
      .expect(200);
    expect(deleteFoodResponse.body).toEqual({ success: true });

    const archivedBarcodeResponse = await request(app.getHttpServer())
      .get('/api/catalog/foods')
      .query({ barcode: '8934673009999' })
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);
    expect(archivedBarcodeResponse.body).toHaveLength(0);

    const deleteCategoryResponse = await request(app.getHttpServer())
      .delete(`/api/admin/catalog/categories/${newCategoryId}`)
      .set('Authorization', bearer(admin.accessToken))
      .expect(200);
    expect(deleteCategoryResponse.body).toEqual({ success: true });

    const publicCategoriesResponse = await request(app.getHttpServer())
      .get('/api/catalog/categories')
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);
    expect(
      publicCategoriesResponse.body.some(
        (category: { id: string }) => category.id === newCategoryId,
      ),
    ).toBe(false);
  });

  it('pushes shoppingList:updated to family members over websockets', async () => {
    const socket = io(`http://127.0.0.1:${httpPort}`, {
      auth: { token: auth.accessToken },
      transports: ['websocket'],
      reconnection: false,
    });
    openSockets.push(socket);

    await waitForEvent(socket, 'connect', 5000);

    const listResponse = await request(app.getHttpServer())
      .post('/api/shopping-lists')
      .set('Authorization', bearer(auth.accessToken))
      .send({ name: 'Realtime list ext', type: 'daily' })
      .expect(201);

    const listId = listResponse.body.id;

    const updatedPromise = waitForEvent<{ id: string; items: unknown[] }>(
      socket,
      'shoppingList:updated',
      5000,
    );

    await request(app.getHttpServer())
      .post(`/api/shopping-lists/${listId}/items`)
      .set('Authorization', bearer(auth.accessToken))
      .send({ foodId: beefFoodId, quantity: 100, unit: 'g' })
      .expect(201);

    const payload = await updatedPromise;
    expect(payload.id).toBe(listId);
    expect(Array.isArray(payload.items)).toBe(true);
    expect(payload.items).toHaveLength(1);

    socket.disconnect();
  });

  it('disconnects websocket clients that present an invalid token', async () => {
    const socket = io(`http://127.0.0.1:${httpPort}`, {
      auth: { token: 'not-a-valid-jwt' },
      transports: ['websocket'],
      reconnection: false,
    });
    openSockets.push(socket);

    const rejected = await Promise.race([
      waitForEvent(socket, 'disconnect', 5000).then(() => 'disconnect'),
      waitForEvent(socket, 'connect_error', 5000).then(() => 'connect_error'),
    ]);

    expect(['disconnect', 'connect_error']).toContain(rejected);
    expect(socket.connected).toBe(false);

    socket.disconnect();
  });

  it('reports AI Chef as not configured without a Timely API key', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ai-chef/status')
      .set('Authorization', bearer(auth.accessToken))
      .expect(200);

    expect(response.body).toEqual({ configured: false });
  });

  async function seedCatalogAndRecipe(moduleFixture: TestingModule) {
    const categoryModel = moduleFixture.get<Model<Category>>(
      getModelToken(Category.name),
    );
    const foodModel = moduleFixture.get<Model<Food>>(getModelToken(Food.name));
    const unitModel = moduleFixture.get<Model<Unit>>(getModelToken(Unit.name));
    const recipeModel = moduleFixture.get<Model<Recipe>>(
      getModelToken(Recipe.name),
    );

    const category = await categoryModel.create({
      name: 'Thit ca ext',
      slug: 'thit-ca-ext',
      status: 'active',
    });

    const beef = await foodModel.create({
      name: 'Thit bo ext',
      normalizedName: 'thit bo ext',
      categoryId: category._id,
      defaultUnit: 'g',
      aliases: ['beef'],
      defaultStorageLocation: 'fridge',
      defaultShelfLifeDays: 3,
      storageTips: 'Bao quan ngan mat 0-4 do C.',
      barcode: BEEF_BARCODE,
      isSystem: true,
      status: 'active',
    });

    const carrot = await foodModel.create({
      name: 'Ca rot ext',
      normalizedName: 'ca rot ext',
      categoryId: category._id,
      defaultUnit: 'g',
      aliases: ['carrot'],
      defaultStorageLocation: 'fridge',
      defaultShelfLifeDays: 7,
      isSystem: true,
      status: 'active',
    });

    await unitModel.create({
      code: 'g',
      name: 'Gram',
      type: 'weight',
      status: 'active',
    });

    const recipe = await recipeModel.create({
      name: 'Thit bo xao ca rot ext',
      normalizedName: 'thit bo xao ca rot ext',
      description: 'Recipe seeded for extended e2e tests.',
      cookTimeMinutes: 20,
      difficulty: 'easy',
      servings: 2,
      ingredients: [
        {
          foodId: beef._id,
          categoryId: category._id,
          name: beef.name,
          quantity: 700,
          unit: 'g',
          optional: false,
        },
        {
          foodId: carrot._id,
          categoryId: category._id,
          name: carrot.name,
          quantity: 300,
          unit: 'g',
          optional: false,
        },
      ],
      steps: ['Slice beef', 'Slice carrot', 'Stir fry'],
      nutrition: { calories: 450 },
      tags: ['e2e', 'ext'],
      status: 'approved',
    });

    categoryId = category._id.toString();
    beefFoodId = beef._id.toString();
    carrotFoodId = carrot._id.toString();
    recipeId = recipe._id.toString();
  }

  function waitForEvent<T = unknown>(
    socket: Socket,
    event: string,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        socket.off(event, handler);
        reject(new Error(`Timed out waiting for socket event "${event}"`));
      }, timeoutMs);

      const handler = (payload: T) => {
        clearTimeout(timer);
        resolve(payload);
      };

      socket.once(event, handler);
    });
  }
});

function bearer(accessToken: string) {
  return `Bearer ${accessToken}`;
}
