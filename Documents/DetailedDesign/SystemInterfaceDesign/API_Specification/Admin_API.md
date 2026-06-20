# Đặc tả Giao diện Hệ thống (API Specification) - Admin

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) dành riêng cho phân hệ Quản trị viên (Admin).

---

## 1. Lấy danh mục thực phẩm (Find All Categories)
- **Method**: `GET`
- **URL**: `/api/admin/catalog/categories`
- **Description**: Lấy toàn bộ danh mục thực phẩm trên hệ thống.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters**
| Tham số (Query) | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `page` | Integer | Không | Trang hiện tại |
| `limit` | Integer | Không | Số bản ghi mỗi trang |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "data": [...], "total": 10 }` |

---

## 2. Tạo danh mục (Create Category)
- **Method**: `POST`
- **URL**: `/api/admin/catalog/categories`
- **Description**: Thêm mới một danh mục thực phẩm.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `name` | String | Có | Tên danh mục mới |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "id": 5, "name": "Đồ uống" }` |

---

## 3. Cập nhật danh mục (Update Category)
- **Method**: `PATCH`
- **URL**: `/api/admin/catalog/categories/:categoryId`
- **Description**: Đổi tên hoặc trạng thái của danh mục.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `categoryId` | Integer | Có | ID danh mục |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `name` | String | Không | Tên danh mục mới |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Category updated" }` |

---

## 4. Xóa danh mục (Remove Category)
- **Method**: `DELETE`
- **URL**: `/api/admin/catalog/categories/:categoryId`
- **Description**: Ẩn/Xóa danh mục thực phẩm.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `categoryId` | Integer | Có | ID danh mục |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Category archived" }` |

---

## 5. Lấy danh sách thực phẩm (Find All Foods)
- **Method**: `GET`
- **URL**: `/api/admin/catalog/foods`
- **Description**: Danh sách chi tiết các mặt hàng trong Catalog chuẩn.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters**
| Tham số (Query) | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `page` | Integer | Không | Trang hiện tại |
| `limit` | Integer | Không | Số bản ghi mỗi trang |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "data": [...], "total": 100 }` |

---

## 6. Tạo thực phẩm (Create Food)
- **Method**: `POST`
- **URL**: `/api/admin/catalog/foods`
- **Description**: Thêm một loại thực phẩm chuẩn vào Catalog để người dùng sử dụng.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `name` | String | Có | Tên thực phẩm |
| `category_id` | Integer | Có | Thuộc danh mục nào |
| `unit_id` | Integer | Có | Đơn vị tính chuẩn |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "id": 105, "message": "Food created" }` |

---

## 7. Cập nhật thực phẩm (Update Food)
- **Method**: `PATCH`
- **URL**: `/api/admin/catalog/foods/:foodId`
- **Description**: Thay đổi thông tin của thực phẩm chuẩn trong Catalog.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `foodId` | Integer | Có | ID thực phẩm |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `name` | String | Không | Tên mới |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Food updated" }` |

---

## 8. Xóa thực phẩm (Remove Food)
- **Method**: `DELETE`
- **URL**: `/api/admin/catalog/foods/:foodId`
- **Description**: Xóa/Ẩn thực phẩm khỏi Catalog.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `foodId` | Integer | Có | ID thực phẩm |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Food archived" }` |

---

## 9. Lấy DS Đơn vị tính (Find All Units)
- **Method**: `GET`
- **URL**: `/api/admin/catalog/units`
- **Description**: Lấy danh sách các đơn vị tính chuẩn (kg, gram, quả, chai...).
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters**
Không yêu cầu tham số.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `[{ "id": 1, "name": "kilogram" }]` |

---

