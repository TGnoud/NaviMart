# Đặc tả Giao diện Hệ thống (API Specification) - Auth Module

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ Xác thực (Authentication). Các API này được thiết kế theo chuẩn RESTful để Frontend và các hệ thống bên ngoài có thể tương tác.

---

## 1. Đăng ký tài khoản (Register)
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Description**: Khởi tạo tài khoản người dùng mới trong hệ thống.

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `email` | String | Có | Địa chỉ email của người dùng (phải hợp lệ) |
| `password` | String | Có | Mật khẩu (ít nhất 6 ký tự) |
| `first_name`| String | Có | Tên người dùng |
| `last_name` | String | Có | Họ người dùng |
| `phone` | String | Không | Số điện thoại liên hệ |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "message": "User created successfully", "user_id": 123 }` |
| **400 Bad Request** | Lỗi validate dữ liệu | `{ "error": "Bad Request", "message": ["email must be an email", ...] }` |
| **409 Conflict** | Email đã tồn tại | `{ "error": "Conflict", "message": "Email already exists" }` |

---

## 2. Đăng nhập (Login)
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Description**: Xác thực người dùng và cấp phát Access Token (JWT).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `email` | String | Có | Địa chỉ email đăng nhập |
| `password` | String | Có | Mật khẩu đăng nhập |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "access_token": "eyJhb...", "refresh_token": "def456...", "user": { "id": 1, "email": "..." } }` |
| **401 Unauthorized**| Sai thông tin | `{ "error": "Unauthorized", "message": "Invalid email or password" }` |

---

## 3. Làm mới Token (Refresh Token)
- **Method**: `POST`
- **URL**: `/api/auth/refresh`
- **Description**: Cấp lại Access Token mới khi token cũ hết hạn dựa trên Refresh Token.

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `refresh_token`| String | Có | Token làm mới phiên bản hợp lệ |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "access_token": "eyJhb...", "refresh_token": "new_def456..." }` |
| **401 Unauthorized**| Token không hợp lệ | `{ "error": "Unauthorized", "message": "Refresh token expired or invalid" }` |

---

## 4. Đăng xuất (Logout)
- **Method**: `POST`
- **URL**: `/api/auth/logout`
- **Description**: Thu hồi Refresh Token, kết thúc phiên làm việc của người dùng.
- **Headers**: Bắt buộc có `Authorization: Bearer <access_token>`

**Request Body**
Không yêu cầu payload.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Successfully logged out" }` |
| **401 Unauthorized**| Không có token | `{ "error": "Unauthorized" }` |

---

## 5. Quên mật khẩu (Forgot Password)
- **Method**: `POST`
- **URL**: `/api/auth/forgot-password`
- **Description**: Yêu cầu hệ thống gửi email chứa liên kết/OTP để khôi phục mật khẩu.

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `email` | String | Có | Email tài khoản cần khôi phục |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Password reset email sent" }` |
| **404 Not Found** | Không tìm thấy | `{ "error": "Not Found", "message": "User with this email does not exist" }` |

---

## 6. Đặt lại mật khẩu (Reset Password)
- **Method**: `POST`
- **URL**: `/api/auth/reset-password`
- **Description**: Đặt lại mật khẩu mới thông qua token khôi phục được gửi qua email.

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `token` | String | Có | Mã xác thực khôi phục mật khẩu |
| `new_password` | String | Có | Mật khẩu mới |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Password has been successfully reset" }` |
| **400 Bad Request** | Lỗi dữ liệu | `{ "error": "Bad Request", "message": "Token expired or invalid" }` |

---

## 7. Gửi lại mã xác thực Email (Send Verification)
- **Method**: `POST`
- **URL**: `/api/auth/send-verification`
- **Description**: Gửi lại mã OTP hoặc liên kết để xác thực địa chỉ email.
- **Headers**: Bắt buộc có `Authorization: Bearer <access_token>`

**Request Body**
Không yêu cầu payload.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Verification email sent" }` |

---

## 8. Xác thực Email (Verify Email)
- **Method**: `POST`
- **URL**: `/api/auth/verify-email`
- **Description**: Xác thực tài khoản người dùng bằng token nhận được từ email.

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `token` | String | Có | Mã token xác thực email |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Email verified successfully" }` |
| **400 Bad Request** | Sai mã | `{ "error": "Bad Request", "message": "Invalid or expired verification token" }` |
