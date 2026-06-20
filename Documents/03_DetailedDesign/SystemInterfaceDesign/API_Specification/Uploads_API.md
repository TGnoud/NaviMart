# Đặc tả Giao diện Hệ thống (API Specification) - Uploads

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ Tải tệp tin (Uploads).

---

## 1. Tải lên hình ảnh (Upload Image)
- **Method**: `POST`
- **URL**: `/api/uploads/image`
- **Description**: API nhận file hình ảnh, lưu trữ (local hoặc S3) và trả về đường dẫn URL của ảnh.
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Body (FormData)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `file` | File (Binary) | Có | File ảnh (JPEG, PNG, WebP) tối đa 5MB |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "url": "https://s3.aws.com/.../image.png", "filename": "image.png" }` |
| **400 Bad Request** | Lỗi định dạng | `{ "error": "Bad Request", "message": "Invalid file type or size exceeded" }` |
