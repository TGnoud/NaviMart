# Đặc tả Giao diện Hệ thống (API Specification) - AI Chef

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ AI Chef. Các API này được thiết kế theo chuẩn RESTful để Frontend và các hệ thống bên ngoài có thể tương tác.

---

## 1. Lấy trạng thái AI Chef (Get Status)
- **Method**: `GET`
- **URL**: `/api/ai-chef/status`
- **Description**: Kiểm tra xem tính năng AI Chef đã được cấu hình và sẵn sàng hoạt động hay chưa.
- **Yêu cầu quyền**: Bất kỳ người dùng nào đã đăng nhập (User).

**Request Parameters**
Không yêu cầu tham số.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "configured": true, "provider": "OpenAI" }` |
| **401 Unauthorized**| Chưa đăng nhập | `{ "error": "Unauthorized" }` |

---

## 2. Giao tiếp với AI (Chat)
- **Method**: `POST`
- **URL**: `/api/ai-chef/chat`
- **Description**: Gửi tin nhắn hoặc yêu cầu gợi ý món ăn đến AI Chef và nhận phản hồi.
- **Yêu cầu quyền**: Bất kỳ người dùng nào đã đăng nhập (User).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `message` | String | Có | Nội dung tin nhắn người dùng gửi cho AI |
| `context` | Object | Không | Thông tin ngữ cảnh (như các nguyên liệu hiện có trong tủ lạnh) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "reply": "Bạn có thể nấu món Thịt kho tàu...", "suggestions": [...] }` |
| **400 Bad Request** | Thiếu tin nhắn | `{ "error": "Bad Request", "message": "message must be a string" }` |
| **503 Service Unavailable**| AI Server lỗi | `{ "error": "Service Unavailable", "message": "AI Provider is down" }` |
