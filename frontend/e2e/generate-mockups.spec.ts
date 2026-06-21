import { test } from '@playwright/test';

// Danh sách các màn hình cần chụp
const screens = [
  { path: '/login', name: '01_Login' },
  { path: '/register', name: '02_Register' },
  { path: '/forgot-password', name: '03_ForgotPassword' },
  { path: '/home', name: '04_Home' },
  { path: '/pantry', name: '05_PantryDashboard' },
  { path: '/add-item', name: '06_AddItem' },
  { path: '/lists', name: '07_MyLists' },
  { path: '/recipe-suggestion', name: '08_RecipeSuggestion' },
  { path: '/meals', name: '09_MealPlanner' },
  { path: '/family', name: '10_FamilySharing' },
  { path: '/reports', name: '11_StatsDashboard' },
  { path: '/profile', name: '12_Profile' },
  { path: '/settings', name: '13_Settings' },
  { path: '/notifications', name: '14_Notifications' },
];

test('Generate Mockups from Frontend', async ({ page }) => {
  // 1. Mở trang chủ để thiết lập LocalStorage (bỏ qua đăng nhập cho các route được bảo vệ)
  await page.goto('http://localhost:5173/login');
  
  await page.evaluate(() => {
    // Giả lập trạng thái đăng nhập
    localStorage.setItem('navimart_tokens', JSON.stringify({ accessToken: 'fake-token', refreshToken: 'fake-token' }));
    localStorage.setItem('navimart_user', JSON.stringify({ 
      id: 1, 
      role: 'user', 
      email: 'test@navimart.vn',
      firstName: 'Người', 
      lastName: 'Nội Trợ',
      activeFamilyId: 1
    }));
  });

  // 2. Chụp ảnh lần lượt các màn hình
  for (const screen of screens) {
    console.log(`Đang chụp màn hình: ${screen.name}...`);
    await page.goto(`http://localhost:5173${screen.path}`);
    
    // Đợi 1.5 giây để các hiệu ứng animation, skeleton loading hoặc API giả lập tải xong
    await page.waitForTimeout(1500); 

    // Chụp toàn bộ màn hình và lưu vào thư mục Mockup
    await page.screenshot({ 
      path: `C:/Users/trinh/Downloads/NaviMart/Documents/03_DetailedDesign/UserInterfaceDesign/Mockup/${screen.name}.png`,
      fullPage: true 
    });
  }
});
