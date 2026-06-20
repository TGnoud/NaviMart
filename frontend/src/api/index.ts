import { apiRequest } from './client';
import type {
  AppNotification,
  AuthResponse,
  CompleteShoppingListResult,
  ConsumptionTrendsReport,
  DashboardReport,
  Family,
  FamilyInvite,
  FamilyPermission,
  MealCompletionResult,
  MealPlan,
  MealSession,
  MissingIngredientsReport,
  PantryItem,
  PantryItemStatus,
  RecipeDetail,
  RecipeSuggestion,
  RecipeSummary,
  ShoppingList,
  ShoppingListStatus,
  ShoppingListType,
  StorageLocation,
  WasteReport,
} from './types';

export * from './client';
export * from './types';

// ---------- Auth ----------

export const authApi = {
  login: (identifier: string, password: string, rememberMe = false) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { identifier, password, rememberMe },
      auth: false,
    }),

  register: (input: {
    email?: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
    familyName?: string;
  }) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: input,
      auth: false,
    }),

  refresh: (refreshToken: string) =>
    apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    }),

  logout: () => apiRequest<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  forgotPassword: (identifier: string) =>
    apiRequest<{ success: boolean; devResetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { identifier },
      auth: false,
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest<{ success: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
      auth: false,
    }),
};

// ---------- Catalog (public, JWT) ----------

export type CatalogFood = {
  id: string;
  name: string;
  categoryId: string;
  defaultUnit: string;
  aliases: string[];
  defaultStorageLocation: StorageLocation;
  defaultShelfLifeDays?: number;
  storageTips?: string;
  imageUrl?: string;
  barcode?: string;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
};

export type CatalogUnit = {
  id: string;
  code: string;
  name: string;
  type?: string;
};

export const catalogApi = {
  categories: () => apiRequest<CatalogCategory[]>('/catalog/categories'),

  searchFoods: (query: { q?: string; barcode?: string; categoryId?: string; limit?: number } = {}) =>
    apiRequest<CatalogFood[]>('/catalog/foods', { query }),

  units: () => apiRequest<CatalogUnit[]>('/catalog/units'),
};

// ---------- Users ----------

export type UserProfile = {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  role: string;
  status: string;
  activeFamilyId?: string;
  notificationSettings?: {
    expiryReminder: boolean;
    expiryReminderDays: number;
    shoppingReminder: boolean;
  };
};

export const usersApi = {
  me: () => apiRequest<UserProfile>('/users/me'),

  updateMe: (input: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatarUrl?: string;
    dateOfBirth?: string;
    gender?: string;
    expiryReminder?: boolean;
    expiryReminderDays?: number;
    shoppingReminder?: boolean;
  }) => apiRequest<UserProfile>('/users/me', { method: 'PATCH', body: input }),
};

// ---------- Uploads ----------

export type UploadedImage = {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export const uploadsApi = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<UploadedImage>('/uploads/image', {
      method: 'POST',
      body: formData,
    });
  },
};

// ---------- Shopping lists ----------

export const shoppingListsApi = {
  list: (status?: ShoppingListStatus) =>
    apiRequest<ShoppingList[]>('/shopping-lists', { query: { status } }),

  create: (input: { name: string; type?: ShoppingListType; plannedFor?: string; recurrenceEndDate?: string }) =>
    apiRequest<ShoppingList>('/shopping-lists', { method: 'POST', body: input }),

  get: (listId: string) => apiRequest<ShoppingList>(`/shopping-lists/${listId}`),

  update: (
    listId: string,
    input: {
      name?: string;
      type?: ShoppingListType;
      status?: ShoppingListStatus;
      plannedFor?: string;
    },
  ) => apiRequest<ShoppingList>(`/shopping-lists/${listId}`, { method: 'PATCH', body: input }),

  remove: (listId: string, deleteAll?: boolean) =>
    apiRequest<{ success: boolean }>(`/shopping-lists/${listId}`, { method: 'DELETE', query: { deleteAll } }),

  complete: (
    listId: string,
    input: {
      defaultExpiryDays?: number;
      defaultLocation?: StorageLocation;
    } = {},
  ) =>
    apiRequest<CompleteShoppingListResult>(`/shopping-lists/${listId}/complete`, {
      method: 'POST',
      body: input,
    }),

  addItem: (
    listId: string,
    input: { name?: string; foodId?: string; categoryId?: string; quantity: number; unit?: string; note?: string },
    addAll?: boolean,
  ) => apiRequest<ShoppingList>(`/shopping-lists/${listId}/items`, { method: 'POST', body: input, query: { addAll } }),

  updateItem: (
    listId: string,
    itemId: string,
    input: {
      name?: string;
      quantity?: number;
      unit?: string;
      checked?: boolean;
      status?: 'pending' | 'bought';
      note?: string;
    },
  ) =>
    apiRequest<ShoppingList>(`/shopping-lists/${listId}/items/${itemId}`, {
      method: 'PATCH',
      body: input,
    }),

  removeItem: (listId: string, itemId: string) =>
    apiRequest<ShoppingList>(`/shopping-lists/${listId}/items/${itemId}`, {
      method: 'DELETE',
    }),
};