## 10. Tạo đơn vị tính (Create Unit)
- **Method**: `POST`
- **URL**: `/api/admin/catalog/units`
- **Description**: Thêm đơn vị đo lường mới vào hệ thống.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `name` | String | Có | Tên đơn vị (vd: Liter) |
| `symbol` | String | Có | Ký hiệu (vd: L) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "id": 3, "message": "Unit created" }` |

---

## 11. Cập nhật đơn vị tính (Update Unit)
- **Method**: `PATCH`
- **URL**: `/api/admin/catalog/units/:unitId`
- **Description**: Chỉnh sửa đơn vị tính.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `unitId` | Integer | Có | ID đơn vị |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `name` | String | Không | Tên mới |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Unit updated" }` |

---

## 12. Xóa đơn vị tính (Remove Unit)
- **Method**: `DELETE`
- **URL**: `/api/admin/catalog/units/:unitId`
- **Description**: Ẩn đơn vị tính khỏi hệ thống.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `unitId` | Integer | Có | ID đơn vị |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Unit archived" }` |

---

## 13. Danh sách kiểm duyệt Công thức (Find All Recipes)
- **Method**: `GET`
- **URL**: `/api/admin/recipes`
- **Description**: Lấy danh sách các công thức do người dùng đóng góp để Admin kiểm duyệt.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Query)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `status` | String | Không | Lọc theo trạng thái (`pending`, `approved`, `rejected`) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "data": [...], "total": 5 }` |

---

## 14. Phê duyệt công thức (Update Recipe Status)
- **Method**: `PATCH`
- **URL**: `/api/admin/recipes/:recipeId/status`
- **Description**: Duyệt (Approve) hoặc Từ chối (Reject) bài đăng công thức của người dùng.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `recipeId` | Integer | Có | ID công thức |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `status` | String | Có | Trạng thái mới (`approved`, `rejected`) |
| `reason` | String | Không | Lý do từ chối (nếu có) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Status updated successfully" }` |

---

## 15. Lấy thống kê hệ thống (Get Stats)
- **Method**: `GET`
- **URL**: `/api/admin/stats`
- **Description**: Lấy số liệu chung để hiển thị trên Admin Dashboard.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters**
Không yêu cầu tham số.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "total_users": 1500, "total_recipes": 350, "active_families": 400 }` |

---

## 16. Lấy danh sách người dùng (Find All Users)
- **Method**: `GET`
- **URL**: `/api/admin/users`
- **Description**: Phân trang danh sách người dùng đăng ký trên hệ thống.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Query)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `search` | String | Không | Tìm kiếm theo email hoặc tên |
| `page` | Integer | Không | Trang hiện tại |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "data": [...], "total": 1500 }` |

---

## 17. Xem chi tiết người dùng (Find One User)
- **Method**: `GET`
- **URL**: `/api/admin/users/:userId`
- **Description**: Xem thông tin cá nhân và lịch sử hoạt động của người dùng.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `userId` | Integer | Có | ID người dùng |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "id": 1, "email": "user@email.com", "is_active": true }` |

---

## 18. Tạo người dùng mới (Create User)
- **Method**: `POST`
- **URL**: `/api/admin/users`
- **Description**: Admin cấp phát hoặc tạo tài khoản thủ công cho nhân viên/quản trị viên mới.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `email` | String | Có | Địa chỉ email |
| `password` | String | Có | Mật khẩu khởi tạo |
| `role` | String | Có | Phân quyền (`admin`, `user`) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "message": "User created", "user_id": 200 }` |

---

## 19. Cập nhật người dùng (Update User)
- **Method**: `PATCH`
- **URL**: `/api/admin/users/:userId`
- **Description**: Sửa thông tin hoặc phân quyền của người dùng.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `userId` | Integer | Có | ID người dùng |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `role` | String | Không | Quyền mới |
| `is_active` | Boolean | Không | Khóa/Mở khóa tài khoản |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "User updated successfully" }` |

---

## 20. Xóa/Khóa người dùng (Remove User)
- **Method**: `DELETE`
- **URL**: `/api/admin/users/:userId`
- **Description**: Xóa mềm (Soft Delete) hoặc vô hiệu hóa tài khoản vi phạm.
- **Yêu cầu quyền**: Quản trị viên hệ thống (Admin).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `userId` | Integer | Có | ID người dùng |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "User deactivated" }` |
