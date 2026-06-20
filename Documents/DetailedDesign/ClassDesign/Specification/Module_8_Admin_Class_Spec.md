# Đặc tả Lớp (Class Specification) - Module Admin

Tài liệu mô tả chi tiết các phương thức và thuộc tính của các lớp trong Module Admin.

## 1. Views
### 1.1. Lớp `AdminDashboard`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React hiển thị bảng điều khiển quản trị.

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
- Hiển thị menu quản lý Catalog, Recipe, System, Users.

**State:**
Không

## 2. API Clients
### 2.1. Lớp `AdminApiClient`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Lớp gọi API bằng Axios để tương tác với Backend.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | baseUrl | String | `""` | URL gốc của backend |

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAllCategories | Promise\<any\> | Lấy DS danh mục thực phẩm |
| 2 | createCategory | Promise\<any\> | Thêm mới danh mục |
| 3 | updateCategory | Promise\<any\> | Cập nhật danh mục |
| 4 | removeCategory | Promise\<any\> | Xóa danh mục |
| 5 | findAllFoods | Promise\<any\> | Lấy DS thực phẩm |
| 6 | createFood | Promise\<any\> | Thêm mới thực phẩm |
| 7 | updateFood | Promise\<any\> | Cập nhật thực phẩm |
| 8 | removeFood | Promise\<any\> | Xóa thực phẩm |
| 9 | findAllUnits | Promise\<any\> | Lấy DS đơn vị tính |
| 10 | createUnit | Promise\<any\> | Thêm mới đơn vị tính |
| 11 | updateUnit | Promise\<any\> | Cập nhật đơn vị tính |
| 12 | removeUnit | Promise\<any\> | Xóa đơn vị tính |
| 13 | findAll | Promise\<any\> | Lấy DS Recipes/Users |
| 14 | updateStatus | Promise\<any\> | Sửa trạng thái phê duyệt |
| 15 | getStats | Promise\<any\> | Lấy số liệu chung hệ thống |
| 16 | findOne | Promise\<any\> | Xem chi tiết user/recipe |
| 17 | create | Promise\<any\> | Thêm mới (Generic) |
| 18 | update | Promise\<any\> | Cập nhật (Generic) |
| 19 | remove | Promise\<any\> | Xóa (Generic) |

**Parameter:**
- `data` – Payload cấu hình gọi API.

**Exception:**
- Lỗi mạng HTTP.

**Method:**
- Gọi đến endpoints dạng `/api/admin/...`

**State:**
Không

## 3. Controllers
### 3.1. Lớp `AdminController`
- **Stereotype**: `<<Control>>`
- **Mô tả**: NestJS Controller nhận request từ Frontend.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAllCategories | Response | Gọi Service tìm danh mục |
| 2 | createCategory | Response | Gọi Service thêm danh mục |
| 3 | updateCategory | Response | Gọi Service cập nhật danh mục |
| 4 | removeCategory | Response | Gọi Service xóa danh mục |
| 5 | findAllFoods | Response | Gọi Service tìm thực phẩm |
| 6 | createFood | Response | Gọi Service thêm thực phẩm |
| 7 | updateFood | Response | Gọi Service cập nhật thực phẩm |
| 8 | removeFood | Response | Gọi Service xóa thực phẩm |
| 9 | findAllUnits | Response | Gọi Service tìm đơn vị tính |
| 10 | createUnit | Response | Gọi Service thêm đơn vị tính |
| 11 | updateUnit | Response | Gọi Service cập nhật đơn vị tính |
| 12 | removeUnit | Response | Gọi Service xóa đơn vị tính |
| 13 | findAll | Response | Gọi Service lấy DS |
| 14 | updateStatus | Response | Gọi Service duyệt trạng thái |
| 15 | getStats | Response | Gọi Service lấy thống kê |
| 16 | findOne | Response | Gọi Service tìm 1 bản ghi |
| 17 | create | Response | Gọi Service tạo mới |
| 18 | update | Response | Gọi Service cập nhật |
| 19 | remove | Response | Gọi Service xóa |

**Parameter:**
- `dto` – Tham số body/param của HTTP.

**Exception:**
- `ForbiddenException` – Yêu cầu quyền admin (Role = Admin).

**Method:**
- Điều hướng xử lý sang `AdminService`.

**State:**
Không

## 4. Services
### 4.1. Lớp `AdminService`
- **Stereotype**: `<<Control>>`
- **Mô tả**: Lớp chứa Business Logic xử lý nghiệp vụ quản trị hệ thống.

**Attribute**
Không

**Operation**
*(Tham chiếu chức năng tương tự như ở Controller, nhưng xử lý sâu tầng database và sinh trả dữ liệu `any` thay vì `Response`)*.
- `findAllCategories(data)` -> `any`
- `createCategory(data)` -> `any`
- `updateCategory(data)` -> `any`
- `removeCategory(data)` -> `any`
- `findAllFoods(data)` -> `any`
- `createFood(data)` -> `any`
- `updateFood(data)` -> `any`
- `removeFood(data)` -> `any`
- `findAllUnits(data)` -> `any`
- `createUnit(data)` -> `any`
- `updateUnit(data)` -> `any`
- `removeUnit(data)` -> `any`
- `findAll(data)` -> `any`
- `updateStatus(data)` -> `any`
- `getStats(data)` -> `any`
- `findOne(data)` -> `any`
- `create(data)` -> `any`
- `update(data)` -> `any`
- `remove(data)` -> `any`

**Parameter:**
- `data` – Payload cấu trúc đã validate.

**Exception:**
- Ngoại lệ khóa ngoại DB (ràng buộc không thể xóa).

**Method:**
- Thực hiện logic CRUD phức tạp, kiểm tra ràng buộc.

**State:**
Không

## 5. Entities
### 5.1. Lớp `CategoriesEntity`
- **Stereotype**: `<<Entity>>`
- **Mô tả**: Bảng lưu trữ danh mục hệ thống `categories`.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | category_id | INT | `null` | Khóa chính |
| 2 | name | VARCHAR | `""` | Tên danh mục |

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

### 5.2. Lớp `FoodCatalogEntity`
- **Stereotype**: `<<Entity>>`
- **Mô tả**: Bảng lưu danh sách thực phẩm chuẩn của hệ thống `food_catalog`.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | food_id | INT | `null` | Khóa chính |
| 2 | name | VARCHAR | `""` | Tên thực phẩm |
| 3 | category_id | INT | `null` | Thuộc danh mục nào |
| 4 | unit | VARCHAR | `""` | Đơn vị tính |

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