// ---------- Pantry ----------

export const pantryApi = {
  list: (query: {
    location?: StorageLocation;
    categoryId?: string;
    status?: PantryItemStatus;
    expiryStatus?: 'safe' | 'expiring' | 'expired';
    expiryWarningDays?: number;
    q?: string;
  } = {}) => apiRequest<PantryItem[]>('/pantry', { query }),

  create: (input: {
    name?: string;
    foodId?: string;
    categoryId?: string;
    quantity: number;
    unit?: string;
    expiryDate: string;
    location?: StorageLocation;
    note?: string;
    imageUrl?: string;
  }) => apiRequest<PantryItem>('/pantry', { method: 'POST', body: input }),

  get: (itemId: string) => apiRequest<PantryItem>(`/pantry/${itemId}`),

  update: (
    itemId: string,
    input: {
      name?: string;
      foodId?: string;
      categoryId?: string;
      quantity?: number;
      unit?: string;
      expiryDate?: string;
      location?: StorageLocation;
      status?: PantryItemStatus;
      note?: string;
      imageUrl?: string;
    },
  ) => apiRequest<PantryItem>(`/pantry/${itemId}`, { method: 'PATCH', body: input }),

  remove: (itemId: string) =>
    apiRequest<{ success: boolean }>(`/pantry/${itemId}`, { method: 'DELETE' }),

  consume: (itemId: string, quantity: number, note?: string) =>
    apiRequest<PantryItem>(`/pantry/${itemId}/consume`, {
      method: 'POST',
      body: { quantity, note },
    }),

  markWasted: (itemId: string) =>
    apiRequest<PantryItem>(`/pantry/${itemId}/waste`, { method: 'POST', body: {} }),
};

// ---------- Meals ----------

export const mealsApi = {
  list: (startDate: string, endDate: string, session?: MealSession) =>
    apiRequest<MealPlan[]>('/meals', { query: { startDate, endDate, session } }),

  create: (input: {
    date: string;
    session: MealSession;
    customSessionName?: string;
    recipeId?: string;
    customName?: string;
    servings?: number;
    note?: string;
  }) => apiRequest<MealPlan>('/meals', { method: 'POST', body: input }),

  get: (mealId: string) => apiRequest<MealPlan>(`/meals/${mealId}`),

  update: (
    mealId: string,
    input: Partial<{
      date: string;
      session: MealSession;
      customSessionName: string;
      recipeId: string;
      customName: string;
      servings: number;
      isCompleted: boolean;
      note: string;
    }>,
  ) =>
    apiRequest<MealPlan & { completion?: MealCompletionResult }>(
      `/meals/${mealId}`,
      { method: 'PATCH', body: input },
    ),

  remove: (mealId: string) =>
    apiRequest<{ success: boolean }>(`/meals/${mealId}`, { method: 'DELETE' }),

  missingIngredients: (mealId: string) =>
    apiRequest<MissingIngredientsReport>(`/meals/${mealId}/missing-ingredients`),

  generateShoppingList: (mealId: string, input: { name?: string; plannedFor?: string } = {}) =>
    apiRequest<GeneratedShoppingListResult>(`/meals/${mealId}/generate-shopping-list`, {
      method: 'POST',
      body: input,
    }),
};

// ---------- Recipes ----------

