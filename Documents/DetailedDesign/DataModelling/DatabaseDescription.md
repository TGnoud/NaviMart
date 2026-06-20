# Mô hình dữ liệu vật lý (Physical Data Model) - NaviMart

Tài liệu này mô tả chi tiết thiết kế cơ sở dữ liệu vật lý cho từng bảng trong hệ thống NaviMart, tuân thủ theo đúng chuẩn của Bài tập 07.

**Chú thích:**
- **PK**: Primary Key
- **FK**: Foreign Key
- **Mandatory**: Yêu cầu bắt buộc nhập (Yes/No) tương ứng với NOT NULL / NULL

---

### 1. Bảng `users`
**Mô tả:** Lưu trữ thông tin tài khoản người dùng và trạng thái hoạt động.

| # | PK | FK | Column Name | Data type | Mandatory | Description |
|---|---|---|---|---|---|---|
| 1. | x | | user_id | Integer | Yes | Mã định danh duy nhất của người dùng, tự động tăng |
| 2. | | | email | VARCHAR(150) | Yes | Email đăng nhập hệ thống, duy nhất |
| 3. | | | phone | VARCHAR(20) | No | Số điện thoại liên hệ |
| 4. | | | password_hash | VARCHAR(255) | Yes | Mật khẩu đã được mã hóa |
| 5. | | | first_name | VARCHAR(50) | Yes | Tên người dùng |
| 6. | | | last_name | VARCHAR(50) | Yes | Họ người dùng |
| 7. | | | dob | DATE | Yes | Ngày tháng năm sinh |
| 8. | | | gender | VARCHAR(10) | Yes | Giới tính (Nam, Nữ, Khác) |
| 9. | | | role | VARCHAR(20) | Yes | Vai trò (Admin, Housewife, Member) |
| 10.| | x | group_id | Integer | No | ID nhóm gia đình |
| 11.| | | status | VARCHAR(20) | Yes | Trạng thái (Active, Banned) |

---

### 2. Bảng `family_groups`
**Mô tả:** Lưu trữ thông tin nhóm gia đình.

| # | PK | FK | Column Name | Data type | Mandatory | Description |
|---|---|---|---|---|---|---|
| 1. | x | | group_id | Integer | Yes | ID nhóm gia đình, tự động tăng |
| 2. | | | group_name | VARCHAR(100) | Yes | Tên nhóm gia đình |
| 3. | | x | owner_id | Integer | Yes | ID người tạo nhóm |
| 4. | | | invite_code | VARCHAR(50) | No | Mã/Link mời tham gia nhóm, duy nhất |

---

### 3. Bảng `categories`
**Mô tả:** Phân loại nhóm thực phẩm.

| # | PK | FK | Column Name | Data type | Mandatory | Description |
|---|---|---|---|---|---|---|
| 1. | x | | category_id | Integer | Yes | ID nhóm thực phẩm, tự động tăng |
| 2. | | | name | VARCHAR(100) | Yes | Tên nhóm (Ví dụ: Rau củ, Thịt cá) |

---

### 4. Bảng `food_catalog`
**Mô tả:** Từ điển thực phẩm chuẩn của hệ thống.

| # | PK | FK | Column Name | Data type | Mandatory | Description |
|---|---|---|---|---|---|---|
| 1. | x | | food_id | Integer | Yes | ID thực phẩm, tự động tăng |
| 2. | | | name | VARCHAR(150) | Yes | Tên thực phẩm chuẩn |
| 3. | | x | category_id | Integer | Yes | ID danh mục thực phẩm |
| 4. | | | unit | VARCHAR(20) | Yes | Đơn vị tính chuẩn (Ví dụ: Kg, Quả, Bó) |

---

### 5. Bảng `shopping_lists`
**Mô tả:** Quản lý các đợt đi chợ của gia đình.

