# Tài liệu Chi tiết User Flow & UI Screens - Tiện Ích Đi Chợ

Tài liệu này mô tả cụ thể từng màn hình, các thành phần UI trên đó và các bước tương tác (Flow) chi tiết của người dùng đối với hệ thống đi chợ tiện lợi, quản lý tủ lạnh và lên kế hoạch bữa ăn.

---

## I. MÔ TẢ CHI TIẾT CÁC MÀN HÌNH (SCREENS DETAIL)

### 1. Nhóm Điều hướng Chung (Global Navigation)
- **Bottom Navigation Bar**: Thanh điều hướng luôn hiển thị ở dưới cùng màn hình.
  - **Home (Trang chủ)**: Bảng tin tổng hợp, thông báo hạn sử dụng.
  - **Pantry (Tủ lạnh)**: Quản lý thực phẩm hiện có ở nhà.
  - **Lists (Đi chợ)**: Nút nằm chính giữa, được thiết kế to và nổi bật nhất.
  - **Meals (Bữa ăn)**: Lên kế hoạch thực đơn và gợi ý công thức.
  - **Profile/Reports (Cá nhân & Báo cáo)**: Thống kê, chia sẻ gia đình và cài đặt.

### 2. Nhóm Lên Danh Sách Đi Chợ (Shopping List)
**2.1. Màn hình "Danh sách của tôi" (My Lists)**
- **UI Elements**:
  - **Header**: Tiêu đề "Danh sách đi chợ" + Nút `[+] Tạo danh sách mới`.
  - **Tabs**: "Đang mua" (Active) và "Đã mua" (History).
  - **List Cards**: Mỗi danh sách hiển thị tên (ví dụ: Danh sách Thứ 7), Ngày tạo, Thanh tiến trình (Đã mua 3/10 món). Có thể vuốt để xóa.

**2.2. Màn hình "Chi tiết Danh sách" (List Detail)**
- **UI Elements**:
  - **Header**: Tên danh sách + Icon `[Share]` (để chia sẻ cho thành viên gia đình).
  - **Input Bar**: Thanh nhập "Thêm thực phẩm cần mua...".
  - **Danh sách mặt hàng**:
    - Tự động nhóm theo danh mục (Rau củ, Thịt cá, Đồ khô, Gia vị).
    - Có Checkbox để đánh dấu khi đã mua xong.
  - **Chế độ đi chợ**: Khi tick vào món đồ, món đồ sẽ bị gạch ngang và chuyển xuống dưới. Khi hoàn tất, hệ thống tự động đưa các thực phẩm đã mua vào Tủ lạnh ảo.

### 3. Nhóm Quản lý Tủ lạnh (Pantry/Fridge)
**3.1. Màn hình "Tủ lạnh của tôi" (Pantry Dashboard)**
- **UI Elements**:
  - **Tabs/Filter**: Tất cả, Tủ đông, Tủ mát, Khác.
  - **Item Row**: 
    - Tên thực phẩm, số lượng, vị trí lưu trữ.
    - **Tag Hạn Sử Dụng (Color-coded)**: Xanh (còn hạn dài), Cam (sắp hết hạn - trước 3 ngày), Đỏ (đã hết hạn).
  - **Tương tác**: Chỉnh sửa số lượng, đánh dấu đã dùng hết, hoặc tìm kiếm công thức nấu ăn với nguyên liệu này.

**3.2. Màn hình "Thêm thực phẩm" (Add Item)**
- **UI Elements**:
  - Form nhập: Tên thực phẩm, Số lượng, Đơn vị tính, Ngày hết hạn, Vị trí lưu trữ.
  - Tùy chọn gợi ý cách bảo quản tối ưu cho từng loại thực phẩm.

### 4. Nhóm Kế hoạch bữa ăn & Gợi ý món ăn (Meal Planning & Suggestions)
**4.1. Màn hình "Kế hoạch bữa ăn" (Meal Planner)**
- **UI Elements**:
  - Lịch trình dạng Tuần/Ngày.
  - Các slot bữa sáng, trưa, tối. Nút `[+] Thêm món`.
  - Nút `[Tự động tạo danh sách đi chợ]` cho các nguyên liệu còn thiếu trong thực đơn.

**4.2. Màn hình "Gợi ý món ăn thông minh" (Smart Suggestions)**
- **UI Elements**:
  - Gợi ý món ăn dựa trên: Thực phẩm sắp hết hạn trong tủ lạnh, hoặc thực phẩm còn lại nhiều.
  - Thanh tìm kiếm món ăn theo nguyên liệu có sẵn.
  - Danh sách thẻ Công thức nấu ăn (Recipe Cards) gồm hình ảnh, tên món, độ khó, thời gian nấu.

### 5. Nhóm Báo cáo & Thống kê (Reports)
**5.1. Màn hình "Báo cáo tiêu dùng" (Dashboard Statistics)**
- **UI Elements**:
  - Biểu đồ xu hướng tiêu thụ thực phẩm của gia đình.
  - Thống kê chi tiết thực phẩm đã mua theo thời gian.
  - Báo cáo số lượng thực phẩm bị lãng phí (do hết hạn không sử dụng).

---

## II. SƠ ĐỒ LƯU TRÌNH NGƯỜI DÙNG (DETAILED USER FLOWS)

### Flow 1: Lên danh sách và Đi chợ (Shopping & Auto-Inventory Flow)
1. Người dùng vào tab **Lists**, tạo danh sách mua sắm theo ngày/tuần.
2. (Tùy chọn) Chia sẻ danh sách cho thành viên khác trong gia đình.
3. Khi đi siêu thị, người dùng tick chọn các món đã mua vào giỏ.
4. Khi nhấn **Hoàn tất mua sắm**, hệ thống tự động cập nhật các mặt hàng đã mua vào kho lưu trữ (Tủ lạnh).

### Flow 2: Quản lý Tủ lạnh và Xử lý thực phẩm sắp hết hạn
1. Hệ thống quét dữ liệu mỗi ngày. Nếu có thực phẩm còn dưới 3 ngày hết hạn, gửi thông báo (Push Notification).
2. Người dùng mở app, vào phần **Pantry**, thấy cảnh báo màu Cam.
3. Người dùng chọn món đó và bấm **Gợi ý món ăn**.
4. Hệ thống hiển thị các công thức nấu ăn sử dụng thực phẩm đó để tránh lãng phí.
5. Sau khi nấu xong, người dùng cập nhật lại số lượng (giảm đi) trong ứng dụng.

### Flow 3: Lên kế hoạch bữa ăn theo Tuần
1. Người dùng vào tab **Meals**, chọn chế độ lên kế hoạch tuần.
2. Hệ thống đề xuất một số món dựa trên thực phẩm có sẵn.
3. Người dùng xác nhận hoặc tìm kiếm thêm công thức yêu thích và gắn vào các ngày trong tuần.
4. Hệ thống kiểm tra: "Thực đơn yêu cầu 500g thịt bò, nhưng tủ lạnh chỉ có 200g".
5. Hệ thống tự động đẩy 300g thịt bò còn thiếu vào **Danh sách đi chợ**.

### Flow 4: Xem Báo Cáo Lãng Phí (Waste Report)
1. Người dùng vào tab **Reports**.
2. Xem biểu đồ thống kê các món ăn đã phải vứt bỏ do hết hạn trong tháng qua.
3. Xem phân tích xu hướng để điều chỉnh số lượng mua sắm cho tháng tiếp theo.
