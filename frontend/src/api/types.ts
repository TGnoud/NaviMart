export type UserRole = 'admin' | 'housewife' | 'member';

export type AuthUser = {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: string;
  activeFamilyId?: string;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

export type ShoppingListType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type ShoppingListStatus = 'active' | 'completed' | 'archived';
export type ShoppingItemStatus = 'pending' | 'bought';

export type ShoppingListItem = {
  id: string;
  foodId?: string;
  categoryId?: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  status: ShoppingItemStatus;
  note?: string;
  boughtAt?: string;
};

export type ShoppingList = {
  id: string;
  familyId: string;
  name: string;
  type: ShoppingListType;
  status: ShoppingListStatus;
  plannedFor?: string;
  completedAt?: string;
  recurrenceGroupId?: string;
  createdBy: string;
  progress: { bought: number; total: number };
  items: ShoppingListItem[];
};

export type StorageLocation = 'freezer' | 'fridge' | 'pantry' | 'other';
export type ExpiryStatus = 'safe' | 'expiring' | 'expired';
export type PantryItemStatus = 'active' | 'used_up' | 'wasted' | 'expired';

export type PantryItem = {
  id: string;
  familyId: string;
  foodId?: string;
  categoryId?: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  expiryStatus: ExpiryStatus;
  location: StorageLocation;
  status: PantryItemStatus;
  source: string;
  createdBy: string;
  note?: string;
  imageUrl?: string;
  consumedAt?: string;
  wastedAt?: string;
};

export type MealSession = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'custom';

export type MealPlan = {
  id: string;
  familyId: string;
  date: string;
  session: MealSession;
  customSessionName?: string;
  recipeId?: string;
  recipeName?: string;
  customName?: string;
  servings: number;
  isCompleted: boolean;
  // True when completed but the auto-created shortfall shopping list is still
  // active — the meal is "waiting" for those ingredients to be bought.
  awaitingIngredients?: boolean;
  note?: string;
  createdBy: string;
};

export type MealShortageLine = {
  name: string;
  unit: string;
  missingQuantity: number;
};

// Returned by PATCH /meals/:id when completing a meal left some ingredients
// short: which lines were missing and the shopping list auto-created for them.
export type MealCompletionResult = {
  shortages: MealShortageLine[];
  shoppingListId?: string;
  shoppingListName?: string;
};

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type RecipeVisibility = 'personal' | 'shared';

export type RecipeSummary = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes: number;
  difficulty: RecipeDifficulty;
  servings: number;
  status: RecipeStatus;
  visibility: RecipeVisibility;
  tags: string[];
  ingredientCount: number;
  isFavorite?: boolean;
  favoritesCount?: number;
};

export type RecipeIngredient = {
  foodId?: string;
  categoryId?: string;
  name: string;
  quantity: number;
  unit: string;
  optional: boolean;
};

export type RecipeNutrition = {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export type RecipeDetail = RecipeSummary & {
  authorId?: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  nutrition: RecipeNutrition;
};

export type MissingIngredientLine = {
  foodId?: string;
  categoryId?: string;
  name: string;
  unit: string;
  requiredQuantity: number;
  availableQuantity: number;
  missingQuantity: number;
  isMissing: boolean;
};

export type MissingIngredientsReport = {
  recipeId: string;
  recipeName: string;
  servings: number;
  hasMissingIngredients: boolean;
  ingredients: MissingIngredientLine[];
  missingIngredients: MissingIngredientLine[];
};

export type RecipeSuggestion = {
  recipe: RecipeSummary;
  availableCount: number;
  totalCount: number;
  matchRatio: number;
  missingIngredients: string[];
};

export type FamilyPermission =
  | 'manage_family'
  | 'edit_pantry'
  | 'edit_lists'
  | 'edit_meals'
  | 'view_reports';

export type FamilyMember = {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  permissions: FamilyPermission[];
  status: string;
  joinedAt?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  };
};

export type Family = {
  id: string;
  name: string;
  ownerId: string;
  members: FamilyMember[];
  activeInvites: {
    permissions: FamilyPermission[];
    createdBy: string;
    expiresAt: string;
  }[];
};

export type FamilyInvite = {
  inviteCode: string;
  expiresAt: string;
  permissions: FamilyPermission[];
};

export type AppNotification = {
  id: string;
  userId: string;
  familyId?: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: string;
};

export type DashboardReport = {
  range: { startDate: string; endDate: string };
  shopping: {
    totalLists: number;
    activeLists: number;
    completedLists: number;
    archivedLists: number;
    totalItems: number;
    boughtItems: number;
    completionRate: number;
  };
  pantry: {
    byStatus: Record<string, number>;
    byLocation: Record<string, number>;
  };
  inventory: {
    byEventType: Record<string, { count: number; totalQuantityDelta: number }>;
  };
  waste: {
    eventCount: number;
    totalWastedQuantity: number;
  };
};

export type ConsumptionTrendsReport = {
  range: { startDate: string; endDate: string };
  eventsByDay: {
    day: string;
    type: string;
    totalQuantityDelta: number;
    eventCount: number;
  }[];
  topConsumed: {
    name: string;
    unit: string;
    quantity: number;
    eventCount: number;
  }[];
};

export type WasteReport = {
  range: { startDate: string; endDate: string };
  wastedItems: {
    name: string;
    unit: string;
    wastedQuantity: number;
    eventCount: number;
  }[];
  expiredActiveItems: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    expiryDate: string;
    location: StorageLocation;
  }[];
};

export type CompleteShoppingListResult = {
  shoppingList: ShoppingList;
  pantryItems: Partial<PantryItem>[];
};

export type Category = {
  id: string;
  name: string;
  status?: string;
};

export type AdminUser = AuthUser & {
  createdAt?: string;
  lastLoginAt?: string;
};

export type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  totalFamilies: number;
  recipesByStatus: Record<string, number>;
};
