# Đặc tả Giao diện Hệ thống (API Specification) - Catalog

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ Catalog (Danh mục hệ thống). Các API này được thiết kế theo chuẩn RESTful để Frontend và các hệ thống bên ngoài có thể tương tác.

---

## 1. Lấy danh sách danh mục (Find All Categories)
- **Method**: `GET`
- **URL**: `/api/catalog/categories`
- **Description**: Lấy danh sách các danh mục thực phẩm đang hoạt động.
- **Yêu cầu quyền**: Không yêu cầu (Public) hoặc Người dùng đã đăng nhập (User).

**Request Parameters**
| Tham số (Query) | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `search` | String | Không | Từ khóa tìm kiếm tên danh mục |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `[ { "id": 1, "name": "Thịt/Hải sản" }, { "id": 2, "name": "Rau củ" } ]` |

---

## 2. Lấy danh sách thực phẩm (Find All Foods)
- **Method**: `GET`
- **URL**: `/api/catalog/foods`
- **Description**: Lấy danh sách các loại thực phẩm chuẩn từ hệ thống.
- **Yêu cầu quyền**: Không yêu cầu (Public) hoặc Người dùng đã đăng nhập (User).

**Request Parameters**
| Tham số (Query) | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `category_id` | Integer | Không | Lọc thực phẩm theo danh mục |
| `search` | String | Không | Từ khóa tìm kiếm tên thực phẩm |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `[ { "id": 10, "name": "Thịt lợn", "category_id": 1, "default_unit": "kg" } ]` |

---

## 3. Lấy danh sách đơn vị tính (Find All Units)
- **Method**: `GET`
- **URL**: `/api/catalog/units`
- **Description**: Lấy danh sách các đơn vị tính được hỗ trợ (kg, gram, quả, chai...).
- **Yêu cầu quyền**: Không yêu cầu (Public) hoặc Người dùng đã đăng nhập (User).

**Request Parameters**
Không yêu cầu tham số.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `[ { "id": 1, "name": "kg", "symbol": "kg" }, { "id": 2, "name": "gram", "symbol": "g" } ]` |
