# Đặc tả Giao diện Hệ thống (API Specification) - Users

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ Người dùng (Users).

---

## 1. Lấy hồ sơ cá nhân (Get Profile)
- **Method**: `GET`
- **URL**: `/api/users/me`
- **Description**: Lấy thông tin tài khoản của người dùng hiện tại (đang đăng nhập).
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Parameters**
Không yêu cầu tham số.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "id": 1, "email": "user@email.com", "first_name": "A", "last_name": "B", "avatar_url": "..." }` |
| **401 Unauthorized**| Token không hợp lệ | `{ "error": "Unauthorized" }` |

---

## 2. Cập nhật hồ sơ cá nhân (Update Profile)
- **Method**: `PATCH`
- **URL**: `/api/users/me`
- **Description**: Thay đổi thông tin cá nhân (Tên, avatar, điện thoại...).
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `first_name` | String | Không | Tên mới |
| `last_name` | String | Không | Họ mới |
| `phone` | String | Không | Số điện thoại mới |
| `avatar_url` | String | Không | Link ảnh đại diện sau khi upload |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Profile updated successfully", "user": {...} }` |
| **400 Bad Request** | Lỗi validate | `{ "error": "Bad Request", "message": "Phone number invalid" }` |
