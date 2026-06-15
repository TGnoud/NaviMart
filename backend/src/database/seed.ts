import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { hash } from 'bcryptjs';
import mongoose, { Model } from 'mongoose';
import {
  Category,
  CategorySchema,
} from '../catalog/schemas/category.schema';
import { Food, FoodSchema } from '../catalog/schemas/food.schema';
import { Unit, UnitSchema } from '../catalog/schemas/unit.schema';
import {
  Family,
  FamilySchema,
} from '../families/schemas/family.schema';
import {
  InventoryEvent,
  InventoryEventSchema,
} from '../inventory-events/schemas/inventory-event.schema';
import {
  MealPlan,
  MealPlanSchema,
} from '../meals/schemas/meal-plan.schema';
import {
  Notification,
  NotificationSchema,
} from '../notifications/schemas/notification.schema';
import {
  PantryItem,
  PantryItemSchema,
} from '../pantry/schemas/pantry-item.schema';
import {
  RecipeFavorite,
  RecipeFavoriteSchema,
} from '../recipes/schemas/recipe-favorite.schema';
import { Recipe, RecipeSchema } from '../recipes/schemas/recipe.schema';
import {
  ShoppingList,
  ShoppingListSchema,
} from '../shopping-lists/schemas/shopping-list.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

type SeedCategory = {
  name: string;
  slug: string;
  description: string;
  icon: string;
};

type SeedUnit = {
  code: string;
  name: string;
  type: 'weight' | 'volume' | 'count' | 'package';
};

type SeedFood = {
  name: string;
  categorySlug: string;
  defaultUnit: string;
  aliases?: string[];
  defaultStorageLocation: 'freezer' | 'fridge' | 'pantry' | 'other';
  defaultShelfLifeDays: number;
  storageTips: string;
  imageUrl?: string;
  barcode?: string;
};

type SeedRecipeIngredient = {
  foodName: string;
  quantity: number;
  unit?: string;
  optional?: boolean;
};

type SeedRecipe = {
  name: string;
  description: string;
  imageUrl?: string;
  cookTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  ingredients: SeedRecipeIngredient[];
  steps: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
};

type CookpadRecipeRecord = {
  title?: string;
  url?: string;
  image_url?: string;
  intro?: string;
  ingredients?: string[];
  steps?: string[];
  tips?: string[];
};

type SeedUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: 'housewife' | 'member';
  gender: 'male' | 'female' | 'other' | 'unspecified';
};

type SeedPantryItem = {
  foodName: string;
  quantity: number;
  unit?: string;
  expiresInDays: number;
  location: 'freezer' | 'fridge' | 'pantry' | 'other';
  source: 'manual' | 'shopping' | 'meal' | 'import';
  note?: string;
};

type SeedShoppingList = {
  name: string;
  type: 'daily' | 'weekly' | 'custom';
  status: 'active' | 'completed' | 'archived';
  plannedInDays: number;
  completedOffsetDays?: number;
  items: Array<{
    foodName: string;
    quantity: number;
    unit?: string;
    checked?: boolean;
    note?: string;
  }>;
};

type SeedMealPlan = {
  recipeName?: string;
  customName?: string;
  offsetDays: number;
  session: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'custom';
  servings: number;
  isCompleted?: boolean;
  note?: string;
};

const categories: SeedCategory[] = [
  {
    name: 'Rau cu',
    slug: 'rau-cu',
    description: 'Rau xanh, cu qua va nam tuoi.',
    icon: 'leaf',
  },
  {
    name: 'Thit ca',
    slug: 'thit-ca',
    description: 'Thit, ca, hai san va protein tuoi song.',
    icon: 'beef',
  },
  {
    name: 'Do kho',
    slug: 'do-kho',
    description: 'Gao, mi, ngu coc va thuc pham kho.',
    icon: 'package',
  },
  {
    name: 'Gia vi',
    slug: 'gia-vi',
    description: 'Gia vi, sot, dau an va nguyen lieu nem.',
    icon: 'chef-hat',
  },
  {
    name: 'Sua trung',
    slug: 'sua-trung',
    description: 'Sua, trung va cac san pham tu sua.',
    icon: 'egg',
  },
  {
    name: 'Trai cay',
    slug: 'trai-cay',
    description: 'Trai cay tuoi va trai cay cat san.',
    icon: 'apple',
  },
];

const units: SeedUnit[] = [
  { code: 'g', name: 'Gram', type: 'weight' },
  { code: 'kg', name: 'Kilogram', type: 'weight' },
  { code: 'ml', name: 'Milliliter', type: 'volume' },
  { code: 'l', name: 'Liter', type: 'volume' },
  { code: 'cai', name: 'Cai', type: 'count' },
  { code: 'qua', name: 'Qua', type: 'count' },
  { code: 'bo', name: 'Bo', type: 'count' },
  { code: 'hop', name: 'Hop', type: 'package' },
  { code: 'goi', name: 'Goi', type: 'package' },
  { code: 'chai', name: 'Chai', type: 'package' },
  { code: 'muong', name: 'Muong', type: 'count' },
];