export const recipesApi = {
  list: (query: {
    q?: string;
    ingredient?: string;
    categoryId?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    maxCookTime?: number;
    status?: string;
    limit?: number;
    sort?: string;
    authorId?: string;
  } = {}) => apiRequest<RecipeSummary[]>('/recipes', { query }),

  get: (recipeId: string) => apiRequest<RecipeDetail>(`/recipes/${recipeId}`),

  suggestions: (query: { limit?: number; minMatch?: number; prioritizeExpiring?: boolean; q?: string } = {}) =>
    apiRequest<RecipeSuggestion[]>('/recipes/suggestions', { query }),

  favorites: () => apiRequest<RecipeSummary[]>('/recipes/favorites'),

  addFavorite: (recipeId: string) =>
    apiRequest<unknown>(`/recipes/${recipeId}/favorite`, { method: 'POST', body: {} }),

  removeFavorite: (recipeId: string) =>
    apiRequest<unknown>(`/recipes/${recipeId}/favorite`, { method: 'DELETE' }),

  missingIngredients: (recipeId: string, servings?: number) =>
    apiRequest<MissingIngredientsReport>(`/recipes/${recipeId}/missing-ingredients`, {
      query: { servings },
    }),

  generateShoppingList: (
    recipeId: string,
    input: { name?: string; plannedFor?: string; servings?: number; type?: string; recurrenceEndDate?: string } = {},
  ) =>
    apiRequest<GeneratedShoppingListResult>(`/recipes/${recipeId}/generate-shopping-list`, {
      method: 'POST',
      body: input,
    }),

  create: (input: RecipeEditorInput) =>
    apiRequest<RecipeDetail>('/recipes', { method: 'POST', body: input }),

  update: (recipeId: string, input: Partial<RecipeEditorInput>) =>
    apiRequest<RecipeDetail>(`/recipes/${recipeId}`, { method: 'PATCH', body: input }),
};

// /recipes/:id/generate-shopping-list and /meals/:id/generate-shopping-list wrap the list in this shape.
export type GeneratedShoppingListResult = {
  shoppingList: ShoppingList;
  missingSummary: MissingIngredientsReport;
};

export type RecipeEditorInput = {
  visibility?: 'personal' | 'shared';
  name: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  ingredients: {
    foodId?: string;
    name?: string;
    quantity: number;
    unit?: string;
    optional?: boolean;
  }[];
  steps: string[];
  nutrition?: { calories?: number; protein?: number; carbs?: number; fat?: number };
  tags?: string[];
};

// ---------- Family ----------

export const familyApi = {
  current: () => apiRequest<Family>('/family'),
  
  list: () => apiRequest<Family[]>('/family/list'),
  
  switch: (familyId: string) => apiRequest<Family>(`/family/${familyId}/switch`, { method: 'POST' }),

  create: (name: string) => apiRequest<Family>('/family', { method: 'POST', body: { name } }),

  createInvite: (input: { permissions?: FamilyPermission[]; expiresInHours?: number } = {}) =>
    apiRequest<FamilyInvite>('/family/invite', { method: 'POST', body: input }),

  join: (inviteCode: string) =>
    apiRequest<Family>('/family/join', { method: 'POST', body: { inviteCode } }),

  updateMemberPermissions: (memberId: string, permissions: FamilyPermission[]) =>
    apiRequest<Family>(`/family/members/${memberId}/permissions`, {
      method: 'PATCH',
      body: { permissions },
    }),

  removeMember: (memberId: string) =>
    apiRequest<Family>(`/family/members/${memberId}`, { method: 'DELETE' }),
};

// ---------- Notifications ----------

export const notificationsApi = {
  list: (query: { unreadOnly?: boolean; limit?: number } = {}) =>
    apiRequest<AppNotification[]>('/notifications', { query }),

  markAsRead: (notificationId: string) =>
    apiRequest<AppNotification>(`/notifications/${notificationId}/read`, { method: 'PATCH' }),

  markAllAsRead: () =>
    apiRequest<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' }),
};

// ---------- Admin ----------

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminUserRecord = {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  gender?: string;
  role: string;
  status: string;
  activeFamilyId?: string;
  lastLoginAt?: string;
};

export type AdminRecipeRecord = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes: number;
  difficulty: string;
  servings: number;
  status: string;
  moderationNote?: string;
  tags: string[];
  ingredientCount: number;
  favoritesCount: number;
  authorId?: string;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  status: string;
};

export type AdminUnit = {
  id: string;
  code: string;
  name: string;
  type?: string;
  status: string;
};

export type AdminFood = {
  id: string;
  name: string;
  normalizedName?: string;
  categoryId: string;
  defaultUnit: string;
  aliases: string[];
  defaultStorageLocation: StorageLocation;
  defaultShelfLifeDays?: number;
  storageTips?: string;
  imageUrl?: string;
  barcode?: string;
  isSystem?: boolean;
  status: string;
};

