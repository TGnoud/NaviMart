import 'dotenv/config';
import mongoose from 'mongoose';
import {
  Category,
  CategorySchema,
} from '../catalog/schemas/category.schema';
import { Food, FoodSchema } from '../catalog/schemas/food.schema';

function stripAccents(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, (c) => (c === 'đ' ? 'd' : 'D'))
    .toLowerCase()
    .trim();
}

const CATEGORY_FIXES: Array<{ slug: string; name: string; description: string }> = [
  { slug: 'rau-cu', name: 'Rau củ', description: 'Rau xanh, củ quả và nấm tươi.' },
  { slug: 'thit-ca', name: 'Thịt cá', description: 'Thịt, cá, hải sản và protein tươi sống.' },
  { slug: 'do-kho', name: 'Đồ khô', description: 'Gạo, mì, ngũ cốc và thực phẩm khô.' },
  { slug: 'gia-vi', name: 'Gia vị', description: 'Gia vị, sốt, dầu ăn và nguyên liệu nêm.' },
  { slug: 'sua-trung', name: 'Sữa trứng', description: 'Sữa, trứng và các sản phẩm từ sữa.' },
  { slug: 'trai-cay', name: 'Trái cây', description: 'Trái cây tươi và trái cây cắt sẵn.' },
];

const FOOD_FIXES: Array<{ name: string; normalizedName: string; storageTips: string }> = [
  // Thịt cá
  { name: 'Thịt bò', normalizedName: 'thịt bò', storageTips: 'Bảo quản ngăn mát, dùng sớm trong 1-3 ngày.' },
  { name: 'Thịt gà', normalizedName: 'thịt gà', storageTips: 'Để trong hộp kín, tránh tiếp xúc thực phẩm chín.' },
  { name: 'Cá hồi', normalizedName: 'cá hồi', storageTips: 'Giữ lạnh sau khi mua, nên dùng trong 24-48 giờ.' },
  { name: 'Thịt heo', normalizedName: 'thịt heo', storageTips: 'Bảo quản ngăn mát trong hộp kín, nên dùng trong 2-3 ngày.' },
  { name: 'Tôm', normalizedName: 'tôm', storageTips: 'Cấp đông nếu chưa dùng ngay, rã đông trong ngăn mát.' },
  { name: 'Mực', normalizedName: 'mực', storageTips: 'Làm sạch, để hộp kín và cấp đông.' },
  { name: 'Cá thu', normalizedName: 'cá thu', storageTips: 'Chia khẩu phần nhỏ trước khi cấp đông.' },
  // Sữa trứng
  { name: 'Trứng gà', normalizedName: 'trứng gà', storageTips: 'Để trong vị trí ổn định nhiệt độ, không rửa trước khi cắt.' },
  { name: 'Sữa tươi', normalizedName: 'sữa tươi', storageTips: 'Đóng nắp kín sau khi mở và dùng trong vài ngày.' },
  { name: 'Đậu hũ', normalizedName: 'đậu hũ', storageTips: 'Ngâm nước sạch và thay nước mỗi ngày nếu đã mở hộp.' },
  { name: 'Sữa chua', normalizedName: 'sữa chua', storageTips: 'Giữ lạnh liên tục, dùng trước hạn trên nắp.' },
  // Rau củ
  { name: 'Cà rốt', normalizedName: 'cà rốt', storageTips: 'Cắt bỏ lá, để ngăn rau củ.' },
  { name: 'Bông cải xanh', normalizedName: 'bông cải xanh', storageTips: 'Để khô thoáng trong túi giấy hoặc hộp có lỗ thoáng.' },
  { name: 'Cà chua', normalizedName: 'cà chua', storageTips: 'Để nơi thoáng mát nếu chưa chín quá.' },
  { name: 'Hành tây', normalizedName: 'hành tây', storageTips: 'Để nơi khô, thoáng, tránh ánh nắng trực tiếp.' },
  { name: 'Khoai tây', normalizedName: 'khoai tây', storageTips: 'Để nơi khô tối, tránh để gần hành tây.' },
  { name: 'Khoai lang', normalizedName: 'khoai lang', storageTips: 'Để nơi khô thoáng, không để trong tủ lạnh lâu.' },
  { name: 'Rau muống', normalizedName: 'rau muống', storageTips: 'Bọc giấy ẩm và để ngăn rau.' },
  { name: 'Bắp cải', normalizedName: 'bắp cải', storageTips: 'Bọc kín phần đã cắt và để ngăn mát.' },
  { name: 'Dưa leo', normalizedName: 'dưa leo', storageTips: 'Để ngăn rau, tránh đọng nước.' },
  { name: 'Nấm hương', normalizedName: 'nấm hương', storageTips: 'Để trong túi giấy hoặc hộp thoáng khí.' },
  { name: 'Bắp Mỹ', normalizedName: 'bắp mỹ', storageTips: 'Giữ nguyên vỏ nếu chưa dùng ngay.' },
  { name: 'Đậu que', normalizedName: 'đậu que', storageTips: 'Để khô thoáng trong hộp kín.' },
  // Đồ khô
  { name: 'Gạo', normalizedName: 'gạo', storageTips: 'Bảo quản trong hộp kín, tránh ẩm.' },
  { name: 'Mì gói', normalizedName: 'mì gói', storageTips: 'Để nơi khô mát.' },
  { name: 'Phở khô', normalizedName: 'phở khô', storageTips: 'Để nơi khô thoáng, đóng kín sau khi mở.' },
  { name: 'Bún khô', normalizedName: 'bún khô', storageTips: 'Bảo quản trong hộp kín tránh ẩm.' },
  { name: 'Mì Ý', normalizedName: 'mì ý', storageTips: 'Để nơi khô mát, tránh ánh nắng trực tiếp.' },
  { name: 'Bánh mì', normalizedName: 'bánh mì', storageTips: 'Dùng trong ngày, có thể cấp đông nếu mua nhiều.' },
  { name: 'Đậu phộng', normalizedName: 'đậu phộng', storageTips: 'Bảo quản hộp kín, tránh dầu bị ôi.' },
  // Gia vị
  { name: 'Dầu ăn', normalizedName: 'dầu ăn', storageTips: 'Đóng nắp kín, tránh ánh nắng.' },
  { name: 'Nước mắm', normalizedName: 'nước mắm', storageTips: 'Đóng nắp kín sau khi dùng.' },
  { name: 'Gừng', normalizedName: 'gừng', storageTips: 'Để nơi khô thoáng hoặc ngăn mát nếu đã cắt.' },
  { name: 'Tỏi', normalizedName: 'tỏi', storageTips: 'Để nơi khô thoáng, tránh ẩm mốc.' },
  { name: 'Sả', normalizedName: 'sả', storageTips: 'Bọc kín và để ngăn mát hoặc cấp đông.' },
  { name: 'Ớt', normalizedName: 'ớt', storageTips: 'Để khô, có thể cấp đông nếu mua nhiều.' },
  // Trái cây
  { name: 'Táo', normalizedName: 'táo', storageTips: 'Để ngăn mát để giữ độ giòn lâu hơn.' },
  { name: 'Chuối', normalizedName: 'chuối', storageTips: 'Để ngoài nhiệt độ phòng, tách khỏi trái cây khác nếu chín nhanh.' },
  { name: 'Cam', normalizedName: 'cam', storageTips: 'Để ngăn mát để giữ nước lâu hơn.' },
  { name: 'Dưa hấu', normalizedName: 'dưa hấu', storageTips: 'Cắt ra thì bọc kín và dùng trong 2-3 ngày.' },
];

