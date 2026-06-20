# Đặc tả Giao diện Hệ thống (API Specification) - Family

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ Quản lý Gia đình (Family).

---

## 1. Lấy thông tin gia đình hiện tại (Get Current Family)
- **Method**: `GET`
- **URL**: `/api/family`
- **Description**: Lấy thông tin của gia đình mà người dùng đang tham gia (bao gồm danh sách thành viên).
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Parameters**
Không yêu cầu tham số.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "id": 1, "name": "Gia đình John", "members": [...] }` |
| **404 Not Found** | Chưa có gia đình | `{ "error": "Not Found", "message": "User does not belong to any family" }` |

---

## 2. Tạo gia đình mới (Create Family)
- **Method**: `POST`
- **URL**: `/api/family`
- **Description**: Tạo một gia đình mới và gán người dùng hiện tại làm Chủ gia đình (Owner/Admin).
- **Yêu cầu quyền**: Người dùng đã đăng nhập và chưa tham gia gia đình nào (User).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `name` | String | Có | Tên của gia đình (VD: Nhà của John) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "id": 1, "name": "Nhà của John", "role": "admin" }` |
| **400 Bad Request** | Đã có gia đình | `{ "error": "Bad Request", "message": "User already in a family" }` |

---

## 3. Tạo mã mời tham gia (Create Invite)
- **Method**: `POST`
- **URL**: `/api/family/invite`
- **Description**: Tạo một mã mời (Invite Code) hoặc Link mời để thêm thành viên mới vào gia đình.
- **Yêu cầu quyền**: Quản trị viên của gia đình (Family Admin).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `expires_in_hours` | Integer | Không | Thời gian hết hạn của mã mời (Mặc định 24h) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "invite_code": "ABC123XYZ", "expires_at": "2026-06-13T..." }` |
| **403 Forbidden** | Không có quyền | `{ "error": "Forbidden", "message": "Only admins can invite" }` |

---

## 4. Tham gia gia đình (Join Family)
- **Method**: `POST`
- **URL**: `/api/family/join`
- **Description**: Người dùng tham gia vào một gia đình thông qua mã mời.
- **Yêu cầu quyền**: Người dùng đã đăng nhập và chưa tham gia gia đình nào (User).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `invite_code` | String | Có | Mã mời hợp lệ |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Joined family successfully", "family": {...} }` |
| **400 Bad Request** | Mã không hợp lệ | `{ "error": "Bad Request", "message": "Invalid or expired invite code" }` |

---

## 5. Cập nhật quyền thành viên (Update Member Permissions)
- **Method**: `PATCH`
- **URL**: `/api/family/members/:memberId/permissions`
- **Description**: Thay đổi vai trò (Role) hoặc quyền của một thành viên trong gia đình.
- **Yêu cầu quyền**: Quản trị viên của gia đình (Family Admin).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `memberId` | Integer | Có | ID của thành viên cần cập nhật |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `role` | String | Có | Vai trò mới (Ví dụ: `admin`, `member`) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Permissions updated successfully" }` |
| **403 Forbidden** | Không có quyền | `{ "error": "Forbidden", "message": "Cannot modify owner role" }` |

---

## 6. Xóa thành viên khỏi gia đình (Remove Member)
- **Method**: `DELETE`
- **URL**: `/api/family/members/:memberId`
- **Description**: Đuổi một thành viên khỏi gia đình hoặc tự rời khỏi gia đình (Rời nhóm).
- **Yêu cầu quyền**: Quản trị viên gia đình (để đuổi người khác) hoặc Chính thành viên đó (để tự rời đi).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `memberId` | Integer | Có | ID của thành viên cần xóa |

**Request Body**
Không yêu cầu payload.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Member removed successfully" }` |
| **403 Forbidden** | Không có quyền | `{ "error": "Forbidden" }` |