export type AdminFoodInput = {
  name?: string;
  categoryId?: string;
  defaultUnit?: string;
  aliases?: string[];
  defaultStorageLocation?: StorageLocation;
  defaultShelfLifeDays?: number;
  storageTips?: string;
  barcode?: string;
  imageUrl?: string;
};

export type AdminStatsResponse = {
  users: { total: number; active: number };
  recipes: { total: number; byStatus: Record<string, number> };
  families: { total: number };
};

export const adminApi = {
  stats: () => apiRequest<AdminStatsResponse>('/admin/stats'),

  listUsers: (query: { status?: string; role?: string; search?: string; page?: number; limit?: number } = {}) =>
    apiRequest<Paginated<AdminUserRecord>>('/admin/users', { query }),

  createUser: (input: {
    email?: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) => apiRequest<AdminUserRecord>('/admin/users', { method: 'POST', body: input }),

  updateUser: (userId: string, input: Partial<Pick<AdminUserRecord, 'firstName' | 'lastName' | 'displayName' | 'role' | 'status'>>) =>
    apiRequest<AdminUserRecord>(`/admin/users/${userId}`, { method: 'PATCH', body: input }),

  deleteUser: (userId: string) =>
    apiRequest<unknown>(`/admin/users/${userId}`, { method: 'DELETE' }),

  listModerationRecipes: (status = 'pending', page = 1) =>
    apiRequest<Paginated<AdminRecipeRecord>>('/admin/recipes', { query: { status, page } }),

  setRecipeStatus: (recipeId: string, status: 'approved' | 'rejected', note?: string) =>
    apiRequest<AdminRecipeRecord>(`/admin/recipes/${recipeId}/status`, {
      method: 'PATCH',
      body: { status, note },
    }),

  listCategories: (query: { status?: string; search?: string } = {}) =>
    apiRequest<AdminCategory[]>('/admin/catalog/categories', { query }),

  createCategory: (input: { name: string; description?: string; icon?: string }) =>
    apiRequest<AdminCategory>('/admin/catalog/categories', { method: 'POST', body: input }),

  deleteCategory: (categoryId: string) =>
    apiRequest<unknown>(`/admin/catalog/categories/${categoryId}`, { method: 'DELETE' }),

  listFoods: (query: { status?: string; search?: string } = {}) =>
    apiRequest<AdminFood[]>('/admin/catalog/foods', { query }),

  createFood: (input: AdminFoodInput & { name: string; categoryId: string; defaultUnit: string }) =>
    apiRequest<AdminFood>('/admin/catalog/foods', { method: 'POST', body: input }),

  updateFood: (foodId: string, input: AdminFoodInput) =>
    apiRequest<AdminFood>(`/admin/catalog/foods/${foodId}`, { method: 'PATCH', body: input }),

  deleteFood: (foodId: string) =>
    apiRequest<unknown>(`/admin/catalog/foods/${foodId}`, { method: 'DELETE' }),

  listUnits: (query: { status?: string; search?: string } = {}) =>
    apiRequest<AdminUnit[]>('/admin/catalog/units', { query }),

  createUnit: (input: { code: string; name: string; type?: string }) =>
    apiRequest<AdminUnit>('/admin/catalog/units', { method: 'POST', body: input }),

  deleteUnit: (unitId: string) =>
    apiRequest<unknown>(`/admin/catalog/units/${unitId}`, { method: 'DELETE' }),
};

// ---------- AI Chef ----------

export const aiChefApi = {
  status: () => apiRequest<{ configured: boolean }>('/ai-chef/status'),

  chat: (message: string, conversationId?: string) =>
    apiRequest<{ reply: string; conversationId: string }>('/ai-chef/chat', {
      method: 'POST',
      body: { message, conversationId },
    }),
};

// ---------- Reports ----------

export const reportsApi = {
  dashboard: (startDate: string, endDate: string) =>
    apiRequest<DashboardReport>('/reports/dashboard', { query: { startDate, endDate } }),

  consumptionTrends: (startDate: string, endDate: string) =>
    apiRequest<ConsumptionTrendsReport>('/reports/consumption-trends', {
      query: { startDate, endDate },
    }),

  waste: (startDate: string, endDate: string) =>
    apiRequest<WasteReport>('/reports/waste', { query: { startDate, endDate } }),
};
