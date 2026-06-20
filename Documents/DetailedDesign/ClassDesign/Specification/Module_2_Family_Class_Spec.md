# Đặc tả Lớp (Class Specification) - Module Family

Tài liệu mô tả chi tiết các phương thức và thuộc tính của các lớp trong Module Family.

## 1. Views
### 1.1. Lớp `FamilySharing`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện hiển thị gia đình (thành viên, lời mời).

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
- Fetch danh sách thành viên và hiển thị.

**State:**
Không

### 1.2. Lớp `Profile`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện hồ sơ người dùng.

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
- Hiển thị thông tin user đang đăng nhập.

**State:**
Không

### 1.3. Lớp `EditProfile`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện chỉnh sửa hồ sơ.

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
- Chỉnh sửa và lưu thông tin người dùng.

**State:**
Không

### 1.4. Lớp `Settings`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện cài đặt ứng dụng.

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
- Cập nhật tuỳ chọn ứng dụng.

**State:**
Không

## 2. API Clients
### 2.1. Lớp `FamilyApiClient`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Lớp gọi API bằng Axios để tương tác với Backend.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | baseUrl | String | `""` | URL gốc của backend |

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | getCurrentFamily | Promise\<any\> | Lấy thông tin gia đình hiện tại |
| 2 | create | Promise\<any\> | Tạo gia đình mới |
| 3 | createInvite | Promise\<any\> | Tạo mã mời |
| 4 | join | Promise\<any\> | Tham gia nhóm gia đình |
| 5 | updateMemberPermissions | Promise\<any\> | Cập nhật quyền của thành viên |
| 6 | removeMember | Promise\<any\> | Xóa thành viên khỏi nhóm |

**Parameter:**
- `data` – Đối tượng chứa tham số cho từng request cụ thể

**Exception:**
- Ngoại lệ mạng nếu không gọi được server.

**Method:**
- Gửi HTTP requests lên `/api/family` bằng Axios.

**State:**
Không

## 3. Controllers
### 3.1. Lớp `FamilyController`
- **Stereotype**: `<<Control>>`
- **Mô tả**: NestJS Controller nhận request liên quan đến Family.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | getCurrentFamily | Response | Nhận request lấy thông tin nhóm |
| 2 | create | Response | Nhận request tạo nhóm |
| 3 | createInvite | Response | Nhận request tạo mã mời |
| 4 | join | Response | Nhận request tham gia nhóm |
| 5 | updateMemberPermissions | Response | Nhận request phân quyền |
| 6 | removeMember | Response | Nhận request xóa thành viên |

**Parameter:**
- `dto` – Tham số body/params từ request

**Exception:**
- `NotFoundException` – Không tìm thấy nhóm
- `ForbiddenException` – Không có quyền xóa thành viên

**Method:**
- Gọi đến `FamilyService` để xử lý business logic.

**State:**
Không

## 4. Services
### 4.1. Lớp `FamilyService`
- **Stereotype**: `<<Control>>`
- **Mô tả**: Lớp chứa Business Logic xử lý Family/Group.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | getCurrentFamily | any | Trả về thông tin nhóm của user |
| 2 | create | any | Khởi tạo bảng `family_groups` |
| 3 | createInvite | any | Sinh mã mời ngẫu nhiên |
| 4 | join | any | Kiểm tra mã và thêm user vào nhóm |
| 5 | updateMemberPermissions | any | Sửa quyền trong nhóm |
| 6 | removeMember | any | Cập nhật group_id của user thành null |

**Parameter:**
- `data` – Dữ liệu truyền vào từ Controller

**Exception:**
- Các lỗi vi phạm logic (mã mời hết hạn, mã sai...)

**Method:**
- CRUD qua các Entity `FamilyGroupsEntity` và `UsersEntity`.

**State:**
Không

## 5. Entities
### 5.1. Lớp `FamilyGroupsEntity`
- **Stereotype**: `<<Entity>>`
- **Mô tả**: Bảng lưu trữ thông tin gia đình `family_groups`.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | group_id | INT | `null` | Mã nhóm gia đình |
| 2 | group_name | VARCHAR | `""` | Tên nhóm |
| 3 | owner_id | INT | `null` | Người tạo nhóm |
| 4 | invite_code | VARCHAR | `""` | Mã mời |

**Operation**
Không

**Parameter:**
Không

**Exception:**
Không

**Method:**
Không

**State:**
Không

### 5.2. Lớp `UsersEntity`
- **Stereotype**: `<<Entity>>`
- **Mô tả**: Bảng thông tin người dùng `users`.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | user_id | INT | `null` | Mã người dùng |
| 2 | email | VARCHAR | `""` | Địa chỉ email |
| 3 | phone | VARCHAR | `""` | Số điện thoại |
| 4 | password_hash | VARCHAR | `""` | Chuỗi mã hóa mật khẩu |
| 5 | first_name | VARCHAR | `""` | Tên |
| 6 | last_name | VARCHAR | `""` | Họ |
| 7 | dob | DATE | `null` | Ngày sinh |
| 8 | gender | VARCHAR | `""` | Giới tính |
| 9 | role | VARCHAR | `""` | Vai trò |
| 10 | group_id | INT | `null` | Khóa ngoại chỉ đến nhóm |
| 11 | status | VARCHAR | `""` | Trạng thái |

**Operation**
Không

**Parameter:**
Không

**Exception:**
Không

**Method:**
Không

**State:**
Không