| # | PK | FK | Column Name | Data type | Mandatory | Description |
|---|---|---|---|---|---|---|
| 1. | x | | list_id | Integer | Yes | ID danh sách mua sắm, tự động tăng |
| 2. | | x | group_id | Integer | Yes | ID nhóm gia đình |
| 3. | | | name | VARCHAR(100) | Yes | Tên danh sách đi chợ |
| 4. | | | created_at | DATETIME | Yes | Thời gian tạo danh sách |
| 5. | | | type | VARCHAR(20) | No | Loại danh sách (Ví dụ: Hàng ngày, Hàng tuần) |

---

### 6. Bảng `shopping_list_items`
**Mô tả:** Chi tiết các món đồ cần mua trong một danh sách.

| # | PK | FK | Column Name | Data type | Mandatory | Description |
|---|---|---|---|---|---|---|
| 1. | x | | item_id | Integer | Yes | ID món đồ cần mua, tự động tăng |
| 2. | | x | list_id | Integer | Yes | ID danh sách mua sắm |
| 3. | | x | food_id | Integer | Yes | ID thực phẩm |
| 4. | | | quantity | DECIMAL(10,2) | Yes | Số lượng cần mua |
| 5. | | | status | VARCHAR(20) | No | Trạng thái món đồ (Pending, Bought) |

---

### 7. Bảng `inventory`
**Mô tả:** Quản lý thực phẩm hiện có trong tủ lạnh của gia đình.

| # | PK | FK | Column Name | Data type | Mandatory | Description |
|---|---|---|---|---|---|---|
| 1. | x | | inventory_id | Integer | Yes | ID dòng tồn kho, tự động tăng |
| 2. | | x | group_id | Integer | Yes | ID nhóm gia đình |
| 3. | | x | food_id | Integer | Yes | ID thực phẩm |
| 4. | | | quantity | DECIMAL(10,2) | Yes | Số lượng tồn kho hiện tại |
| 5. | | | expiry_date | DATE | Yes | Hạn sử dụng của thực phẩm |
| 6. | | | location | VARCHAR(50) | Yes | Vị trí lưu trữ (Ngăn đông, Ngăn mát) |

---

### 8. Bảng `recipes`
**Mô tả:** Quản lý các công thức nấu ăn.

| # | PK | FK | Column Name | Data type | Mandatory | Description |
|---|---|---|---|---|---|---|
| 1. | x | | recipe_id | Integer | Yes | ID công thức nấu ăn, tự động tăng |
| 2. | | | name | VARCHAR(200) | Yes | Tên món ăn |
| 3. | | | instructions | TEXT | Yes | Chi tiết các bước chế biến |
| 4. | | | image_url | VARCHAR(255) | No | Đường dẫn tới ảnh minh họa |
| 5. | | x | author_id | Integer | Yes | ID người đóng góp |
| 6. | | | status | VARCHAR(20) | No | Trạng thái hiển thị (Pending, Approved) |

---

### 9. Bảng `recipe_ingredients`
**Mô tả:** Nguyên liệu cấu thành nên một công thức.

| # | PK | FK | Column Name | Data type | Mandatory | Description |
|---|---|---|---|---|---|---|
| 1. | x | x | recipe_id | Integer | Yes | ID công thức nấu ăn |
| 2. | x | x | food_id | Integer | Yes | ID thực phẩm |
| 3. | | | quantity_required | DECIMAL(10,2) | Yes | Định lượng cần thiết để nấu món ăn |

---

### 10. Bảng `meal_plans`
**Mô tả:** Lịch trình lên thực đơn các bữa ăn.

| # | PK | FK | Column Name | Data type | Mandatory | Description |
|---|---|---|---|---|---|---|
| 1. | x | | plan_id | Integer | Yes | ID kế hoạch, tự động tăng |
| 2. | | x | group_id | Integer | Yes | ID nhóm gia đình |
| 3. | | | date | DATE | Yes | Ngày thực hiện bữa ăn |
| 4. | | | meal_type | VARCHAR(20) | Yes | Loại bữa ăn (Sáng, Trưa, Tối) |
| 5. | | x | recipe_id | Integer | Yes | ID công thức nấu ăn |
| 6. | | | is_completed | BOOLEAN | No | Đã hoàn tất bữa ăn hay chưa |
