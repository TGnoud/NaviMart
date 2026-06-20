# Đặc tả Giao diện Hệ thống Ngoại vi (External Services Specification)

Tài liệu này mô tả chi tiết giao diện giao tiếp (Required Interfaces) giữa hệ thống NaviMart và các dịch vụ cung cấp bởi bên thứ ba (Third-party APIs). Đây là các hệ thống bên ngoài nằm ngoài ranh giới kiểm soát trực tiếp của ứng dụng.

---

## 1. Dịch vụ Gửi Email (Email SMTP Service)
Hệ thống sử dụng dịch vụ của bên thứ 3 (ví dụ: SendGrid hoặc AWS SES) để gửi email xác thực OTP hoặc thông báo tự động. Dưới đây là đặc tả mẫu tương tác với SendGrid API.

- **Interface Lớp**: `EmailServiceInterface`
- **Method**: `POST`
- **URL**: `https://api.sendgrid.com/v3/mail/send`
- **Authentication**: Gửi kèm Header `Authorization: Bearer <SENDGRID_API_KEY>`

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `personalizations` | Array | Có | Mảng chứa thông tin người nhận (`to` email) |
| `from` | Object | Có | Địa chỉ email người gửi đã xác thực (`email`, `name`) |
| `subject` | String | Có | Tiêu đề của Email |
| `content` | Array | Có | Nội dung email (Type: `text/html`, Value: `...`) |

**Responses (Từ External Service)**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về |
| :--- | :--- | :--- |
| **202 Accepted** | Gửi thành công | *(Không trả về body, hệ thống ghi nhận thành công)* |
| **401 Unauthorized**| Sai API Key | `{"errors": [{"message": "The provided authorization grant is invalid..."}]}` |

---

## 2. Dịch vụ Xác thực Mạng xã hội (OAuth 2.0)
Hệ thống kết nối với Google API để xác thực và lấy thông tin cơ bản của người dùng sau khi họ đăng nhập qua tài khoản Google ở phía Frontend.

- **Interface Lớp**: `OAuthProviderInterface`
- **Method**: `GET`
- **URL**: `https://www.googleapis.com/oauth2/v3/userinfo`
- **Authentication**: Gửi kèm Header `Authorization: Bearer <GOOGLE_ACCESS_TOKEN>` (Token do Frontend gửi lên)

**Request Parameters**
Không yêu cầu (Xác thực qua Header).

**Responses (Từ External Service)**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Token hợp lệ | `{ "sub": "12345", "name": "Nguyễn Văn A", "given_name": "A", "picture": "https://...", "email": "a@gmail.com", "email_verified": true }` |
| **401 Unauthorized**| Token sai/hết hạn | `{ "error": "invalid_request", "error_description": "Invalid Credentials" }` |

---

## 3. Dịch vụ AI Gợi ý Món ăn (AI Recipe Engine)
Hệ thống giao tiếp với OpenAI API để sinh ra các công thức nấu ăn hoặc gợi ý xử lý nguyên liệu tự động.

- **Interface Lớp**: `AIProviderInterface`
- **Method**: `POST`
- **URL**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: Gửi kèm Header `Authorization: Bearer <OPENAI_API_KEY>`

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `model` | String | Có | Tên mô hình (vd: `gpt-4o`, `gpt-3.5-turbo`) |
| `messages` | Array | Có | Ngữ cảnh hội thoại (Role `system`/`user`/`assistant` và `content`) |
| `temperature` | Decimal | Không | Mức độ sáng tạo của câu trả lời (0.0 đến 2.0) |

**Responses (Từ External Service)**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Sinh text thành công | `{ "id": "chatcmpl-123", "choices": [{ "message": { "role": "assistant", "content": "Món gợi ý là..." } }] }` |
| **429 Too Many Requests**| Quá giới hạn API | `{ "error": { "message": "Rate limit reached for requests", "type": "requests" } }` |
