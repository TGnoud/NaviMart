# Đặc tả Giao diện Hệ thống (API Specification) - Notifications

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ Thông báo (Notifications).

---

## 1. Lấy danh sách thông báo (Find All)
- **Method**: `GET`
- **URL**: `/api/notifications`
- **Description**: Lấy danh sách thông báo của người dùng hiện tại, sắp xếp theo thời gian mới nhất.
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Parameters**
| Tham số (Query) | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `page` | Integer | Không | Trang hiện tại (Mặc định: 1) |
| `limit` | Integer | Không | Số lượng mỗi trang (Mặc định: 20) |
| `unread_only` | Boolean | Không | Chỉ lấy thông báo chưa đọc |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "data": [{ "id": 1, "message": "Thực phẩm sắp hết hạn", "is_read": false }], "total": 1 }` |
| **401 Unauthorized**| Chưa đăng nhập | `{ "error": "Unauthorized" }` |

---

## 2. Đánh dấu đã đọc một thông báo (Mark As Read)
- **Method**: `PATCH`
- **URL**: `/api/notifications/:notificationId/read`
- **Description**: Đánh dấu một thông báo cụ thể là đã đọc.
- **Yêu cầu quyền**: Người dùng đã đăng nhập và là chủ sở hữu của thông báo (User).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `notificationId`| Integer | Có | ID của thông báo |

**Request Body**
Không yêu cầu payload.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Notification marked as read" }` |
| **404 Not Found** | Không tìm thấy | `{ "error": "Not Found", "message": "Notification not found" }` |

---

## 3. Đánh dấu đã đọc tất cả (Mark All As Read)
- **Method**: `PATCH`
- **URL**: `/api/notifications/read-all`
- **Description**: Đánh dấu tất cả thông báo chưa đọc của người dùng thành đã đọc.
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Parameters**
Không yêu cầu tham số.

**Request Body**
Không yêu cầu payload.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "All notifications marked as read", "updated_count": 5 }` |