async function main() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/navimart';
  console.log(`Connecting to ${uri} ...`);
  await mongoose.connect(uri);

  const CategoryModel = mongoose.model(Category.name, CategorySchema);
  const FoodModel = mongoose.model(Food.name, FoodSchema);

  // ── Fix categories (lookup by stable slug) ──────────────────────────────────
  console.log('\n--- Fixing categories ---');
  for (const fix of CATEGORY_FIXES) {
    const result = await CategoryModel.updateMany(
      { slug: fix.slug },
      { $set: { name: fix.name, description: fix.description } },
    );
    if (result.modifiedCount > 0) {
      console.log(`  Updated  : ${fix.slug} -> "${fix.name}"`);
    } else {
      console.log(`  No change: ${fix.slug} (already correct or not found)`);
    }
  }

  // ── Fix foods (lookup by stripped-accent comparison) ────────────────────────
  console.log('\n--- Fixing foods ---');
  const allFoods = await FoodModel.find({}).lean().exec();

  for (const fix of FOOD_FIXES) {
    const fixStripped = stripAccents(fix.name);
    const matches = allFoods.filter((f) => stripAccents(f.name) === fixStripped);

    if (matches.length === 0) {
      console.log(`  Not found: "${fix.name}"`);
      continue;
    }

    const correct = matches.filter((f) => f.name === fix.name);
    const wrong = matches.filter((f) => f.name !== fix.name);

    if (correct.length > 0 && wrong.length === 0) {
      console.log(`  Already correct: "${fix.name}"`);
      continue;
    }

    if (correct.length > 0 && wrong.length > 0) {
      // Correct version already exists — delete the stale duplicates
      const ids = wrong.map((f) => f._id);
      await FoodModel.deleteMany({ _id: { $in: ids } });
      console.log(`  Deleted ${wrong.length} stale duplicate(s) of "${fix.name}"`);
      continue;
    }

    // No correct version exists — update the first wrong one, delete the rest
    const [toUpdate, ...toDeleteRest] = wrong;
    await FoodModel.updateOne(
      { _id: toUpdate._id },
      {
        $set: {
          name: fix.name,
          normalizedName: fix.normalizedName,
          storageTips: fix.storageTips,
        },
      },
    );
    console.log(`  Updated  : "${toUpdate.name}" -> "${fix.name}"`);

    if (toDeleteRest.length > 0) {
      const ids = toDeleteRest.map((f) => f._id);
      await FoodModel.deleteMany({ _id: { $in: ids } });
      console.log(`  Deleted ${toDeleteRest.length} extra duplicate(s)`);
    }
  }

  console.log('\nMigration complete.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
