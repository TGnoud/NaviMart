# Danh Sách Các Màn Hình Cần Thiết Kế (Detailed Screen List)

Danh sách này chia nhỏ từng màn hình theo từng luồng (flow) và từng trạng thái (state) cụ thể để team Design (Figma) và team Dev có thể triển khai không bỏ sót chi tiết nào.

## 1. Nhóm Khởi động & Xác thực (Onboarding & Auth)
- [ ] **1.1. Splash Screen**
  - Trạng thái chờ hiển thị Logo.
- [ ] **1.2. Onboarding Screens (Giới thiệu)**
  - Slide 1: Lên danh sách mua sắm nhanh chóng.
  - Slide 2: Quản lý thực phẩm, tránh lãng phí.
  - Slide 3: Gợi ý bữa ăn thông minh từ tủ lạnh.
- [ ] **1.3. Login / Register**
  - Đăng nhập/Đăng ký qua SĐT hoặc mạng xã hội.
- [ ] **1.4. User Profile Setup (Cho user mới)**
  - Form nhập thông tin cơ bản.

---

## 2. Nhóm Quản lý Đi chợ (Shopping List - Core)
- [ ] **2.1. Home Dashboard (Trang chủ)**
  - Tóm tắt danh sách đi chợ hôm nay.
  - Cảnh báo thực phẩm sắp hết hạn trong tủ lạnh.
  - Gợi ý món ăn hôm nay.
- [ ] **2.2. My Lists (Danh sách của tôi)**
  - Tab "Đang mua" và Tab "Đã mua".
  - Nút tạo danh sách mới.
- [ ] **2.3. Modal Tạo/Sửa Danh sách**
  - Nhập tên danh sách, chọn theo ngày hoặc tuần.
- [ ] **2.4. Chi tiết Danh sách (List Detail)**
  - Thanh nhập liệu đồ cần mua.
  - Danh sách chia theo Category (Rau củ, Thịt cá, Đồ khô, Gia vị).
  - Component checkbox và nút tăng giảm số lượng.
- [ ] **2.5. Modal Hoàn tất Đi chợ**
  - Popup chúc mừng đã mua xong.
  - Xác nhận tự động chuyển các món đã mua vào "Tủ lạnh".

---

## 3. Nhóm Quản lý Tủ lạnh (Pantry)
- [ ] **3.1. Pantry Dashboard (Tổng quan tủ lạnh)**
  - Tabs phân loại vị trí: Tất cả, Tủ đông, Tủ mát, Đồ khô.
  - Danh sách thực phẩm kèm số lượng.
- [ ] **3.2. Cảnh báo Hạn Sử Dụng (Color-coded Expiry)**
  - Tag Xanh (An toàn), Tag Cam (Sắp hết hạn), Tag Đỏ (Đã hết hạn).
- [ ] **3.3. Add Item to Pantry (Thêm/Sửa thực phẩm thủ công)**
  - Form nhập: Tên thực phẩm, Số lượng, Đơn vị tính, Hạn sử dụng, Vị trí lưu trữ.
- [ ] **3.4. Modal Hành động Thực phẩm**
  - Lựa chọn: Cập nhật số lượng (sau khi dùng), Xóa, hoặc Gợi ý món ăn với nguyên liệu này.

---

## 4. Nhóm Lên Kế Hoạch & Gợi Ý Bữa Ăn (Meals)
- [ ] **4.1. Meal Planner (Lịch trình bữa ăn)**
  - Hiển thị Kế hoạch theo Tuần hoặc Ngày.
  - Các slot bữa sáng, trưa, tối.
- [ ] **4.2. Smart Recipe Suggestion (Gợi ý món ăn thông minh)**
  - Danh sách gợi ý dựa trên thực phẩm sắp hết hạn trong tủ lạnh.
  - Thanh tìm kiếm món ăn theo nguyên liệu có sẵn.
- [ ] **4.3. Recipe Detail (Chi tiết công thức)**
  - Hình ảnh, thời gian nấu, độ khó.
  - Danh sách nguyên liệu cần thiết (Highlight các nguyên liệu đang bị thiếu trong tủ lạnh).
  - Nút "Thêm nguyên liệu thiếu vào Danh sách đi chợ".
- [ ] **4.4. Modal Xác nhận Thực đơn**
  - Popup xác nhận lưu món ăn vào lịch trình.

---

## 5. Nhóm Báo Cáo & Thống Kê (Reports)
- [ ] **5.1. Dashboard Thống Kê**
  - Biểu đồ thống kê thực phẩm đã mua theo thời gian.
- [ ] **5.2. Báo Cáo Xu Hướng Tiêu Thụ**
  - Phân tích xu hướng tiêu thụ thực phẩm trong gia đình.
- [ ] **5.3. Báo Cáo Lãng Phí (Waste Report)**
  - Báo cáo số lượng thực phẩm bị lãng phí do hết hạn.

---

## 6. Nhóm Quản Trị & Cá Nhân Hóa (Admin & Profile)
- [ ] **6.1. Profile (Trang cá nhân)**
  - Thông tin tài khoản người dùng/nội trợ.
- [ ] **6.2. Quản lý Nhóm Gia Đình (Family Sharing)**
  - Tạo nhóm, chia sẻ danh sách mua sắm, phân công nhiệm vụ cho thành viên.
- [ ] **6.3. Admin Dashboard (Dành cho Quản trị viên hệ thống)**
  - Quản lý tài khoản người dùng.
  - Quản lý danh mục (loại thực phẩm, đơn vị tính, công thức nấu ăn).
  - Thống kê hiệu suất hệ thống.
- [ ] **6.4. Settings (Cài đặt ứng dụng)**
  - Cài đặt thông báo (nhắc đi chợ, nhắc HSD trước 3 ngày).

---

## 7. Các UI Components Dùng Chung (Global Components)
- [ ] **7.1. Bottom Navigation Bar**
  - 5 icon chính: Home, Pantry, Lists, Meals, Reports.
- [ ] **7.2. Toast & Notifications (Thông báo nổi)**
- [ ] **7.3. Dialogs / Alerts (Hộp thoại xác nhận)**
