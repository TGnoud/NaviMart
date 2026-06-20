# Đặc tả Lớp (Class Specification) - Module Meals

Tài liệu mô tả chi tiết các phương thức và thuộc tính của các lớp trong Module Meals.

## 1. Views
### 1.1. Lớp `MealPlanner`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện lập kế hoạch bữa ăn.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | render | JSX.Element | Render giao diện HTML/CSS |

**Parameter:**
Không

**Exception:**
Không

**Method:**
- Hiển thị lịch ăn uống của gia đình.

**State:**
Không

## 2. API Clients
### 2.1. Lớp `MealsApiClient`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Lớp gọi API bằng Axios để tương tác với Backend.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | baseUrl | String | `""` | URL gốc của backend |

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | Promise\<any\> | Lấy danh sách kế hoạch bữa ăn |
| 2 | create | Promise\<any\> | Thêm bữa ăn vào kế hoạch |
| 3 | findOne | Promise\<any\> | Xem chi tiết kế hoạch |
| 4 | getMissingIngredients | Promise\<any\> | Kiểm tra nguyên liệu còn thiếu |
| 5 | generateShoppingList | Promise\<any\> | Tự động tạo danh sách mua sắm |
| 6 | update | Promise\<any\> | Sửa kế hoạch bữa ăn |
| 7 | remove | Promise\<any\> | Xóa kế hoạch |

**Parameter:**
- `data` – Đối tượng chứa tham số cho từng request

**Exception:**
- Lỗi kết nối API.

**Method:**
- Gọi đến đường dẫn `/api/meals`.

**State:**
Không

## 3. Controllers
### 3.1. Lớp `MealsController`
- **Stereotype**: `<<Control>>`
- **Mô tả**: NestJS Controller nhận request từ Frontend.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | Response | Gọi Service tìm danh sách |
| 2 | create | Response | Gọi Service tạo mới |
| 3 | findOne | Response | Gọi Service lấy chi tiết |
| 4 | getMissingIngredients | Response | Gọi Service phân tích nguyên liệu thiếu |
| 5 | generateShoppingList | Response | Gọi Service sinh danh sách mua sắm |
| 6 | update | Response | Gọi Service cập nhật |
| 7 | remove | Response | Gọi Service xóa |

**Parameter:**
- `dto` – Tham số body/query truyền từ client.

**Exception:**
- `NotFoundException` – Nếu meal_id không hợp lệ.

**Method:**
- Trích xuất dữ liệu và truyền cho `MealsService`.

**State:**
Không

## 4. Services
### 4.1. Lớp `MealsService`
- **Stereotype**: `<<Control>>`
- **Mô tả**: Lớp chứa Business Logic xử lý nghiệp vụ bữa ăn.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | any | Logic lấy kế hoạch bữa ăn |
| 2 | create | any | Khởi tạo kế hoạch |
| 3 | findOne | any | Tìm kiếm theo ID |
| 4 | getMissingIngredients | any | Thuật toán đối chiếu Pantry để tìm đồ thiếu |
| 5 | generateShoppingList | any | Tự động thêm đồ thiếu vào Shopping List |
| 6 | update | any | Sửa ngày giờ/loại bữa ăn |
| 7 | remove | any | Xóa khỏi database |

**Parameter:**
- `data` – Dữ liệu từ Controller.

**Exception:**
- Ngoại lệ logic.

**Method:**
- CRUD thông qua `MealPlansEntity`. Phối hợp với Module Pantry và Shopping List.

**State:**
Không

## 5. Entities
### 5.1. Lớp `MealPlansEntity`
- **Stereotype**: `<<Entity>>`
- **Mô tả**: Đối tượng dữ liệu ánh xạ từ Database bảng `meal_plans`.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | plan_id | INT | `null` | Khóa chính |
| 2 | group_id | INT | `null` | Nhóm sở hữu |
| 3 | date | DATE | `null` | Ngày dự kiến |
| 4 | meal_type | VARCHAR | `""` | Loại bữa (Sáng/Trưa/Tối) |
| 5 | recipe_id | INT | `null` | ID công thức |
| 6 | is_completed | BOOLEAN | `false` | Đã hoàn tất nấu chưa |

**Operation**
Không

**Parameter:**
Không

**Exception:**
Không

**Method:**
Không

**State:**
Không
