import { test, expect } from '@playwright/test';

test.describe('NaviMart E2E Tests', () => {
  // Test case 1: Housewife flows (Login, Shopping list, Pantry update, Meal planner, Suggestions, Stats)
  test('Housewife flow - Login, shopping list, auto pantry sync, stats, and suggestions', async ({ page }) => {
    // 1. Đăng nhập với tài khoản nội trợ demo
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
    
    await page.fill('#identifier', 'me.navi@navimart.local');
    await page.fill('#password', 'Demo@12345');
    await page.click('button[type="submit"]');

    // Chờ redirect đến home
    await page.waitForURL(/.*home/);
    await expect(page.locator('h1')).toContainText('Chào');

    // 2. Chức năng 3.1 & 4.1: Quản lý danh sách mua sắm
    await page.goto('/lists');
    await page.waitForURL(/.*lists/);
    
    // Click button Tạo danh sách mới
    await page.click('text=Tạo danh sách mới');
    
    // Nhập tên danh sách và lưu
    const uniqueListName = `Di cho E2E ${Date.now()}`;
    await page.fill('input[placeholder="Nhập tên danh sách..."]', uniqueListName);
    await page.click('button:has-text("Lưu")');

    // Chờ list xuất hiện và click vào list đó
    await page.click(`text=${uniqueListName}`);
    await page.waitForURL(/.*list-detail/);

    // Thêm thực phẩm "Cà chua" vào danh sách mua sắm
    const foodInput = page.locator('input[placeholder*="Thêm món đồ nhanh"]');
    await foodInput.fill('Cà chua');
    await page.waitForTimeout(500); // chờ gợi ý
    await foodInput.press('Enter');

    // Kiểm tra "Cà chua" đã được thêm vào mục Cần mua
    await expect(page.locator('text=Cần mua')).toBeVisible();
    await expect(page.locator('text=Cà chua')).toBeVisible();

    // Check item để đánh dấu đã mua
    await page.click('input[type="checkbox"]');
    
    // Đợi đồng bộ trạng thái mua sắm hoàn tất trên server và hiển thị 1/1 đã mua trên giao diện
    await expect(page.locator('text=1/1 đã mua')).toBeVisible();

    // Click "Hoàn thành & nhập kho"
    await page.click('button:has-text("Hoàn thành & nhập kho")');
    
    // Xác nhận ở popup dialog
    await page.click('button:has-text("Đồng ý")');

    // Sau khi đồng ý, hệ thống tự động thêm thực phẩm vào kho và chuyển hướng sang pantry
    await page.waitForURL(/.*pantry/);
    
    // Tắt thông báo "Đã thêm 1 món vào tủ lạnh!"
    await page.click('button:has-text("Đóng")');

    // Kiểm tra tiêu đề trang pantry
    await expect(page.locator('h1')).toContainText('Tổng quan tủ lạnh');

    // 3. Chức năng 3.2 & 4.2: Quản lý thực phẩm trong tủ lạnh
    // Tìm kiếm thực phẩm theo tên để lọc ra "Cà chua" trước khi trang chia trang (paging) ẩn đi thực phẩm mới
    await page.fill('input[placeholder*="Tìm thực phẩm theo tên"]', 'Cà chua');
    await page.waitForTimeout(500);
    
    // Lấy số lượng thẻ thực phẩm "Cà chua" ban đầu (đề phòng việc chạy test nhiều lần tạo ra nhiều bản ghi)
    const tomatoCards = page.locator('h3:has-text("Cà chua")');
    await expect(tomatoCards.first()).toBeVisible();
    const initialCount = await tomatoCards.count();

    // Chỉnh sửa số lượng thực phẩm của thẻ đầu tiên (Cập nhật số lượng)
    await page.locator('button:has-text("more_vert")').first().click();
    await page.click('text=Cập nhật số lượng');
    await page.fill('input[type="number"]', '5');
    await page.click('button:has-text("Cập nhật")');

    // Đợi số lượng cập nhật thành "5 cái"
    await expect(page.locator('span:has-text("5 cái")').first()).toBeVisible();

    // Đánh dấu đã dùng hết (Xoá) thẻ đầu tiên
    await page.locator('button:has-text("more_vert")').first().click();
    await page.click('text=Đã dùng hết (Xoá)');
    
    // Đợi số lượng thẻ giảm đi đúng 1
    await expect(tomatoCards).toHaveCount(initialCount - 1);

    // 4. Chức năng 3.3, 3.4 & 4.3, 4.4: Lên kế hoạch bữa ăn & Gợi ý món ăn thông minh
    await page.goto('/meals');
    await page.waitForURL(/.*meals/);
    await expect(page.locator('h1')).toContainText('Lịch trình bữa ăn');

    // Thử mở gợi ý món ăn thông minh từ tủ lạnh
    await page.click('text=Gợi ý món ăn từ tủ lạnh');
    await expect(page.locator('text=Hôm nay ăn gì?')).toBeVisible();
    
    // Chọn Thêm món này hoặc Bỏ qua
    await page.click('button:has-text("Bỏ qua")');

    // Truy cập xem danh mục công thức
    await page.goto('/recipe-suggestion');
    await page.waitForURL(/.*recipe-suggestion/);
    await expect(page.locator('h1')).toContainText('Gợi ý món ăn thông minh');

    // Click vào một công thức chi tiết đầu tiên lấy động từ giao diện và đảm bảo nó hiển thị (sử dụng :visible)
    const firstRecipeTitle = await page.locator('h4:visible').first().textContent();
    await page.locator('h4:visible').first().click();
    await page.waitForURL(/.*recipe-detail/);
    if (firstRecipeTitle) {
      // Sử dụng selector h1.font-display-lg để định vị cụ thể tiêu đề món ăn ở chế độ desktop, tránh lỗi strict mode với h1 ở header mobile
      await expect(page.locator('h1.font-display-lg')).toContainText(firstRecipeTitle.trim());
    }

    // 5. Chức năng 3.5: Báo cáo và thống kê
    await page.goto('/reports');
    await page.waitForURL(/.*reports/);
    await expect(page.locator('h1')).toContainText('Báo cáo & thống kê');

    // 6. Tính năng Gia đình
    await page.goto('/family');
    await page.waitForURL(/.*family/);
    await expect(page.locator('h1.font-headline-md')).toContainText('Quản lý Nhóm Gia Đình');
    await expect(page.locator('h3:has-text("Thành viên")').first()).toBeVisible();

    // Đăng xuất để chuẩn bị test tài khoản Admin
    await page.goto('/profile');
    await page.waitForURL(/.*profile/);
    await page.click('button:has-text("Đăng xuất")');
    await page.click('button:has-text("Đồng ý")');
    await page.waitForURL(/.*login/);
  });

  // Test case 2: Admin flows (Login, Dashboard admin, Manage users/recipes)
  test('Admin flow - Login and access Admin Dashboard features', async ({ page }) => {
    // 1. Đăng nhập Admin
    await page.goto('/login');
    await page.fill('#identifier', 'admin@navimart.local');
    await page.fill('#password', 'Admin@12345');
    await page.click('button[type="submit"]');

    // Admin được redirect thẳng đến trang admin
    await page.waitForURL(/.*admin/);
    await expect(page.locator('h1')).toContainText('Tổng quan');

    // Kiểm tra có các tab quản lý danh mục dữ liệu chính trong thanh bên (aside) để tránh lỗi strict mode
    await expect(page.locator('aside >> text=Người dùng')).toBeVisible();
    await expect(page.locator('aside >> text=Thực phẩm')).toBeVisible();
    await expect(page.locator('aside >> text=Danh mục dữ liệu')).toBeVisible();
  });
});
