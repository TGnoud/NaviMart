# Class Design Specification - UserDB

**Module:** Module_8_Admin
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `UserDB`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| email | String | "" | Địa chỉ email liên hệ |
| passwordHash | String | "" | Mật khẩu đã mã hóa |
| fullName | String | "" | Họ và tên đầy đủ |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| queryAllUsers | List | Xử lý nghiệp vụ queryAllUsers. |
| updateUserStatus | Boolean | Cập nhật hoặc lưu trữ dữ liệu updateUserStatus. |

### 3. Method Details
**Method:** `queryAllUsers(filters: Data)`
- **Parameters:**
  - `filters` (Data): Tham số filters truyền vào hàm
- **Return:** `List`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ queryAllUsers.

**Method:** `updateUserStatus(userId: String, newStatus: String)`
- **Parameters:**
  - `userId` (String): Tham số userId truyền vào hàm
  - `newStatus` (String): Tham số newStatus truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateUserStatus.

