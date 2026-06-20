# Đặc tả Lớp (Class Specification) - Module Pantry

Tài liệu mô tả chi tiết các phương thức và thuộc tính của các lớp trong Module Pantry.

## 1. Views
### 1.1. Lớp `PantryDashboard`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện Dashboard của kho thực phẩm.

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
- Hiển thị lượng thực phẩm trong kho.

**State:**
Không

### 1.2. Lớp `Scanner`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện quét mã vạch sản phẩm.

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
- Mở camera và quét barcode để thêm thực phẩm.

**State:**
Không

## 2. API Clients
### 2.1. Lớp `PantryApiClient`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Lớp gọi API bằng Axios để tương tác với Backend.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | baseUrl | String | `""` | URL gốc của backend |

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | Promise\<any\> | Lấy danh sách thực phẩm trong kho |
| 2 | create | Promise\<any\> | Thêm thực phẩm mới vào kho |
| 3 | findOne | Promise\<any\> | Xem chi tiết thực phẩm |
| 4 | update | Promise\<any\> | Cập nhật số lượng/thông tin |
| 5 | remove | Promise\<any\> | Xóa thực phẩm khỏi kho |
| 6 | consume | Promise\<any\> | Ghi nhận đã tiêu thụ thực phẩm |
| 7 | markWasted | Promise\<any\> | Ghi nhận thực phẩm bị lãng phí/hỏng |

**Parameter:**
- `data` – Đối tượng chứa payload request

**Exception:**
- Ngoại lệ kết nối mạng

**Method:**
- Gửi các HTTP request lên API `/api/pantry`.

**State:**
Không

## 3. Controllers
### 3.1. Lớp `PantryController`
- **Stereotype**: `<<Control>>`
- **Mô tả**: NestJS Controller nhận request từ Frontend liên quan đến Pantry.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | Response | Nhận request lấy kho |
| 2 | create | Response | Nhận request thêm đồ |
| 3 | findOne | Response | Nhận request lấy chi tiết đồ |
| 4 | update | Response | Nhận request sửa đồ |
| 5 | remove | Response | Nhận request xóa đồ |
| 6 | consume | Response | Nhận request tiêu thụ |
| 7 | markWasted | Response | Nhận request đánh dấu hỏng |

**Parameter:**
- `dto` – Tham số từ request

**Exception:**
- `NotFoundException` – Nếu item không tồn tại

**Method:**
- Gọi đến `PantryService` tương ứng.

**State:**
Không

## 4. Services
### 4.1. Lớp `PantryService`
- **Stereotype**: `<<Control>>`
- **Mô tả**: Lớp chứa Business Logic quản lý thực phẩm.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | any | Logic lấy danh sách kho |
| 2 | create | any | Khởi tạo mặt hàng mới |
| 3 | findOne | any | Tìm kiếm mặt hàng |
| 4 | update | any | Sửa thông tin hạn sử dụng, số lượng... |
| 5 | remove | any | Xóa khỏi database |
| 6 | consume | any | Trừ đi số lượng khi dùng |
| 7 | markWasted | any | Chuyển trạng thái sang hỏng/lãng phí |

**Parameter:**
- `data` – Dữ liệu truyền từ Controller

**Exception:**
- Lỗi nghiệp vụ (hết số lượng để tiêu thụ...)

**Method:**
- Tương tác CRUD với `InventoryEntity`.

**State:**
Không

## 5. Entities
### 5.1. Lớp `InventoryEntity`
- **Stereotype**: `<<Entity>>`
- **Mô tả**: Đối tượng dữ liệu ánh xạ từ Database bảng `inventory`.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | inventory_id | INT | `null` | Khóa chính |
| 2 | group_id | INT | `null` | Nhóm sở hữu |
| 3 | food_id | INT | `null` | ID thực phẩm |
| 4 | quantity | DECIMAL | `0` | Số lượng |
| 5 | expiry_date | DATE | `null` | Ngày hết hạn |
| 6 | location | VARCHAR | `""` | Vị trí lưu trữ (tủ lạnh, kệ bếp...) |

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
