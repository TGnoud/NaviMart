# Đặc tả Lớp (Class Specification) - Module Auth

Tài liệu mô tả chi tiết các phương thức và thuộc tính của các lớp trong Module Auth.

## 1. Views
### 1.1. Lớp `ForgotPassword`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện người dùng hiển thị trang quên mật khẩu.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | render | JSX.Element | Render giao diện HTML/CSS |

**Parameter:**
Không

**Exception:**
Không

**Method:**
- Gọi đến các component con để hiển thị giao diện.

**State:**
Không

### 1.2. Lớp `Login`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện người dùng hiển thị trang đăng nhập.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | render | JSX.Element | Render giao diện HTML/CSS |

**Parameter:**
Không

**Exception:**
Không

**Method:**
- Cập nhật state khi người dùng nhập liệu, gửi yêu cầu đăng nhập.

**State:**
Không

### 1.3. Lớp `Onboarding`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện người dùng hiển thị màn hình hướng dẫn ban đầu.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | render | JSX.Element | Render giao diện HTML/CSS |

**Parameter:**
Không

**Exception:**
Không

**Method:**
- Gọi đến các component con để hiển thị nội dung.

**State:**
Không

### 1.4. Lớp `Register`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện người dùng hiển thị trang đăng ký.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | render | JSX.Element | Render giao diện HTML/CSS |

**Parameter:**
Không

**Exception:**
Không

**Method:**
- Cập nhật state khi người dùng nhập liệu, gửi yêu cầu đăng ký.

**State:**
Không

### 1.5. Lớp `Splash`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện màn hình chờ lúc khởi động ứng dụng.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | render | JSX.Element | Render giao diện HTML/CSS |

**Parameter:**
Không

**Exception:**
Không

**Method:**
- Xử lý chuyển hướng sau khi hoàn tất hiệu ứng chờ.

**State:**
Không

## 2. API Clients
### 2.1. Lớp `AuthApiClient`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Lớp gọi API bằng Axios để tương tác với hệ thống backend bên ngoài.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | baseUrl | String | `""` | URL gốc của backend |

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | register | Promise\<any\> | Gửi HTTP POST request đăng ký |
| 2 | login | Promise\<any\> | Gửi HTTP POST request đăng nhập |
| 3 | refresh | Promise\<any\> | Gửi HTTP POST request làm mới token |
| 4 | logout | Promise\<any\> | Gửi HTTP POST request đăng xuất |
| 5 | forgotPassword | Promise\<any\> | Gửi HTTP POST request quên mật khẩu |
| 6 | resetPassword | Promise\<any\> | Gửi HTTP POST request đặt lại mật khẩu |
| 7 | sendVerification | Promise\<any\> | Gửi HTTP POST request gửi mã xác thực |
| 8 | verifyEmail | Promise\<any\> | Gửi HTTP POST request xác thực email |

**Parameter:**
- `data` – Đối tượng chứa payload tương ứng cho từng API

**Exception:**
- Bắn ra ngoại lệ mạng nếu hệ thống không phản hồi

**Method:**
- Sử dụng Axios instance để gửi request HTTP theo cấu hình `baseUrl`

**State:**
Không

## 3. Controllers
### 3.1. Lớp `AuthController`
- **Stereotype**: `<<Control>>`
- **Mô tả**: NestJS Controller nhận request từ Frontend và điều phối.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | register | Response | Gọi hàm Service xử lý đăng ký |
| 2 | login | Response | Gọi hàm Service xử lý đăng nhập |
| 3 | refresh | Response | Gọi hàm Service làm mới phiên |
| 4 | logout | Response | Gọi hàm Service đăng xuất |
| 5 | forgotPassword | Response | Gọi hàm Service quên mật khẩu |
| 6 | resetPassword | Response | Gọi hàm Service đặt lại mật khẩu |
| 7 | sendVerification | Response | Gọi hàm Service gửi lại mã |
| 8 | verifyEmail | Response | Gọi hàm Service xác thực email |

**Parameter:**
- `dto` – Dữ liệu truyền vào từ HTTP request (body/query)

**Exception:**
- `BadRequestException` – Dữ liệu không hợp lệ
- `UnauthorizedException` – Sai tài khoản mật khẩu

**Method:**
- Nhận DTO, validate và truyền xuống AuthService. Trả kết quả HTTP Response

**State:**
Không

## 4. Services
### 4.1. Lớp `AuthService`
- **Stereotype**: `<<Control>>`
- **Mô tả**: Lớp chứa Business Logic xử lý nghiệp vụ chính về Auth.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | register | any | Xử lý logic tạo tài khoản mới |
| 2 | login | any | Xác thực người dùng và cấp token |
| 3 | refresh | any | Tạo access token mới dựa vào refresh token |
| 4 | logout | any | Thu hồi token, dọn dẹp phiên |
| 5 | forgotPassword | any | Gửi token khôi phục mật khẩu |
| 6 | resetPassword | any | Cập nhật mật khẩu mới |
| 7 | sendVerification | any | Sinh mã OTP xác minh gửi qua Email |
| 8 | verifyEmail | any | Kiểm tra mã OTP khớp để đổi trạng thái tài khoản |

**Parameter:**
- `data` – Đối tượng chứa thông tin business logic để xử lý

**Exception:**
- Các ngoại lệ do vi phạm logic nghiệp vụ

**Method:**
- Thực hiện CRUD qua tầng Entity, sinh JWT Token.

**State:**
Không

## 5. Entities
### 5.1. Lớp `UsersEntity`
- **Stereotype**: `<<Entity>>`
- **Mô tả**: Đối tượng dữ liệu ánh xạ từ Database bảng `users`.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | user_id | INT | `null` | Mã người dùng (Primary Key) |
| 2 | email | VARCHAR | `""` | Địa chỉ email |
| 3 | phone | VARCHAR | `""` | Số điện thoại |
| 4 | password_hash | VARCHAR | `""` | Chuỗi mã hóa mật khẩu |
| 5 | first_name | VARCHAR | `""` | Tên |
| 6 | last_name | VARCHAR | `""` | Họ |
| 7 | dob | DATE | `null` | Ngày sinh |
| 8 | gender | VARCHAR | `""` | Giới tính |
| 9 | role | VARCHAR | `""` | Vai trò (User/Admin) |
| 10 | group_id | INT | `null` | ID nhóm |
| 11 | status | VARCHAR | `""` | Trạng thái (Active/Inactive) |

**Operation**
Không

**Parameter:**
Không

**Exception:**
Không

**Method:**
Không

**State:**
- Mới khởi tạo
- Đã lưu xuống DB
