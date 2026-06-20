# Đặc tả Lớp (Class Specification) - Module Shopping_Lists

Tài liệu mô tả chi tiết các phương thức và thuộc tính của các lớp trong Module Shopping_Lists.

## 1. Views
### 1.1. Lớp `MyLists`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện hiển thị danh sách mua sắm.

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
- Hiển thị danh sách các danh sách mua sắm.

**State:**
Không

### 1.2. Lớp `ListDetail`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện chi tiết danh sách mua sắm.

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
- Hiển thị các item trong danh sách mua sắm cụ thể.

**State:**
Không

## 2. API Clients
### 2.1. Lớp `ShoppingListsApiClient`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Lớp gọi API bằng Axios để tương tác với Backend.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | baseUrl | String | `""` | URL gốc của backend |

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | Promise\<any\> | Lấy tất cả danh sách mua sắm |
| 2 | create | Promise\<any\> | Tạo danh sách mới |
| 3 | findOne | Promise\<any\> | Lấy chi tiết một danh sách |
| 4 | update | Promise\<any\> | Cập nhật thông tin danh sách |
| 5 | remove | Promise\<any\> | Xoá danh sách |
| 6 | complete | Promise\<any\> | Đánh dấu hoàn tất danh sách |
| 7 | addItem | Promise\<any\> | Thêm mặt hàng vào danh sách |
| 8 | updateItem | Promise\<any\> | Cập nhật mặt hàng trong danh sách |
| 9 | removeItem | Promise\<any\> | Xóa mặt hàng khỏi danh sách |

**Parameter:**
- `data` – Đối tượng chứa tham số cho từng request cụ thể

**Exception:**
- Ngoại lệ mạng nếu server lỗi.

**Method:**
- Gửi HTTP requests tương ứng lên backend.

**State:**
Không

## 3. Controllers
### 3.1. Lớp `ShoppingListsController`
- **Stereotype**: `<<Control>>`
- **Mô tả**: NestJS Controller nhận request.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | Response | Nhận request lấy danh sách |
| 2 | create | Response | Nhận request tạo danh sách |
| 3 | findOne | Response | Nhận request lấy chi tiết |
| 4 | update | Response | Nhận request cập nhật |
| 5 | remove | Response | Nhận request xóa |
| 6 | complete | Response | Nhận request hoàn tất |
| 7 | addItem | Response | Nhận request thêm item |
| 8 | updateItem | Response | Nhận request cập nhật item |
| 9 | removeItem | Response | Nhận request xóa item |

**Parameter:**
- `dto` – Tham số truyền lên từ Client

**Exception:**
- `NotFoundException` – Nếu danh sách không tồn tại

**Method:**
- Điều phối dữ liệu xuống Service xử lý.

**State:**
Không

## 4. Services
### 4.1. Lớp `ShoppingListsService`
- **Stereotype**: `<<Control>>`
- **Mô tả**: Lớp chứa Business Logic chính.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | any | Xử lý lấy danh sách |
| 2 | create | any | Thêm mới bản ghi vào Database |
| 3 | findOne | any | Lấy chi tiết bản ghi |
| 4 | update | any | Sửa thông tin bản ghi |
| 5 | remove | any | Xoá bản ghi |
| 6 | complete | any | Sửa đổi trạng thái hoàn tất |
| 7 | addItem | any | Thêm mới item vào danh sách |
| 8 | updateItem | any | Cập nhật số lượng item |
| 9 | removeItem | any | Xóa item khỏi danh sách |

**Parameter:**
- `data` – Tham số payload từ Controller truyền sang

**Exception:**
- Các exception logic nghiệp vụ.

**Method:**
- Thực hiện logic CRUD qua Entity.

**State:**
Không

## 5. Entities
### 5.1. Lớp `ShoppingListsEntity`
- **Stereotype**: `<<Entity>>`
- **Mô tả**: Ánh xạ từ DB bảng `shopping_lists`.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | list_id | INT | `null` | Khóa chính |
| 2 | group_id | INT | `null` | Khóa ngoại tới nhóm |
| 3 | name | VARCHAR | `""` | Tên danh sách |
| 4 | created_at | DATETIME | `null` | Ngày tạo |
| 5 | type | VARCHAR | `""` | Loại danh sách |

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

### 5.2. Lớp `ShoppingListItemsEntity`
- **Stereotype**: `<<Entity>>`
- **Mô tả**: Ánh xạ từ DB bảng `shopping_list_items`.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | item_id | INT | `null` | Khóa chính item |
| 2 | list_id | INT | `null` | Thuộc danh sách nào |
| 3 | food_id | INT | `null` | ID món ăn/thực phẩm |
| 4 | quantity | DECIMAL | `0` | Số lượng |
| 5 | status | VARCHAR | `""` | Trạng thái (Checked/Unchecked) |

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