const foods: SeedFood[] = [
  {
    name: 'Thit bo',
    categorySlug: 'thit-ca',
    defaultUnit: 'g',
    aliases: ['bo', 'beef'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 3,
    storageTips: 'Bao quan ngan mat, dung som trong 1-3 ngay.',
    barcode: '8934673009012',
  },
  {
    name: 'Thit ga',
    categorySlug: 'thit-ca',
    defaultUnit: 'g',
    aliases: ['ga', 'chicken'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 2,
    storageTips: 'De trong hop kin, tranh tiep xuc thuc pham chin.',
  },
  {
    name: 'Ca hoi',
    categorySlug: 'thit-ca',
    defaultUnit: 'g',
    aliases: ['salmon'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 2,
    storageTips: 'Giu lanh sau khi mua, nen dung trong 24-48 gio.',
  },
  {
    name: 'Trung ga',
    categorySlug: 'sua-trung',
    defaultUnit: 'qua',
    aliases: ['trung'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 21,
    storageTips: 'De trong vi tri on dinh nhiet do, khong rua truoc khi cat.',
    barcode: '8934673005678',
  },
  {
    name: 'Sua tuoi',
    categorySlug: 'sua-trung',
    defaultUnit: 'ml',
    aliases: ['sua'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 5,
    storageTips: 'Dong nap kin sau khi mo va dung trong vai ngay.',
    barcode: '8934673001234',
  },
  {
    name: 'Ca rot',
    categorySlug: 'rau-cu',
    defaultUnit: 'g',
    aliases: ['carrot'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 14,
    storageTips: 'Cat bo la, de ngan rau cu.',
  },
  {
    name: 'Bong cai xanh',
    categorySlug: 'rau-cu',
    defaultUnit: 'g',
    aliases: ['broccoli'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 5,
    storageTips: 'De kho thoang trong tui giay hoac hop co lo thoang.',
  },
  {
    name: 'Ca chua',
    categorySlug: 'rau-cu',
    defaultUnit: 'g',
    aliases: ['tomato'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 7,
    storageTips: 'De noi thoang mat neu chua chin qua.',
  },
  {
    name: 'Hanh tay',
    categorySlug: 'rau-cu',
    defaultUnit: 'g',
    aliases: ['onion'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 21,
    storageTips: 'De noi kho, thoang, tranh anh nang truc tiep.',
  },
  {
    name: 'Gao',
    categorySlug: 'do-kho',
    defaultUnit: 'g',
    aliases: ['rice'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 180,
    storageTips: 'Bao quan trong hop kin, tranh am.',
  },
  {
    name: 'Mi goi',
    categorySlug: 'do-kho',
    defaultUnit: 'goi',
    aliases: ['mi an lien'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 120,
    storageTips: 'De noi kho mat.',
    barcode: '8934673003456',
  },
  {
    name: 'Dau an',
    categorySlug: 'gia-vi',
    defaultUnit: 'ml',
    aliases: ['oil'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 180,
    storageTips: 'Dong nap kin, tranh anh nang.',
  },
  {
    name: 'Nuoc mam',
    categorySlug: 'gia-vi',
    defaultUnit: 'ml',
    aliases: ['fish sauce'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 365,
    storageTips: 'Dong nap kin sau khi dung.',
  },
  {
    name: 'Gung',
    categorySlug: 'gia-vi',
    defaultUnit: 'g',
    aliases: ['ginger'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 14,
    storageTips: 'De noi kho thoang hoac ngan mat neu da cat.',
  },
  {
    name: 'Tao',
    categorySlug: 'trai-cay',
    defaultUnit: 'qua',
    aliases: ['apple'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 21,
    storageTips: 'De ngan mat de giu do gion lau hon.',
  },
  {
    name: 'Chuoi',
    categorySlug: 'trai-cay',
    defaultUnit: 'qua',
    aliases: ['banana'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 5,
    storageTips: 'De ngoai nhiet do phong, tach khoi trai cay khac neu chin nhanh.',
  },
];

const extraFoods: SeedFood[] = [
  {
    name: 'Thit heo',
    categorySlug: 'thit-ca',
    defaultUnit: 'g',
    aliases: ['heo', 'pork'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 3,
    storageTips: 'Bao quan ngan mat trong hop kin, nen dung trong 2-3 ngay.',
  },
  {
    name: 'Tom',
    categorySlug: 'thit-ca',
    defaultUnit: 'g',
    aliases: ['shrimp'],
    defaultStorageLocation: 'freezer',
    defaultShelfLifeDays: 30,
    storageTips: 'Cap dong neu chua dung ngay, ra dong trong ngan mat.',
  },
  {
    name: 'Muc',
    categorySlug: 'thit-ca',
    defaultUnit: 'g',
    aliases: ['squid'],
    defaultStorageLocation: 'freezer',
    defaultShelfLifeDays: 30,
    storageTips: 'Lam sach, de hop kin va cap dong.',
  },
  {
    name: 'Ca thu',
    categorySlug: 'thit-ca',
    defaultUnit: 'g',
    aliases: ['mackerel'],
    defaultStorageLocation: 'freezer',
    defaultShelfLifeDays: 45,
    storageTips: 'Chia khau phan nho truoc khi cap dong.',
  },
  {
    name: 'Dau hu',
    categorySlug: 'sua-trung',
    defaultUnit: 'hop',
    aliases: ['tofu'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 5,
    storageTips: 'Ngam nuoc sach va thay nuoc moi ngay neu da mo hop.',
  },
  {
    name: 'Sua chua',
    categorySlug: 'sua-trung',
    defaultUnit: 'hop',
    aliases: ['yogurt'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 14,
    storageTips: 'Giu lanh lien tuc, dung truoc han tren nap.',
  },
  {
    name: 'Pho kho',
    categorySlug: 'do-kho',
    defaultUnit: 'g',
    aliases: ['pho noodles'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 180,
    storageTips: 'De noi kho thoang, dong kin sau khi mo.',
  },
  {
    name: 'Bun kho',
    categorySlug: 'do-kho',
    defaultUnit: 'g',
    aliases: ['vermicelli'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 180,
    storageTips: 'Bao quan trong hop kin tranh am.',
  },
  {
    name: 'Mi y',
    categorySlug: 'do-kho',
    defaultUnit: 'g',
    aliases: ['spaghetti', 'pasta'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 240,
    storageTips: 'De noi kho mat, tranh anh nang truc tiep.',
  },
  {
    name: 'Banh mi',
    categorySlug: 'do-kho',
    defaultUnit: 'cai',
    aliases: ['bread'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 2,
    storageTips: 'Dung trong ngay, co the cap dong neu mua nhieu.',
  },
  {
    name: 'Khoai tay',
    categorySlug: 'rau-cu',
    defaultUnit: 'g',
    aliases: ['potato'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 21,
    storageTips: 'De noi kho toi, tranh de gan hanh tay.',
  },
  {
    name: 'Khoai lang',
    categorySlug: 'rau-cu',
    defaultUnit: 'g',
    aliases: ['sweet potato'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 14,
    storageTips: 'De noi kho thoang, khong de trong tu lanh lau.',
  },
  {
    name: 'Rau muong',
    categorySlug: 'rau-cu',
    defaultUnit: 'bo',
    aliases: ['water spinach'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 3,
    storageTips: 'Boc giay am va de ngan rau.',
  },
  {
    name: 'Bap cai',
    categorySlug: 'rau-cu',
    defaultUnit: 'g',
    aliases: ['cabbage'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 10,
    storageTips: 'Boc kin phan da cat va de ngan mat.',
  },
  {
    name: 'Dua leo',
    categorySlug: 'rau-cu',
    defaultUnit: 'g',
    aliases: ['cucumber'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 5,
    storageTips: 'De ngan rau, tranh dong nuoc.',
  },
  {
    name: 'Nam huong',
    categorySlug: 'rau-cu',
    defaultUnit: 'g',
    aliases: ['mushroom'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 5,
    storageTips: 'De trong tui giay hoac hop thoang khi.',
  },
  {
    name: 'Bap my',
    categorySlug: 'rau-cu',
    defaultUnit: 'qua',
    aliases: ['corn'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 5,
    storageTips: 'Giu nguyen vo neu chua dung ngay.',
  },
  {
    name: 'Dau que',
    categorySlug: 'rau-cu',
    defaultUnit: 'g',
    aliases: ['green bean'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 5,
    storageTips: 'De kho thoang trong hop kin.',
  },
  {
    name: 'Toi',
    categorySlug: 'gia-vi',
    defaultUnit: 'g',
    aliases: ['garlic'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 60,
    storageTips: 'De noi kho thoang, tranh am moc.',
  },
  {
    name: 'Sa',
    categorySlug: 'gia-vi',
    defaultUnit: 'g',
    aliases: ['lemongrass'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 14,
    storageTips: 'Boc kin va de ngan mat hoac cap dong.',
  },
  {
    name: 'Ot',
    categorySlug: 'gia-vi',
    defaultUnit: 'g',
    aliases: ['chili'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 10,
    storageTips: 'De kho, co the cap dong neu mua nhieu.',
  },
  {
    name: 'Cam',
    categorySlug: 'trai-cay',
    defaultUnit: 'qua',
    aliases: ['orange'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 14,
    storageTips: 'De ngan mat de giu nuoc lau hon.',
  },
  {
    name: 'Dua hau',
    categorySlug: 'trai-cay',
    defaultUnit: 'g',
    aliases: ['watermelon'],
    defaultStorageLocation: 'fridge',
    defaultShelfLifeDays: 5,
    storageTips: 'Cat ra thi boc kin va dung trong 2-3 ngay.',
  },
  {
    name: 'Dau phong',
    categorySlug: 'do-kho',
    defaultUnit: 'g',
    aliases: ['peanut'],
    defaultStorageLocation: 'pantry',
    defaultShelfLifeDays: 120,
    storageTips: 'Bao quan hop kin, tranh dau bi hoi.',
  },
];

foods.push(...extraFoods);

const commonsImage = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}?width=900`;

const recipeImageMap: Record<string, string> = {
  'beef vegetable stir fry': 'Vietnamese_cuisine_-_table_serving.jpg',
  'tomato egg soup': 'Tomato_and_egg_soup.jpg',
  'ginger chicken': 'Vietnamese_cuisine_-_table_serving.jpg',
  'salmon rice': 'C%C6%A1m_Chi%C3%AAn%2C_Da_Nang%2C_Vietnam.jpg',
  'fruit salad': 'Vietnamese_cuisine_-_table_serving.jpg',
  'vietnamese chicken pho': 'Pho_Ha_Noi.jpg',
  'bun thit nuong vietnamese': 'Bun_thit_nuong.jpg',
  'vietnamese spring rolls shrimp pork': 'Spring_rolls_with_peanut_sauce.jpg',
  'com tam vietnamese pork rice': 'C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg',
  'garlic shrimp vietnamese': 'Vietnamese_cuisine_-_table_serving.jpg',
  'spicy squid lemongrass': 'Vietnamese_cuisine_-_table_serving.jpg',
  'vietnamese braised fish tomato': 'Vietnamese_cuisine_-_table_serving.jpg',
  'tofu tomato sauce': 'Vietnamese_cuisine_-_table_serving.jpg',
  'stir fried water spinach garlic': 'Tumis_kangkung_Makassar.JPG',
  'cabbage pork soup': 'Vietnamese_cuisine_-_table_serving.jpg',
  'mashed potato egg breakfast': 'Tomato_and_egg_soup.jpg',
  'roasted sweet potato yogurt': 'Vietnamese_cuisine_-_table_serving.jpg',
  'spaghetti beef tomato sauce': 'Vietnamese_cuisine_-_table_serving.jpg',
  'banh mi egg breakfast': 'B%C3%A1nh_m%C3%AC_th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng.png',
  'chicken yogurt salad': 'Vietnamese_cuisine_-_table_serving.jpg',
  'vietnamese sour soup shrimp': 'Canh_chua.jpg',
  'fried rice vegetables egg': 'C%C6%A1m_Chi%C3%AAn%2C_Da_Nang%2C_Vietnam.jpg',
  'corn green beans stir fry': 'Tumis_kangkung_Makassar.JPG',
  'beef mushroom stir fry': 'Vietnamese_cuisine_-_table_serving.jpg',
  'apple orange yogurt bowl': 'Vietnamese_cuisine_-_table_serving.jpg',
  'watermelon milk smoothie': 'Vietnamese_cuisine_-_table_serving.jpg',
  'lemongrass chili chicken': 'Vietnamese_cuisine_-_table_serving.jpg',
  'vietnamese braised pork eggs': 'C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg',
  'vietnamese fish noodle soup': 'Pho_Ha_Noi.jpg',
  'instant noodles egg vegetables': 'Pho_Ha_Noi.jpg',
  'cabbage rolls tofu mushroom': 'Spring_rolls_with_peanut_sauce.jpg',
  'chicken corn soup': 'Tomato_and_egg_soup.jpg',
};

const recipeImage = (query: string) => commonsImage(recipeImageMap[query] ?? 'Vietnamese_cuisine_-_table_serving.jpg');

const cookpadJsonPath = resolve(process.cwd(), '..', 'cookpad_recipes_full.json');

function normalizeForMatch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function cleanCookpadText(value?: string) {
  return (value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/#\S+/g, '')
    .replace(/\s*Xem thêm\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3).trim()}...`;
}

function cookpadImageUrl(value?: string) {
  const imageUrl = cleanCookpadText(value);
  if (!imageUrl || imageUrl.includes('logo_ogp')) return undefined;
  return imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
}

function inferCookpadIngredients(recipe: CookpadRecipeRecord): SeedRecipeIngredient[] {
  const text = normalizeForMatch(`${recipe.title ?? ''} ${recipe.intro ?? ''}`);
  const ingredients: SeedRecipeIngredient[] = [];
  const add = (ingredient: SeedRecipeIngredient) => {
    if (!ingredients.some((item) => item.foodName === ingredient.foodName)) {
      ingredients.push(ingredient);
    }
  };
  const has = (...keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

  if (has('banh mi')) add({ foodName: 'Banh mi', quantity: 2, unit: 'cai' });
  if (has('pho')) add({ foodName: 'Pho kho', quantity: 300, unit: 'g' });
  if (has('bun')) add({ foodName: 'Bun kho', quantity: 300, unit: 'g' });
  if (has('spaghetti', 'udon', 'soba', 'nui', 'mi ', ' mi', 'mì')) {
    add({ foodName: has('mi goi') ? 'Mi goi' : 'Mi y', quantity: has('mi goi') ? 2 : 250, unit: has('mi goi') ? 'goi' : 'g' });
  }
  if (has('com', 'cơm')) add({ foodName: 'Gao', quantity: 250, unit: 'g' });
  if (has('ga ', ' ga', 'gà', 'canh ga')) add({ foodName: 'Thit ga', quantity: 400, unit: 'g' });
  if (has('bo ', ' bo', 'bò')) add({ foodName: 'Thit bo', quantity: 350, unit: 'g' });
  if (has('heo', 'thit', 'suon', 'ba chi', 'gio heo')) add({ foodName: 'Thit heo', quantity: 400, unit: 'g' });
  if (has('tom', 'tôm')) add({ foodName: 'Tom', quantity: 300, unit: 'g' });
  if (has('muc', 'hai san', 'hải sản')) add({ foodName: 'Muc', quantity: 300, unit: 'g' });
  if (has('ca ', ' ca', 'cá')) add({ foodName: 'Ca thu', quantity: 400, unit: 'g' });
  if (has('trung', 'trứng')) add({ foodName: 'Trung ga', quantity: 2, unit: 'qua' });
  if (has('dau phu', 'dau hu', 'tofu', 'đậu phụ')) add({ foodName: 'Dau hu', quantity: 2, unit: 'hop' });
  if (has('nam', 'nấm')) add({ foodName: 'Nam huong', quantity: 200, unit: 'g' });
  if (has('rau muong')) add({ foodName: 'Rau muong', quantity: 1, unit: 'bo' });
  if (has('rau', 'canh', 'cai')) add({ foodName: 'Bap cai', quantity: 300, unit: 'g' });
  if (has('ca chua', 'cà chua', 'sot ca')) add({ foodName: 'Ca chua', quantity: 250, unit: 'g' });
  if (has('dua leo')) add({ foodName: 'Dua leo', quantity: 150, unit: 'g' });
  if (has('bap', 'ngo')) add({ foodName: 'Bap my', quantity: 1, unit: 'qua' });
  if (has('khoai')) add({ foodName: 'Khoai tay', quantity: 300, unit: 'g' });
  if (has('sua chua')) add({ foodName: 'Sua chua', quantity: 1, unit: 'hop' });
  if (has('sua ', 'sữa')) add({ foodName: 'Sua tuoi', quantity: 150, unit: 'ml' });
  if (has('gung', 'gừng')) add({ foodName: 'Gung', quantity: 20, unit: 'g' });
  if (has('sa ', ' sa', 'sả')) add({ foodName: 'Sa', quantity: 20, unit: 'g' });
  if (has('toi', 'tỏi')) add({ foodName: 'Toi', quantity: 15, unit: 'g' });
  if (has('ot', 'ớt')) add({ foodName: 'Ot', quantity: 5, unit: 'g', optional: true });
  if (ingredients.length === 0) add({ foodName: 'Gao', quantity: 250, unit: 'g' });
  add({ foodName: 'Dau an', quantity: 15, unit: 'ml', optional: true });
  add({ foodName: 'Nuoc mam', quantity: 15, unit: 'ml', optional: true });

  return ingredients.slice(0, 6);
}

function cookpadSteps(recipe: CookpadRecipeRecord) {
  const rawSteps = (recipe.steps ?? []).map(cleanCookpadText).filter(Boolean);
  const usableSteps = rawSteps
    .filter((step) => !step.includes('@'))
    .flatMap((step) => step.split(/(?=\d+\.\s)/g))
    .map((step) => truncateText(step, 260))
    .filter(Boolean);

  if (usableSteps.length > 0) return usableSteps.slice(0, 6);

  const name = cleanCookpadText(recipe.title);
  return [
    `So che nguyen lieu cho mon ${name}.`,
    'Uop va chuan bi gia vi vua an.',
    'Nau tren lua vua den khi nguyen lieu chin va tham vi.',
    'Trinh bay va dung nong.',
  ];
}

function cookpadDifficulty(recipe: CookpadRecipeRecord): SeedRecipe['difficulty'] {
  const text = normalizeForMatch(`${recipe.title ?? ''} ${recipe.intro ?? ''}`);
  if (text.includes('ham') || text.includes('kho') || text.includes('quay')) return 'medium';
  if (text.includes('don gian') || text.includes('nhanh') || text.includes('salad')) return 'easy';
  return 'medium';
}

function cookpadCookTime(recipe: CookpadRecipeRecord) {
  const text = normalizeForMatch(`${recipe.title ?? ''} ${recipe.intro ?? ''}`);
  if (text.includes('salad') || text.includes('trung')) return 15;
  if (text.includes('ham') || text.includes('kho') || text.includes('quay')) return 45;
  if (text.includes('canh') || text.includes('bun') || text.includes('pho') || text.includes('mi')) return 30;
  return 25;
}

function cookpadTags(recipe: CookpadRecipeRecord) {
  const text = normalizeForMatch(`${recipe.title ?? ''} ${recipe.intro ?? ''}`);
  const tags = ['cookpad'];
  if (text.includes('chay')) tags.push('vegetarian');
  if (text.includes('ga')) tags.push('chicken');
  if (text.includes('bo')) tags.push('beef');
  if (text.includes('tom') || text.includes('ca') || text.includes('muc')) tags.push('seafood');
  if (text.includes('bun') || text.includes('pho') || text.includes('mi')) tags.push('noodle');
  if (text.includes('canh') || text.includes('sup')) tags.push('soup');
  if (text.includes('salad')) tags.push('salad');
  return [...new Set(tags)].slice(0, 5);
}

function loadCookpadRecipes(): SeedRecipe[] {
  if (!existsSync(cookpadJsonPath)) return [];

  const records = JSON.parse(readFileSync(cookpadJsonPath, 'utf8')) as CookpadRecipeRecord[];
  return records
    .filter(
      (record) =>
        cleanCookpadText(record.title).length > 0 &&
        !record.url?.includes('/tao-moi') &&
        !record.image_url?.includes('logo_ogp'),
    )
    .map((record) => {
      const name = truncateText(cleanCookpadText(record.title), 180);
      const intro = cleanCookpadText(record.intro);
      const description = intro
        ? truncateText(intro, 780)
        : `Cong thuc Cookpad cho mon ${name}.`;

      return {
        name,
        description,
        imageUrl: cookpadImageUrl(record.image_url),
        cookTimeMinutes: cookpadCookTime(record),
        difficulty: cookpadDifficulty(record),
        servings: 2,
        ingredients: inferCookpadIngredients(record),
        steps: cookpadSteps(record),
        nutrition: { calories: 420, protein: 22, carbs: 45, fat: 16 },
        tags: cookpadTags(record),
      };
    });
}

const recipes: SeedRecipe[] = [
  {
    name: 'Thit bo xao rau cu',
    description: 'Mon xao nhanh voi thit bo, ca rot va bong cai xanh.',
    imageUrl: recipeImage('beef vegetable stir fry'),
    cookTimeMinutes: 25,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Thit bo', quantity: 300, unit: 'g' },
      { foodName: 'Ca rot', quantity: 150, unit: 'g' },
      { foodName: 'Bong cai xanh', quantity: 200, unit: 'g' },
      { foodName: 'Dau an', quantity: 20, unit: 'ml' },
      { foodName: 'Nuoc mam', quantity: 15, unit: 'ml' },
    ],
    steps: [
      'Cat mong thit bo va uop voi nuoc mam.',
      'So che rau cu thanh mieng vua an.',
      'Lam nong chao, xao thit bo nhanh tren lua lon.',
      'Them rau cu, dao deu den khi vua chin.',
    ],
    nutrition: { calories: 480, protein: 36, carbs: 28, fat: 22 },
    tags: ['quick', 'dinner', 'beef'],
  },
  {
    name: 'Canh ca chua trung',
    description: 'Canh don gian voi trung va ca chua cho bua an nhe.',
    imageUrl: recipeImage('tomato egg soup'),
    cookTimeMinutes: 15,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Trung ga', quantity: 2, unit: 'qua' },
      { foodName: 'Ca chua', quantity: 200, unit: 'g' },
      { foodName: 'Nuoc mam', quantity: 10, unit: 'ml' },
    ],
    steps: [
      'Cat mui cau ca chua.',
      'Nau soi nuoc, cho ca chua vao den khi mem.',
      'Danh tan trung va do tu tu vao noi.',
      'Nem nuoc mam vua an.',
    ],
    nutrition: { calories: 220, protein: 14, carbs: 12, fat: 12 },
    tags: ['soup', 'egg', 'quick'],
  },
  {
    name: 'Ga kho gung',
    description: 'Thit ga kho dam vi voi gung va nuoc mam.',
    imageUrl: recipeImage('ginger chicken'),
    cookTimeMinutes: 35,
    difficulty: 'medium',
    servings: 3,
    ingredients: [
      { foodName: 'Thit ga', quantity: 600, unit: 'g' },
      { foodName: 'Gung', quantity: 30, unit: 'g' },
      { foodName: 'Nuoc mam', quantity: 30, unit: 'ml' },
      { foodName: 'Dau an', quantity: 15, unit: 'ml' },
    ],
    steps: [
      'Cat thit ga thanh mieng vua an.',
      'Thai soi gung va uop cung thit ga, nuoc mam.',
      'Ap chao thit ga voi dau an.',
      'Them it nuoc va kho den khi sot sanh lai.',
    ],
    nutrition: { calories: 560, protein: 48, carbs: 8, fat: 34 },
    tags: ['chicken', 'dinner', 'vietnamese'],
  },
  {
    name: 'Com ca hoi ap chao',
    description: 'Ca hoi ap chao an cung com va rau cu.',
    imageUrl: recipeImage('salmon rice'),
    cookTimeMinutes: 30,
    difficulty: 'medium',
    servings: 2,
    ingredients: [
      { foodName: 'Ca hoi', quantity: 300, unit: 'g' },
      { foodName: 'Gao', quantity: 200, unit: 'g' },
      { foodName: 'Ca rot', quantity: 100, unit: 'g' },
      { foodName: 'Dau an', quantity: 10, unit: 'ml' },
    ],
    steps: [
      'Nau com tu gao.',
      'Uop ca hoi voi chut nuoc mam.',
      'Ap chao ca hoi den khi vang hai mat.',
      'An kem ca rot hap hoac xao nhanh.',
    ],
    nutrition: { calories: 620, protein: 34, carbs: 58, fat: 24 },
    tags: ['salmon', 'rice', 'healthy'],
  },
  {
    name: 'Salad trai cay sua tuoi',
    description: 'Mon nhe tu tao, chuoi va sua tuoi.',
    imageUrl: recipeImage('fruit salad'),
    cookTimeMinutes: 10,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Tao', quantity: 2, unit: 'qua' },
      { foodName: 'Chuoi', quantity: 2, unit: 'qua' },
      { foodName: 'Sua tuoi', quantity: 150, unit: 'ml' },
    ],
    steps: [
      'Cat nho tao va chuoi.',
      'Cho trai cay vao bat.',
      'Them sua tuoi va tron deu.',
      'Dung lanh neu thich.',
    ],
    nutrition: { calories: 260, protein: 6, carbs: 52, fat: 4 },
    tags: ['fruit', 'snack', 'breakfast'],
  },
];

const extraRecipes: SeedRecipe[] = [
  {
    name: 'Pho ga nhanh',
    description: 'To pho ga am bung voi banh pho, thit ga va hanh gung.',
    imageUrl: recipeImage('vietnamese chicken pho'),
    cookTimeMinutes: 40,
    difficulty: 'medium',
    servings: 3,
    ingredients: [
      { foodName: 'Thit ga', quantity: 500, unit: 'g' },
      { foodName: 'Pho kho', quantity: 300, unit: 'g' },
      { foodName: 'Gung', quantity: 20, unit: 'g' },
      { foodName: 'Hanh tay', quantity: 100, unit: 'g' },
    ],
    steps: ['Luoc ga voi gung va hanh tay.', 'Tran pho kho.', 'Chan nuoc dung nong va them thit ga.'],
    nutrition: { calories: 520, protein: 34, carbs: 62, fat: 12 },
    tags: ['pho', 'chicken', 'breakfast'],
  },
  {
    name: 'Bun thit nuong',
    description: 'Bun kho an cung thit heo ap chao, dua leo va dau phong.',
    imageUrl: recipeImage('bun thit nuong vietnamese'),
    cookTimeMinutes: 35,
    difficulty: 'medium',
    servings: 2,
    ingredients: [
      { foodName: 'Thit heo', quantity: 350, unit: 'g' },
      { foodName: 'Bun kho', quantity: 250, unit: 'g' },
      { foodName: 'Dua leo', quantity: 150, unit: 'g' },
      { foodName: 'Dau phong', quantity: 40, unit: 'g' },
      { foodName: 'Nuoc mam', quantity: 25, unit: 'ml' },
    ],
    steps: ['Uop thit heo voi nuoc mam.', 'Ap chao den khi vang.', 'Tran bun va an kem dua leo, dau phong.'],
    nutrition: { calories: 640, protein: 32, carbs: 70, fat: 24 },
    tags: ['noodle', 'pork', 'lunch'],
  },
  {
    name: 'Goi cuon tom thit',
    description: 'Goi cuon tuoi voi tom, thit heo va rau dua leo.',
    imageUrl: recipeImage('vietnamese spring rolls shrimp pork'),
    cookTimeMinutes: 30,
    difficulty: 'medium',
    servings: 3,
    ingredients: [
      { foodName: 'Tom', quantity: 250, unit: 'g' },
      { foodName: 'Thit heo', quantity: 250, unit: 'g' },
      { foodName: 'Bun kho', quantity: 150, unit: 'g' },
      { foodName: 'Dua leo', quantity: 150, unit: 'g' },
    ],
    steps: ['Luoc tom va thit.', 'Tran bun kho.', 'Cuon cung rau va cham nuoc mam pha.'],
    nutrition: { calories: 430, protein: 30, carbs: 48, fat: 10 },
    tags: ['fresh', 'shrimp', 'snack'],
  },
  {
    name: 'Com tam suon ap chao',
    description: 'Com tam demo tu gao va thit heo ap chao dam vi.',
    imageUrl: recipeImage('com tam vietnamese pork rice'),
    cookTimeMinutes: 45,
    difficulty: 'medium',
    servings: 2,
    ingredients: [
      { foodName: 'Thit heo', quantity: 400, unit: 'g' },
      { foodName: 'Gao', quantity: 250, unit: 'g' },
      { foodName: 'Dua leo', quantity: 120, unit: 'g' },
      { foodName: 'Nuoc mam', quantity: 20, unit: 'ml' },
    ],
    steps: ['Nau com.', 'Uop thit heo va ap chao.', 'An kem dua leo va nuoc mam.'],
    nutrition: { calories: 720, protein: 36, carbs: 76, fat: 28 },
    tags: ['rice', 'pork', 'dinner'],
  },
  {
    name: 'Tom rang toi',
    description: 'Tom rang nhanh voi toi va nuoc mam.',
    imageUrl: recipeImage('garlic shrimp vietnamese'),
    cookTimeMinutes: 18,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Tom', quantity: 350, unit: 'g' },
      { foodName: 'Toi', quantity: 20, unit: 'g' },
      { foodName: 'Nuoc mam', quantity: 15, unit: 'ml' },
      { foodName: 'Dau an', quantity: 15, unit: 'ml' },
    ],
    steps: ['Bam toi.', 'Rang tom voi dau an.', 'Nem nuoc mam va dao den khi sanh.'],
    nutrition: { calories: 330, protein: 32, carbs: 8, fat: 18 },
    tags: ['shrimp', 'quick', 'dinner'],
  },
  {
    name: 'Muc xao sa ot',
    description: 'Muc xao thom cay voi sa, ot va hanh tay.',
    imageUrl: recipeImage('spicy squid lemongrass'),
    cookTimeMinutes: 25,
    difficulty: 'medium',
    servings: 2,
    ingredients: [
      { foodName: 'Muc', quantity: 350, unit: 'g' },
      { foodName: 'Sa', quantity: 25, unit: 'g' },
      { foodName: 'Ot', quantity: 10, unit: 'g' },
      { foodName: 'Hanh tay', quantity: 100, unit: 'g' },
    ],
    steps: ['So che muc.', 'Phi sa ot.', 'Xao nhanh muc va hanh tay tren lua lon.'],
    nutrition: { calories: 360, protein: 34, carbs: 12, fat: 18 },
    tags: ['squid', 'spicy', 'seafood'],
  },
  {
    name: 'Ca thu kho ca chua',
    description: 'Ca thu kho mem voi ca chua va nuoc mam.',
    imageUrl: recipeImage('vietnamese braised fish tomato'),
    cookTimeMinutes: 40,
    difficulty: 'medium',
    servings: 3,
    ingredients: [
      { foodName: 'Ca thu', quantity: 500, unit: 'g' },
      { foodName: 'Ca chua', quantity: 250, unit: 'g' },
      { foodName: 'Nuoc mam', quantity: 30, unit: 'ml' },
      { foodName: 'Ot', quantity: 5, unit: 'g', optional: true },
    ],
    steps: ['Ap so ca thu.', 'Nau ca chua lam sot.', 'Kho ca voi sot den khi tham vi.'],
    nutrition: { calories: 540, protein: 42, carbs: 14, fat: 32 },
    tags: ['fish', 'braised', 'vietnamese'],
  },
  {
    name: 'Dau hu sot ca chua',
    description: 'Dau hu mem sot ca chua, phu hop bua chay nhe.',
    imageUrl: recipeImage('tofu tomato sauce'),
    cookTimeMinutes: 22,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Dau hu', quantity: 2, unit: 'hop' },
      { foodName: 'Ca chua', quantity: 250, unit: 'g' },
      { foodName: 'Hanh tay', quantity: 80, unit: 'g' },
      { foodName: 'Dau an', quantity: 15, unit: 'ml' },
    ],
    steps: ['Ap dau hu vang nhe.', 'Nau sot ca chua hanh tay.', 'Cho dau vao rim nho lua.'],
    nutrition: { calories: 310, protein: 18, carbs: 18, fat: 18 },
    tags: ['tofu', 'vegetarian', 'quick'],
  },
  {
    name: 'Rau muong xao toi',
    description: 'Rau muong xao toi don gian, xanh gion.',
    imageUrl: recipeImage('stir fried water spinach garlic'),
    cookTimeMinutes: 12,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Rau muong', quantity: 1, unit: 'bo' },
      { foodName: 'Toi', quantity: 20, unit: 'g' },
      { foodName: 'Dau an', quantity: 15, unit: 'ml' },
      { foodName: 'Nuoc mam', quantity: 10, unit: 'ml' },
    ],
    steps: ['Nhat rau va rua sach.', 'Phi toi.', 'Xao rau nhanh tren lua lon.'],
    nutrition: { calories: 180, protein: 5, carbs: 10, fat: 12 },
    tags: ['vegetable', 'quick', 'side'],
  },
  {
    name: 'Canh bap cai thit heo',
    description: 'Canh bap cai nau thit heo thanh ngot.',
    imageUrl: recipeImage('cabbage pork soup'),
    cookTimeMinutes: 25,
    difficulty: 'easy',
    servings: 3,
    ingredients: [
      { foodName: 'Bap cai', quantity: 350, unit: 'g' },
      { foodName: 'Thit heo', quantity: 200, unit: 'g' },
      { foodName: 'Nuoc mam', quantity: 15, unit: 'ml' },
    ],
    steps: ['Thai bap cai.', 'Nau thit heo voi nuoc.', 'Them bap cai va nem vua an.'],
    nutrition: { calories: 260, protein: 18, carbs: 12, fat: 14 },
    tags: ['soup', 'pork', 'family'],
  },
  {
    name: 'Khoai tay nghien trung',
    description: 'Khoai tay nghien mem tron trung ga cho bua sang.',
    imageUrl: recipeImage('mashed potato egg breakfast'),
    cookTimeMinutes: 25,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Khoai tay', quantity: 400, unit: 'g' },
      { foodName: 'Trung ga', quantity: 2, unit: 'qua' },
      { foodName: 'Sua tuoi', quantity: 80, unit: 'ml' },
    ],
    steps: ['Luoc khoai tay den mem.', 'Nghien khoai voi sua.', 'An cung trung op la hoac trung luoc.'],
    nutrition: { calories: 420, protein: 18, carbs: 54, fat: 14 },
    tags: ['breakfast', 'egg', 'potato'],
  },
  {
    name: 'Khoai lang nuong sua chua',
    description: 'Khoai lang nuong an kem sua chua mat nhe.',
    imageUrl: recipeImage('roasted sweet potato yogurt'),
    cookTimeMinutes: 35,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Khoai lang', quantity: 500, unit: 'g' },
      { foodName: 'Sua chua', quantity: 2, unit: 'hop' },
    ],
    steps: ['Nuong khoai den mem.', 'Cat doi va them sua chua.', 'Dung am hoac lanh.'],
    nutrition: { calories: 360, protein: 10, carbs: 68, fat: 5 },
    tags: ['snack', 'healthy', 'sweet-potato'],
  },
  {
    name: 'Mi y sot bo ca chua',
    description: 'Mi y voi thit bo va ca chua cho bua toi nhanh.',
    imageUrl: recipeImage('spaghetti beef tomato sauce'),
    cookTimeMinutes: 30,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Mi y', quantity: 250, unit: 'g' },
      { foodName: 'Thit bo', quantity: 250, unit: 'g' },
      { foodName: 'Ca chua', quantity: 300, unit: 'g' },
      { foodName: 'Toi', quantity: 15, unit: 'g' },
    ],
    steps: ['Luoc mi y.', 'Xao bo voi toi.', 'Nau sot ca chua va tron mi.'],
    nutrition: { calories: 690, protein: 36, carbs: 86, fat: 20 },
    tags: ['pasta', 'beef', 'dinner'],
  },
  {
    name: 'Banh mi trung op la',
    description: 'Banh mi trung op la don gian cho bua sang.',
    imageUrl: recipeImage('banh mi egg breakfast'),
    cookTimeMinutes: 10,
    difficulty: 'easy',
    servings: 1,
    ingredients: [
      { foodName: 'Banh mi', quantity: 1, unit: 'cai' },
      { foodName: 'Trung ga', quantity: 2, unit: 'qua' },
      { foodName: 'Dua leo', quantity: 80, unit: 'g' },
    ],
    steps: ['Op la trung.', 'Nuong nong banh mi.', 'An kem dua leo.'],
    nutrition: { calories: 430, protein: 20, carbs: 48, fat: 16 },
    tags: ['breakfast', 'egg', 'quick'],
  },
  {
    name: 'Salad ga sua chua',
    description: 'Salad ga, dua leo va sua chua thanh mat.',
    imageUrl: recipeImage('chicken yogurt salad'),
    cookTimeMinutes: 25,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Thit ga', quantity: 300, unit: 'g' },
      { foodName: 'Dua leo', quantity: 200, unit: 'g' },
      { foodName: 'Sua chua', quantity: 1, unit: 'hop' },
      { foodName: 'Cam', quantity: 1, unit: 'qua', optional: true },
    ],
    steps: ['Luoc va xe ga.', 'Cat dua leo.', 'Tron voi sua chua va cam.'],
    nutrition: { calories: 350, protein: 34, carbs: 20, fat: 12 },
    tags: ['salad', 'chicken', 'healthy'],
  },
  {
    name: 'Canh chua tom',
    description: 'Canh chua tom voi ca chua, dua leo va vi nuoc mam.',
    imageUrl: recipeImage('vietnamese sour soup shrimp'),
    cookTimeMinutes: 28,
    difficulty: 'medium',
    servings: 3,
    ingredients: [
      { foodName: 'Tom', quantity: 300, unit: 'g' },
      { foodName: 'Ca chua', quantity: 250, unit: 'g' },
      { foodName: 'Dua leo', quantity: 150, unit: 'g' },
      { foodName: 'Nuoc mam', quantity: 20, unit: 'ml' },
    ],
    steps: ['Nau nuoc canh voi ca chua.', 'Them tom.', 'Nem nuoc mam va rau qua.'],
    nutrition: { calories: 280, protein: 28, carbs: 18, fat: 8 },
    tags: ['soup', 'shrimp', 'vietnamese'],
  },
  {
    name: 'Com chien rau cu',
    description: 'Com chien tu gao, trung va rau cu ton kho.',
    imageUrl: recipeImage('fried rice vegetables egg'),
    cookTimeMinutes: 25,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Gao', quantity: 250, unit: 'g' },
      { foodName: 'Trung ga', quantity: 2, unit: 'qua' },
      { foodName: 'Ca rot', quantity: 100, unit: 'g' },
      { foodName: 'Bap my', quantity: 1, unit: 'qua' },
      { foodName: 'Dau que', quantity: 80, unit: 'g' },
    ],
    steps: ['Nau com de nguoi.', 'Xao rau cu.', 'Them com va trung dao deu.'],
    nutrition: { calories: 560, protein: 18, carbs: 88, fat: 14 },
    tags: ['rice', 'egg', 'quick'],
  },
  {
    name: 'Bap my xao dau que',
    description: 'Mon rau xao gion ngot tu bap my va dau que.',
    imageUrl: recipeImage('corn green beans stir fry'),
    cookTimeMinutes: 18,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Bap my', quantity: 1, unit: 'qua' },
      { foodName: 'Dau que', quantity: 200, unit: 'g' },
      { foodName: 'Dau an', quantity: 10, unit: 'ml' },
      { foodName: 'Toi', quantity: 10, unit: 'g' },
    ],
    steps: ['Tach hat bap.', 'Cat dau que.', 'Xao voi toi den khi chin toi.'],
    nutrition: { calories: 240, protein: 7, carbs: 36, fat: 8 },
    tags: ['vegetable', 'side', 'quick'],
  },
  {
    name: 'Nam xao thit bo',
    description: 'Nam huong xao thit bo thom mem.',
    imageUrl: recipeImage('beef mushroom stir fry'),
    cookTimeMinutes: 22,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Nam huong', quantity: 200, unit: 'g' },
      { foodName: 'Thit bo', quantity: 250, unit: 'g' },
      { foodName: 'Toi', quantity: 15, unit: 'g' },
      { foodName: 'Dau an', quantity: 15, unit: 'ml' },
    ],
    steps: ['Cat nam.', 'Xao bo nhanh voi toi.', 'Them nam va dao den khi chin.'],
    nutrition: { calories: 390, protein: 32, carbs: 12, fat: 22 },
    tags: ['beef', 'mushroom', 'dinner'],
  },
  {
    name: 'Tao cam sua chua',
    description: 'Bua phu trai cay voi tao, cam va sua chua.',
    imageUrl: recipeImage('apple orange yogurt bowl'),
    cookTimeMinutes: 8,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Tao', quantity: 2, unit: 'qua' },
      { foodName: 'Cam', quantity: 2, unit: 'qua' },
      { foodName: 'Sua chua', quantity: 2, unit: 'hop' },
    ],
    steps: ['Cat tao va cam.', 'Cho vao bat.', 'Them sua chua va tron deu.'],
    nutrition: { calories: 310, protein: 8, carbs: 62, fat: 4 },
    tags: ['fruit', 'snack', 'breakfast'],
  },
  {
    name: 'Dua hau sua tuoi',
    description: 'Sinh to dua hau sua tuoi mat lanh.',
    imageUrl: recipeImage('watermelon milk smoothie'),
    cookTimeMinutes: 7,
    difficulty: 'easy',
    servings: 2,
    ingredients: [
      { foodName: 'Dua hau', quantity: 600, unit: 'g' },
      { foodName: 'Sua tuoi', quantity: 200, unit: 'ml' },
    ],
    steps: ['Cat dua hau bo hat.', 'Xay voi sua tuoi.', 'Dung lanh.'],
    nutrition: { calories: 220, protein: 7, carbs: 42, fat: 4 },
    tags: ['drink', 'fruit', 'quick'],
  },
  {
    name: 'Ga xao sa ot',
    description: 'Ga xao sa ot cay thom cho bua toi.',
    imageUrl: recipeImage('lemongrass chili chicken'),
    cookTimeMinutes: 28,
    difficulty: 'medium',
    servings: 3,
    ingredients: [
      { foodName: 'Thit ga', quantity: 600, unit: 'g' },
      { foodName: 'Sa', quantity: 30, unit: 'g' },
      { foodName: 'Ot', quantity: 10, unit: 'g' },
      { foodName: 'Nuoc mam', quantity: 25, unit: 'ml' },
    ],
    steps: ['Uop ga voi sa ot.', 'Xao ga tren lua vua.', 'Nem nuoc mam va rim can.'],
    nutrition: { calories: 520, protein: 48, carbs: 8, fat: 30 },
    tags: ['chicken', 'spicy', 'dinner'],
  },
  {
    name: 'Heo kho trung',
    description: 'Thit heo kho trung ga dam vi gia dinh.',
    imageUrl: recipeImage('vietnamese braised pork eggs'),
    cookTimeMinutes: 55,
    difficulty: 'hard',
    servings: 4,
    ingredients: [
      { foodName: 'Thit heo', quantity: 700, unit: 'g' },
      { foodName: 'Trung ga', quantity: 4, unit: 'qua' },
      { foodName: 'Nuoc mam', quantity: 40, unit: 'ml' },
      { foodName: 'Toi', quantity: 15, unit: 'g' },
    ],
    steps: ['Luoc trung.', 'Uop thit heo.', 'Kho thit voi trung den khi mem.'],
    nutrition: { calories: 760, protein: 52, carbs: 10, fat: 54 },
    tags: ['pork', 'egg', 'vietnamese'],
  },
  {
    name: 'Bun ca thu',
    description: 'Bun kho an cung ca thu va ca chua.',
    imageUrl: recipeImage('vietnamese fish noodle soup'),
    cookTimeMinutes: 40,
    difficulty: 'medium',
    servings: 3,
    ingredients: [
      { foodName: 'Ca thu', quantity: 450, unit: 'g' },
      { foodName: 'Bun kho', quantity: 300, unit: 'g' },
      { foodName: 'Ca chua', quantity: 250, unit: 'g' },
      { foodName: 'Nuoc mam', quantity: 20, unit: 'ml' },
    ],
    steps: ['Nau nuoc dung ca chua.', 'Ap ca thu.', 'Tran bun va chan nuoc dung.'],
    nutrition: { calories: 590, protein: 38, carbs: 64, fat: 20 },
    tags: ['fish', 'noodle', 'lunch'],
  },
  {
    name: 'Mi goi trung rau',
    description: 'Mi goi nang cap voi trung va rau muong.',
    imageUrl: recipeImage('instant noodles egg vegetables'),
    cookTimeMinutes: 10,
    difficulty: 'easy',
    servings: 1,
    ingredients: [
      { foodName: 'Mi goi', quantity: 1, unit: 'goi' },
      { foodName: 'Trung ga', quantity: 1, unit: 'qua' },
      { foodName: 'Rau muong', quantity: 0.5, unit: 'bo' },
    ],
    steps: ['Nau mi goi.', 'Them rau muong.', 'Tha trung vao sau cung.'],
    nutrition: { calories: 480, protein: 16, carbs: 62, fat: 18 },
    tags: ['noodle', 'quick', 'egg'],
  },
  {
    name: 'Bap cai cuon dau hu',
    description: 'Bap cai cuon dau hu va nam hap nhe.',
    imageUrl: recipeImage('cabbage rolls tofu mushroom'),
    cookTimeMinutes: 35,
    difficulty: 'medium',
    servings: 3,
    ingredients: [
      { foodName: 'Bap cai', quantity: 400, unit: 'g' },
      { foodName: 'Dau hu', quantity: 2, unit: 'hop' },
      { foodName: 'Nam huong', quantity: 150, unit: 'g' },
      { foodName: 'Ca rot', quantity: 100, unit: 'g' },
    ],
    steps: ['Chan la bap cai.', 'Nghien dau hu voi nam va ca rot.', 'Cuon va hap chin.'],
    nutrition: { calories: 330, protein: 20, carbs: 28, fat: 14 },
    tags: ['vegetarian', 'tofu', 'healthy'],
  },
  {
    name: 'Sup ga bap my',
    description: 'Sup ga bap my mem am, phu hop bua nhe.',
    imageUrl: recipeImage('chicken corn soup'),
    cookTimeMinutes: 30,
    difficulty: 'easy',
    servings: 3,
    ingredients: [
      { foodName: 'Thit ga', quantity: 300, unit: 'g' },
      { foodName: 'Bap my', quantity: 1, unit: 'qua' },
      { foodName: 'Trung ga', quantity: 1, unit: 'qua' },
      { foodName: 'Ca rot', quantity: 100, unit: 'g' },
    ],
    steps: ['Luoc va xe ga.', 'Nau bap my va ca rot.', 'Them trung danh tan tao van.'],
    nutrition: { calories: 360, protein: 28, carbs: 32, fat: 12 },
    tags: ['soup', 'chicken', 'corn'],
  },
];

const cookpadRecipes = loadCookpadRecipes();
recipes.splice(0, recipes.length, ...cookpadRecipes);

const demoUsers: SeedUser[] = [
  {
    email: 'me.navi@navimart.local',
    password: 'Demo@12345',
    firstName: 'Minh',
    lastName: 'Nguyen',
    displayName: 'Minh Nguyen',
    role: 'housewife',
    gender: 'female',
  },
  {
    email: 'an.navi@navimart.local',
    password: 'Demo@12345',
    firstName: 'An',
    lastName: 'Tran',
    displayName: 'An Tran',
    role: 'member',
    gender: 'male',
  },
  {
    email: 'linh.navi@navimart.local',
    password: 'Demo@12345',
    firstName: 'Linh',
    lastName: 'Pham',
    displayName: 'Linh Pham',
    role: 'member',
    gender: 'female',
  },
];

const pantryItems: SeedPantryItem[] = [
  {
    foodName: 'Thit bo',
    quantity: 500,
    unit: 'g',
    expiresInDays: 2,
    location: 'fridge',
    source: 'shopping',
    note: 'Dung cho mon xao toi nay.',
  },
  {
    foodName: 'Thit ga',
    quantity: 800,
    unit: 'g',
    expiresInDays: 5,
    location: 'freezer',
    source: 'shopping',
  },
  {
    foodName: 'Ca hoi',
    quantity: 300,
    unit: 'g',
    expiresInDays: 1,
    location: 'fridge',
    source: 'manual',
    note: 'Nen nau truoc ngay mai.',
  },
  {
    foodName: 'Trung ga',
    quantity: 12,
    unit: 'qua',
    expiresInDays: 12,
    location: 'fridge',
    source: 'shopping',
  },
  {
    foodName: 'Sua tuoi',
    quantity: 1,
    unit: 'l',
    expiresInDays: 3,
    location: 'fridge',
    source: 'shopping',
  },
  {
    foodName: 'Ca rot',
    quantity: 400,
    unit: 'g',
    expiresInDays: 7,
    location: 'fridge',
    source: 'manual',
  },
  {
    foodName: 'Bong cai xanh',
    quantity: 250,
    unit: 'g',
    expiresInDays: 4,
    location: 'fridge',
    source: 'manual',
  },
  {
    foodName: 'Gao',
    quantity: 5,
    unit: 'kg',
    expiresInDays: 120,
    location: 'pantry',
    source: 'import',
  },
  {
    foodName: 'Mi goi',
    quantity: 6,
    unit: 'goi',
    expiresInDays: 45,
    location: 'pantry',
    source: 'shopping',
  },
  {
    foodName: 'Chuoi',
    quantity: 6,
    unit: 'qua',
    expiresInDays: -1,
    location: 'pantry',
    source: 'manual',
    note: 'Mau du lieu qua han de kiem tra thong bao.',
  },
];

const extraPantryItems: SeedPantryItem[] = [
  { foodName: 'Thit heo', quantity: 900, unit: 'g', expiresInDays: 4, location: 'fridge', source: 'shopping' },
  { foodName: 'Tom', quantity: 600, unit: 'g', expiresInDays: 18, location: 'freezer', source: 'shopping' },
  { foodName: 'Muc', quantity: 500, unit: 'g', expiresInDays: 20, location: 'freezer', source: 'shopping' },
  { foodName: 'Ca thu', quantity: 700, unit: 'g', expiresInDays: 25, location: 'freezer', source: 'shopping' },
  { foodName: 'Dau hu', quantity: 4, unit: 'hop', expiresInDays: 3, location: 'fridge', source: 'manual' },
  { foodName: 'Sua chua', quantity: 6, unit: 'hop', expiresInDays: 9, location: 'fridge', source: 'shopping' },
  { foodName: 'Pho kho', quantity: 800, unit: 'g', expiresInDays: 120, location: 'pantry', source: 'import' },
  { foodName: 'Bun kho', quantity: 700, unit: 'g', expiresInDays: 100, location: 'pantry', source: 'import' },
  { foodName: 'Mi y', quantity: 500, unit: 'g', expiresInDays: 180, location: 'pantry', source: 'shopping' },
  { foodName: 'Banh mi', quantity: 3, unit: 'cai', expiresInDays: 1, location: 'pantry', source: 'manual' },
  { foodName: 'Khoai tay', quantity: 1200, unit: 'g', expiresInDays: 18, location: 'pantry', source: 'shopping' },
  { foodName: 'Khoai lang', quantity: 900, unit: 'g', expiresInDays: 12, location: 'pantry', source: 'shopping' },
  { foodName: 'Rau muong', quantity: 2, unit: 'bo', expiresInDays: 2, location: 'fridge', source: 'shopping' },
  { foodName: 'Bap cai', quantity: 700, unit: 'g', expiresInDays: 8, location: 'fridge', source: 'shopping' },
  { foodName: 'Dua leo', quantity: 600, unit: 'g', expiresInDays: 4, location: 'fridge', source: 'shopping' },
  { foodName: 'Nam huong', quantity: 300, unit: 'g', expiresInDays: 4, location: 'fridge', source: 'manual' },
  { foodName: 'Bap my', quantity: 4, unit: 'qua', expiresInDays: 5, location: 'fridge', source: 'shopping' },
  { foodName: 'Dau que', quantity: 400, unit: 'g', expiresInDays: 5, location: 'fridge', source: 'shopping' },
  { foodName: 'Toi', quantity: 250, unit: 'g', expiresInDays: 45, location: 'pantry', source: 'import' },
  { foodName: 'Sa', quantity: 180, unit: 'g', expiresInDays: 10, location: 'fridge', source: 'shopping' },
  { foodName: 'Ot', quantity: 120, unit: 'g', expiresInDays: 8, location: 'fridge', source: 'shopping' },
  { foodName: 'Cam', quantity: 8, unit: 'qua', expiresInDays: 10, location: 'fridge', source: 'shopping' },
  { foodName: 'Dua hau', quantity: 1200, unit: 'g', expiresInDays: 3, location: 'fridge', source: 'manual' },
  { foodName: 'Dau phong', quantity: 500, unit: 'g', expiresInDays: 90, location: 'pantry', source: 'import' },
];

pantryItems.push(...extraPantryItems);

const shoppingLists: SeedShoppingList[] = [
  {
    name: 'Di cho hom nay',
    type: 'daily',
    status: 'active',
    plannedInDays: 0,
    items: [
      { foodName: 'Ca chua', quantity: 500, unit: 'g' },
      { foodName: 'Hanh tay', quantity: 300, unit: 'g', checked: true },
      { foodName: 'Tao', quantity: 4, unit: 'qua' },
      { foodName: 'Nuoc mam', quantity: 1, unit: 'chai', note: 'Loai it man.' },
    ],
  },
  {
    name: 'Mua sam cuoi tuan',
    type: 'weekly',
    status: 'active',
    plannedInDays: 2,
    items: [
      { foodName: 'Thit ga', quantity: 1.2, unit: 'kg' },
      { foodName: 'Sua tuoi', quantity: 2, unit: 'l' },
      { foodName: 'Bong cai xanh', quantity: 500, unit: 'g' },
    ],
  },
  {
    name: 'Da mua tuan truoc',
    type: 'weekly',
    status: 'completed',
    plannedInDays: -5,
    completedOffsetDays: -4,
    items: [
      { foodName: 'Gao', quantity: 5, unit: 'kg', checked: true },
      { foodName: 'Trung ga', quantity: 12, unit: 'qua', checked: true },
      { foodName: 'Mi goi', quantity: 6, unit: 'goi', checked: true },
    ],
  },
];

const extraShoppingLists: SeedShoppingList[] = [
  {
    name: 'Bo sung hai san',
    type: 'custom',
    status: 'active',
    plannedInDays: 1,
    items: [
      { foodName: 'Tom', quantity: 500, unit: 'g' },
      { foodName: 'Muc', quantity: 400, unit: 'g' },
      { foodName: 'Ca thu', quantity: 600, unit: 'g' },
    ],
  },
  {
    name: 'Nguyen lieu pho ga',
    type: 'custom',
    status: 'active',
    plannedInDays: 1,
    items: [
      { foodName: 'Pho kho', quantity: 500, unit: 'g' },
      { foodName: 'Thit ga', quantity: 700, unit: 'g' },
      { foodName: 'Gung', quantity: 100, unit: 'g' },
      { foodName: 'Hanh tay', quantity: 300, unit: 'g' },
    ],
  },
  {
    name: 'Rau cu cho tuan moi',
    type: 'weekly',
    status: 'active',
    plannedInDays: 3,
    items: [
      { foodName: 'Rau muong', quantity: 2, unit: 'bo' },
      { foodName: 'Bap cai', quantity: 700, unit: 'g' },
      { foodName: 'Dua leo', quantity: 500, unit: 'g' },
      { foodName: 'Dau que', quantity: 300, unit: 'g' },
    ],
  },
  {
    name: 'Do kho du tru',
    type: 'custom',
    status: 'active',
    plannedInDays: 4,
    items: [
      { foodName: 'Gao', quantity: 5, unit: 'kg' },
      { foodName: 'Bun kho', quantity: 1, unit: 'kg' },
      { foodName: 'Mi y', quantity: 500, unit: 'g' },
      { foodName: 'Dau phong', quantity: 300, unit: 'g' },
    ],
  },
  {
    name: 'Bua sang nhanh',
    type: 'daily',
    status: 'active',
    plannedInDays: 0,
    items: [
      { foodName: 'Banh mi', quantity: 4, unit: 'cai' },
      { foodName: 'Trung ga', quantity: 10, unit: 'qua' },
      { foodName: 'Sua chua', quantity: 6, unit: 'hop' },
      { foodName: 'Cam', quantity: 6, unit: 'qua' },
    ],
  },
  {
    name: 'Gia vi can mua',
    type: 'custom',
    status: 'active',
    plannedInDays: 5,
    items: [
      { foodName: 'Toi', quantity: 200, unit: 'g' },
      { foodName: 'Sa', quantity: 200, unit: 'g' },
      { foodName: 'Ot', quantity: 100, unit: 'g' },
      { foodName: 'Nuoc mam', quantity: 1, unit: 'chai' },
    ],
  },
  {
    name: 'Trai cay cuoi tuan',
    type: 'weekly',
    status: 'active',
    plannedInDays: 6,
    items: [
      { foodName: 'Tao', quantity: 6, unit: 'qua' },
      { foodName: 'Chuoi', quantity: 8, unit: 'qua' },
      { foodName: 'Dua hau', quantity: 1500, unit: 'g' },
      { foodName: 'Cam', quantity: 8, unit: 'qua' },
    ],
  },
  {
    name: 'Da mua hai san tuan truoc',
    type: 'weekly',
    status: 'completed',
    plannedInDays: -9,
    completedOffsetDays: -8,
    items: [
      { foodName: 'Tom', quantity: 600, unit: 'g', checked: true },
      { foodName: 'Muc', quantity: 500, unit: 'g', checked: true },
      { foodName: 'Ca thu', quantity: 700, unit: 'g', checked: true },
    ],
  },
  {
    name: 'Da mua rau cu',
    type: 'weekly',
    status: 'completed',
    plannedInDays: -7,
    completedOffsetDays: -6,
    items: [
      { foodName: 'Ca rot', quantity: 500, unit: 'g', checked: true },
      { foodName: 'Khoai tay', quantity: 1, unit: 'kg', checked: true },
      { foodName: 'Bap cai', quantity: 800, unit: 'g', checked: true },
    ],
  },
  {
    name: 'Da mua bua sang',
    type: 'daily',
    status: 'completed',
    plannedInDays: -3,
    completedOffsetDays: -3,
    items: [
      { foodName: 'Banh mi', quantity: 4, unit: 'cai', checked: true },
      { foodName: 'Sua tuoi', quantity: 2, unit: 'l', checked: true },
      { foodName: 'Trung ga', quantity: 10, unit: 'qua', checked: true },
    ],
  },
];

shoppingLists.push(...extraShoppingLists);

const mealPlans: SeedMealPlan[] = [
  {
    recipeName: recipes[0]?.name,
    offsetDays: 0,
    session: 'breakfast',
    servings: 2,
    isCompleted: true,
  },
  {
    recipeName: recipes[1]?.name,
    offsetDays: 0,
    session: 'dinner',
    servings: 3,
    note: 'Uu tien mon Cookpad moi seed.',
  },
  {
    recipeName: recipes[2]?.name,
    offsetDays: 1,
    session: 'lunch',
    servings: 3,
  },
  {
    recipeName: recipes[3]?.name,
    offsetDays: 2,
    session: 'dinner',
    servings: 4,
  },
  {
    customName: 'Bua phu voi trai cay',
    offsetDays: 1,
    session: 'snack',
    servings: 2,
  },
];

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

function foodOrThrow(foodByName: Map<string, Food>, foodName: string) {
  const food = foodByName.get(foodName);
  if (!food) {
    throw new Error(`Missing food: ${foodName}`);
  }
  return food;
}

function recipeOrThrow(recipeByName: Map<string, Recipe>, recipeName: string) {
  const recipe = recipeByName.get(recipeName);
  if (!recipe) {
    throw new Error(`Missing recipe: ${recipeName}`);
  }
  return recipe;
}

async function upsertCategories(categoryModel: Model<Category>) {
  const result = new Map<string, Category>();

  for (const category of categories) {
    const document = await categoryModel
      .findOneAndUpdate(
        { slug: category.slug },
        { $set: { ...category, status: 'active' } },
        { returnDocument: 'after', upsert: true },
      )
      .exec();

    result.set(category.slug, document);
  }

  return result;
}

async function upsertUnits(unitModel: Model<Unit>) {
  for (const unit of units) {
    await unitModel
      .findOneAndUpdate(
        { code: unit.code },
        { $set: { ...unit, status: 'active' } },
        { returnDocument: 'after', upsert: true },
      )
      .exec();
  }
}

async function upsertFoods(
  foodModel: Model<Food>,
  categoryBySlug: Map<string, Category>,
) {
  const result = new Map<string, Food>();

  for (const food of foods) {
    const category = categoryBySlug.get(food.categorySlug);
    if (!category) {
      throw new Error(`Missing category for food: ${food.name}`);
    }

    const document = await foodModel
      .findOneAndUpdate(
        { normalizedName: normalizeName(food.name) },
        {
          $set: {
            name: food.name,
            normalizedName: normalizeName(food.name),
            categoryId: category._id,
            defaultUnit: food.defaultUnit,
            aliases: food.aliases ?? [],
            defaultStorageLocation: food.defaultStorageLocation,
            defaultShelfLifeDays: food.defaultShelfLifeDays,
            storageTips: food.storageTips,
            imageUrl: food.imageUrl,
            ...(food.barcode ? { barcode: food.barcode } : {}),
            isSystem: true,
            status: 'active',
          },
        },
        { returnDocument: 'after', upsert: true },
      )
      .exec();

    result.set(food.name, document);
  }

  return result;
}

async function upsertRecipes(
  recipeModel: Model<Recipe>,
  foodByName: Map<string, Food>,
) {
  const result = new Map<string, Recipe>();

  for (const recipe of recipes) {
    const ingredients = recipe.ingredients.map((ingredient) => {
      const food = foodByName.get(ingredient.foodName);
      if (!food) {
        throw new Error(`Missing food for recipe ingredient: ${ingredient.foodName}`);
      }

      return {
        foodId: food._id,
        name: food.name,
        categoryId: food.categoryId,
        quantity: ingredient.quantity,
        unit: ingredient.unit ?? food.defaultUnit,
        optional: ingredient.optional ?? false,
      };
    });

    const document = await recipeModel
      .findOneAndUpdate(
        { normalizedName: normalizeName(recipe.name) },
        {
          $set: {
            name: recipe.name,
            normalizedName: normalizeName(recipe.name),
            description: recipe.description,
            imageUrl: recipe.imageUrl,
            cookTimeMinutes: recipe.cookTimeMinutes,
            difficulty: recipe.difficulty,
            servings: recipe.servings,
            ingredients,
            steps: recipe.steps,
            nutrition: recipe.nutrition,
            tags: recipe.tags,
            status: 'approved',
          },
        },
        { returnDocument: 'after', upsert: true },
      )
      .exec();

    result.set(recipe.name, document);
  }

  return result;
}

async function resetRecipes(
  recipeModel: Model<Recipe>,
  recipeFavoriteModel: Model<RecipeFavorite>,
) {
  await recipeFavoriteModel.deleteMany({}).exec();
  await recipeModel.deleteMany({}).exec();
}

async function upsertAdminUser(userModel: Model<User>) {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@navimart.local';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
  const passwordHash = await hash(password, 12);

  await userModel
    .findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          firstName: 'NaviMart',
          lastName: 'Admin',
          displayName: 'NaviMart Admin',
          role: 'admin',
          status: 'active',
        },
        $setOnInsert: {
          passwordHash,
        },
      },
      { returnDocument: 'after', upsert: true },
    )
    .exec();

  return email;
}

async function upsertDemoUsers(userModel: Model<User>) {
  const result = new Map<string, User>();

  for (const user of demoUsers) {
    const passwordHash = await hash(user.password, 12);
    const document = await userModel
      .findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            role: user.role,
            gender: user.gender,
            status: 'active',
            notificationSettings: {
              expiryReminder: true,
              expiryReminderDays: 3,
              shoppingReminder: true,
            },
            emailVerifiedAt: new Date(),
          },
          $setOnInsert: {
            passwordHash,
          },
        },
          { returnDocument: 'after', upsert: true },
      )
      .exec();

    result.set(user.email, document);
  }

  return result;
}

async function upsertDemoFamily(
  familyModel: Model<Family>,
  userModel: Model<User>,
  usersByEmail: Map<string, User>,
) {
  const owner = usersByEmail.get('me.navi@navimart.local');
  const admin = usersByEmail.get('an.navi@navimart.local');
  const member = usersByEmail.get('linh.navi@navimart.local');

  if (!owner || !admin || !member) {
    throw new Error('Missing demo users for demo family.');
  }

  const family = await familyModel
    .findOneAndUpdate(
      { name: 'Gia dinh NaviMart Demo' },
      {
        $set: {
          name: 'Gia dinh NaviMart Demo',
          ownerId: owner._id,
          members: [
            {
              userId: owner._id,
              role: 'owner',
              permissions: [
                'manage_family',
                'edit_pantry',
                'edit_lists',
                'edit_meals',
                'view_reports',
              ],
              status: 'active',
              joinedAt: daysFromNow(-30),
            },
            {
              userId: admin._id,
              role: 'admin',
              permissions: ['edit_pantry', 'edit_lists', 'edit_meals', 'view_reports'],
              status: 'active',
              joinedAt: daysFromNow(-20),
            },
            {
              userId: member._id,
              role: 'member',
              permissions: ['edit_lists'],
              status: 'active',
              joinedAt: daysFromNow(-10),
            },
          ],
        },
      },
      { returnDocument: 'after', upsert: true },
    )
    .exec();

  await userModel
    .updateMany(
      { email: { $in: demoUsers.map((user) => user.email) } },
      { $set: { activeFamilyId: family._id } },
    )
    .exec();

  return family;
}

async function upsertPantryItems(
  pantryModel: Model<PantryItem>,
  family: Family,
  createdBy: User,
  foodByName: Map<string, Food>,
) {
  const result = new Map<string, PantryItem>();

  for (const item of pantryItems) {
    const food = foodOrThrow(foodByName, item.foodName);
    const document = await pantryModel
      .findOneAndUpdate(
        { familyId: family._id, name: item.foodName },
        {
          $set: {
            familyId: family._id,
            foodId: food._id,
            name: food.name,
            categoryId: food.categoryId,
            quantity: item.quantity,
            unit: item.unit ?? food.defaultUnit,
            expiryDate: daysFromNow(item.expiresInDays),
            location: item.location,
            status: item.expiresInDays < 0 ? 'expired' : 'active',
            source: item.source,
            createdBy: createdBy._id,
            note: item.note,
          },
        },
        { returnDocument: 'after', upsert: true },
      )
      .exec();

    result.set(item.foodName, document);
  }

  return result;
}

async function upsertShoppingLists(
  shoppingListModel: Model<ShoppingList>,
  family: Family,
  createdBy: User,
  foodByName: Map<string, Food>,
) {
  for (const list of shoppingLists) {
    const items = list.items.map((item) => {
      const food = foodOrThrow(foodByName, item.foodName);
      const checked = item.checked ?? list.status === 'completed';

      return {
        foodId: food._id,
        name: food.name,
        categoryId: food.categoryId,
        quantity: item.quantity,
        unit: item.unit ?? food.defaultUnit,
        checked,
        status: checked ? 'bought' : 'pending',
        note: item.note,
        boughtAt: checked ? daysFromNow(list.completedOffsetDays ?? -1) : undefined,
      };
    });

    await shoppingListModel
      .findOneAndUpdate(
        { familyId: family._id, name: list.name },
        {
          $set: {
            familyId: family._id,
            name: list.name,
            type: list.type,
            status: list.status,
            createdBy: createdBy._id,
            plannedFor: daysFromNow(list.plannedInDays),
            completedAt:
              list.status === 'completed'
                ? daysFromNow(list.completedOffsetDays ?? -1)
                : undefined,
            items,
          },
        },
        { returnDocument: 'after', upsert: true },
      )
      .exec();
  }
}

async function upsertMealPlans(
  mealPlanModel: Model<MealPlan>,
  family: Family,
  createdBy: User,
  recipeByName: Map<string, Recipe>,
) {
  for (const plan of mealPlans) {
    const recipe = plan.recipeName
      ? recipeOrThrow(recipeByName, plan.recipeName)
      : undefined;
    const name = plan.recipeName ?? plan.customName ?? plan.session;

    await mealPlanModel
      .findOneAndUpdate(
        {
          familyId: family._id,
          date: daysFromNow(plan.offsetDays),
          session: plan.session,
        },
        {
          $set: {
            familyId: family._id,
            date: daysFromNow(plan.offsetDays),
            session: plan.session,
            recipeId: recipe?._id,
            customName: plan.customName,
            servings: plan.servings,
            isCompleted: plan.isCompleted ?? false,
            note: plan.note ?? `Seed: ${name}`,
            createdBy: createdBy._id,
          },
        },
        { returnDocument: 'after', upsert: true },
      )
      .exec();
  }
}

async function upsertNotifications(
  notificationModel: Model<Notification>,
  family: Family,
  usersByEmail: Map<string, User>,
  pantryByName: Map<string, PantryItem>,
) {
  const recipients = [...usersByEmail.values()];
  const expiring = pantryByName.get('Ca hoi');
  const expired = pantryByName.get('Chuoi');

  for (const user of recipients) {
    const notifications = [
      {
        type: 'pantry_expiring',
        title: 'Thuc pham sap het han',
        body: 'Ca hoi se het han trong 1 ngay. Hay len mon an phu hop.',
        data: { pantryItemId: expiring?._id?.toString(), path: '/pantry' },
        dedupeKey: `seed:${user._id}:pantry_expiring:ca-hoi`,
      },
      {
        type: 'pantry_expired',
        title: 'Thuc pham da qua han',
        body: 'Chuoi da qua han. Kiem tra kho de xu ly.',
        data: { pantryItemId: expired?._id?.toString(), path: '/pantry' },
        dedupeKey: `seed:${user._id}:pantry_expired:chuoi`,
      },
      {
        type: 'shopping_reminder',
        title: 'Nhac mua sam',
        body: 'Danh sach Di cho hom nay van con mon chua mua.',
        data: { path: '/lists' },
        dedupeKey: `seed:${user._id}:shopping_reminder:today`,
      },
    ] as const;

    for (const notification of notifications) {
      await notificationModel
        .findOneAndUpdate(
          { dedupeKey: notification.dedupeKey },
          {
            $set: {
              userId: user._id,
              familyId: family._id,
              ...notification,
            },
          },
          { returnDocument: 'after', upsert: true },
        )
        .exec();
    }
  }
}

async function upsertInventoryEvents(
  inventoryEventModel: Model<InventoryEvent>,
  family: Family,
  createdBy: User,
  pantryByName: Map<string, PantryItem>,
  foodByName: Map<string, Food>,
) {
  const addedEvents = pantryItems.map((item) => ({
    foodName: item.foodName,
    type: 'added' as const,
    quantityDelta: item.quantity,
    quantityAfter: item.quantity,
    note: 'Seed demo inventory event',
  }));
  const usageEvents = [
    { foodName: 'Thit bo', type: 'consumed' as const, quantityDelta: -200, quantityAfter: 300 },
    { foodName: 'Thit ga', type: 'consumed' as const, quantityDelta: -300, quantityAfter: 500 },
    { foodName: 'Sua tuoi', type: 'consumed' as const, quantityDelta: -0.5, quantityAfter: 1 },
    { foodName: 'Trung ga', type: 'consumed' as const, quantityDelta: -4, quantityAfter: 8 },
    { foodName: 'Rau muong', type: 'consumed' as const, quantityDelta: -1, quantityAfter: 1 },
    { foodName: 'Dua leo', type: 'consumed' as const, quantityDelta: -200, quantityAfter: 400 },
    { foodName: 'Tom', type: 'consumed' as const, quantityDelta: -200, quantityAfter: 400 },
    { foodName: 'Gao', type: 'adjusted' as const, quantityDelta: 1000, quantityAfter: 5000 },
    { foodName: 'Banh mi', type: 'wasted' as const, quantityDelta: -1, quantityAfter: 2 },
    { foodName: 'Chuoi', type: 'expired' as const, quantityDelta: 0, quantityAfter: 6 },
  ].map((event) => ({ ...event, note: 'Seed demo inventory event' }));
  const events = [...addedEvents, ...usageEvents];

  for (const event of events) {
    const food = foodOrThrow(foodByName, event.foodName);
    const pantryItem = pantryByName.get(event.foodName);

    await inventoryEventModel
      .findOneAndUpdate(
        {
          familyId: family._id,
          name: event.foodName,
          type: event.type,
          note: event.note,
        },
        {
          $set: {
            familyId: family._id,
            pantryItemId: pantryItem?._id,
            foodId: food._id,
            categoryId: food.categoryId,
            name: food.name,
            quantityDelta: event.quantityDelta,
            quantityAfter: event.quantityAfter,
            unit: pantryItem?.unit ?? food.defaultUnit,
            type: event.type,
            source: 'system',
            createdBy: createdBy._id,
            note: event.note,
          },
        },
        { returnDocument: 'after', upsert: true },
      )
      .exec();
  }
}

async function bootstrap() {
  const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/navimart';
  const dbName = process.env.MONGODB_DB_NAME;

  await mongoose.connect(mongoUri, dbName ? { dbName } : undefined);

  const categoryModel = mongoose.model(Category.name, CategorySchema);
  const unitModel = mongoose.model(Unit.name, UnitSchema);
  const foodModel = mongoose.model(Food.name, FoodSchema);
  const recipeModel = mongoose.model(Recipe.name, RecipeSchema);
  const recipeFavoriteModel = mongoose.model(
    RecipeFavorite.name,
    RecipeFavoriteSchema,
  );
  const userModel = mongoose.model(User.name, UserSchema);
  const familyModel = mongoose.model(Family.name, FamilySchema);
  const pantryModel = mongoose.model(PantryItem.name, PantryItemSchema);
  const shoppingListModel = mongoose.model(ShoppingList.name, ShoppingListSchema);
  const mealPlanModel = mongoose.model(MealPlan.name, MealPlanSchema);
  const notificationModel = mongoose.model(Notification.name, NotificationSchema);
  const inventoryEventModel = mongoose.model(
    InventoryEvent.name,
    InventoryEventSchema,
  );

  const categoryBySlug = await upsertCategories(categoryModel);
  await upsertUnits(unitModel);
  const foodByName = await upsertFoods(foodModel, categoryBySlug);
  await resetRecipes(recipeModel, recipeFavoriteModel);
  const recipeByName = await upsertRecipes(recipeModel, foodByName);
  const adminEmail = await upsertAdminUser(userModel);
  const usersByEmail = await upsertDemoUsers(userModel);
  const family = await upsertDemoFamily(familyModel, userModel, usersByEmail);
  const owner = usersByEmail.get('me.navi@navimart.local');

  if (!owner) {
    throw new Error('Missing demo owner.');
  }

  const pantryByName = await upsertPantryItems(
    pantryModel,
    family,
    owner,
    foodByName,
  );
  await upsertShoppingLists(shoppingListModel, family, owner, foodByName);
  await upsertMealPlans(mealPlanModel, family, owner, recipeByName);
  await upsertNotifications(notificationModel, family, usersByEmail, pantryByName);
  await upsertInventoryEvents(
    inventoryEventModel,
    family,
    owner,
    pantryByName,
    foodByName,
  );

  console.log(
    `Seed completed: ${categories.length} categories, ${units.length} units, ${foods.length} foods, ${recipes.length} recipes, ${demoUsers.length} demo users, ${pantryItems.length} pantry items, ${shoppingLists.length} shopping lists, ${mealPlans.length} meal plans, notifications and inventory events. Admin account ${adminEmail} (password: ${process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345'}). Demo user me.navi@navimart.local (password: Demo@12345).`,
  );

  await mongoose.disconnect();
}

bootstrap().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
