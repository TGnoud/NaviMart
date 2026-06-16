import * as mongoose from 'mongoose';
import { readFileSync, existsSync } from 'fs';

// Manual .env parser to avoid dependency issues
if (existsSync('.env')) {
  const envConfig = readFileSync('.env', 'utf-8');
  for (const line of envConfig.split('\n')) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// Schema definitions with explicit collection names
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  status: { type: String, default: 'active' },
}, { collection: 'categories' });

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  defaultUnit: { type: String, required: true },
  aliases: { type: [String], default: [] },
  defaultStorageLocation: { type: String, default: 'fridge' },
  defaultShelfLifeDays: { type: Number },
  status: { type: String, default: 'active' },
}, { collection: 'foods' });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  activeFamilyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },
  status: { type: String, default: 'active' },
}, { collection: 'users' });

const FamilySchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { collection: 'families' });

const PantryItemSchema = new mongoose.Schema({
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  location: { type: String, default: 'fridge' },
  status: { type: String, default: 'active' },
  source: { type: String, default: 'manual' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String },
}, { collection: 'pantryItems' });

function cleanCookpadText(value?: string) {
  return (value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/#\S+/g, '')
    .replace(/\s*Xem thêm\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseIngredient(str: string): { name: string; quantity: number; unit: string } {
  let s = str.trim();
  
  // Try matching a number at the start: e.g. "10", "2.5", "1/2", "0,5"
  const numRegex = /^([\d\.\,\/]+)\s*(.*)$/;
  const numMatch = s.match(numRegex);
  
  let quantity = 1;
  let unit = 'cái';
  let name = s;
  
  if (numMatch) {
    let rawQty = numMatch[1].replace(',', '.');
    if (rawQty.includes('/')) {
      const parts = rawQty.split('/');
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (den > 0) {
        quantity = num / den;
      }
    } else {
      const parsed = parseFloat(rawQty);
      if (!isNaN(parsed)) {
        quantity = parsed;
      }
    }
    s = numMatch[2].trim();
  } else {
    // If it starts with "một ít", "ít", "vài", "nửa", etc.
    const textQtyRegex = /^(một\s+ít|một\s+vài|ít|vài|nửa|nửa\s+thìa|nửa\s+muỗng|nửa\s+chén|nửa\s+bát|một\s+nửa)\s+(.*)$/i;
    const textQtyMatch = s.match(textQtyRegex);
    if (textQtyMatch) {
      quantity = 0.5;
      s = textQtyMatch[2].trim();
    }
  }
  
  // Try matching common units
  const commonUnits = [
    'g', 'kg', 'ml', 'l', 'lít', 'lit', 'tsp', 'tbsp', 'muỗng', 'thìa', 'cái',
    'quả', 'trái', 'củ', 'lát', 'nhánh', 'cây', 'lon', 'gói', 'hộp', 'tép',
    'bắp', 'bó', 'gram', 'cọng', 'chén', 'bát', 'đóa', 'phần', 'thìa cà phê', 'muỗng cà phê',
    'thìa canh', 'muỗng canh', 'ống', 'tai', 'khoanh', 'lạng'
  ];
  
  commonUnits.sort((a, b) => b.length - a.length);
  
  let matchedUnit = '';
  for (const u of commonUnits) {
    const unitRegex = new RegExp(`^(${u})\\s+(.*)$`, 'i');
    const unitMatch = s.match(unitRegex);
    if (unitMatch) {
      matchedUnit = unitMatch[1];
      s = unitMatch[2].trim();
      break;
    }
  }
  
  if (matchedUnit) {
    unit = matchedUnit.toLowerCase();
  }
  
  name = s;
  return { name, quantity, unit };
}

async function run() {
  const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/navimart';
  const dbName = process.env.MONGODB_DB_NAME;
  
  console.log(`Connecting to MongoDB: ${mongoUri}...`);
  await mongoose.connect(mongoUri, dbName ? { dbName } : undefined);
  
  const Category = mongoose.model('Category', CategorySchema);
  const Food = mongoose.model('Food', FoodSchema);
  const User = mongoose.model('User', UserSchema);
  const Family = mongoose.model('Family', FamilySchema);
  const PantryItem = mongoose.model('PantryItem', PantryItemSchema);
  
  const cookpadJsonPath = '../cookpad_recipes_full.json';
  if (!existsSync(cookpadJsonPath)) {
    throw new Error(`File ${cookpadJsonPath} not found.`);
  }
  
  console.log('Reading Cookpad recipes file...');
  const records = JSON.parse(readFileSync(cookpadJsonPath, 'utf8'));
  
  const recipes = records.filter(
    (record: any) =>
      cleanCookpadText(record.title).length > 0 &&
      !record.url?.includes('/tao-moi') &&
      !record.image_url?.includes('logo_ogp')
  );
  
  console.log(`Found ${recipes.length} valid recipes.`);
  
  const allRawIngredients: string[] = [];
  for (const recipe of recipes) {
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      for (const ing of recipe.ingredients) {
        const cleaned = cleanCookpadText(ing);
        if (cleaned) {
          allRawIngredients.push(cleaned);
        }
      }
    }
  }
  
  console.log(`Parsed ${allRawIngredients.length} total ingredient occurrences.`);
  
  const parsedIngredients = allRawIngredients.map(parseIngredient);
  
  // Count frequency of normalized name across the entire file
  const countByName = new Map<string, number>();
  for (const item of parsedIngredients) {
    const norm = item.name.trim().toLowerCase();
    countByName.set(norm, (countByName.get(norm) ?? 0) + 1);
  }
  
  // Aggregate: group by normalizedName & unit
  const aggregated = new Map<string, { name: string; quantity: number; unit: string; occurrence: number }>();
  for (const item of parsedIngredients) {
    const normName = item.name.trim().toLowerCase();
    const normUnit = item.unit.trim().toLowerCase();
    const key = `${normName}::${normUnit}`;
    const occurrence = countByName.get(normName) ?? 0;
    
    let current = aggregated.get(key);
    if (!current) {
      current = {
        name: item.name,
        quantity: 0,
        unit: item.unit,
        occurrence,
      };
      aggregated.set(key, current);
    }
    
    if (occurrence > 1) {
      current.quantity += item.quantity;
    } else {
      current.quantity += item.quantity * 4;
    }
  }
  
  console.log(`Aggregated into ${aggregated.size} unique pantry items.`);
  
  // Load foods for matching
  const allFoods = await Food.find({ status: 'active' }).exec();
  const foodMap = new Map<string, any>();
  for (const food of allFoods) {
    foodMap.set(food.name.trim().toLowerCase(), food);
    if (food.aliases && Array.isArray(food.aliases)) {
      for (const alias of food.aliases) {
        foodMap.set(alias.trim().toLowerCase(), food);
      }
    }
  }
  
  // Find demo user and family
  const owner = await User.findOne({ email: 'me.navi@navimart.local' }).exec();
  if (!owner) {
    throw new Error('Demo user me.navi@navimart.local not found');
  }
  const family = await Family.findById(owner.activeFamilyId).exec();
  if (!family) {
    throw new Error('Demo family not found');
  }
  
  console.log(`Deleting existing pantry items for family: ${family.name}...`);
  await PantryItem.deleteMany({ familyId: family._id }).exec();
  
  const docsToInsert: any[] = [];
  for (const [_, item] of aggregated) {
    const normName = item.name.trim().toLowerCase();
    const food = foodMap.get(normName);
    
    let foodId = undefined;
    let categoryId = undefined;
    let location = 'fridge';
    let shelfLifeDays = 30;
    
    if (food) {
      foodId = food._id;
      categoryId = food.categoryId;
      location = food.defaultStorageLocation || 'fridge';
      if (food.defaultShelfLifeDays) {
        shelfLifeDays = food.defaultShelfLifeDays;
      }
    }
    
    docsToInsert.push({
      familyId: family._id,
      foodId,
      name: item.name,
      categoryId,
      quantity: Math.round(item.quantity * 100) / 100,
      unit: item.unit,
      expiryDate: new Date(Date.now() + shelfLifeDays * 24 * 60 * 60 * 1000),
      location,
      status: 'active',
      source: 'import',
      createdBy: owner._id,
      note: `Imported from Cookpad (occurrence: ${item.occurrence})`,
    });
  }
  
  console.log(`Inserting ${docsToInsert.length} pantry items...`);
  await PantryItem.insertMany(docsToInsert);
  
  console.log('Seeding finished successfully!');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  mongoose.disconnect();
});
