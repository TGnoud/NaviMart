# Đặc tả Giao diện Hệ thống (API Specification) - Health

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ kiểm tra sức khỏe hệ thống (Health Check).

---

## 1. Kiểm tra trạng thái hệ thống (Get Health)
- **Method**: `GET`
- **URL**: `/api/health`
- **Description**: Endpoint dùng để kiểm tra dịch vụ Backend có đang hoạt động bình thường hay không. Thường dùng cho các hệ thống Load Balancer hoặc giám sát (Monitoring).
- **Yêu cầu quyền**: Không yêu cầu (Public).

**Request Parameters**
Không yêu cầu tham số.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "status": "ok", "timestamp": "2026-06-12T14:30:00Z" }` |
| **500 Internal Server Error**| Hệ thống lỗi | `{ "status": "error", "message": "Database connection failed" }` |
