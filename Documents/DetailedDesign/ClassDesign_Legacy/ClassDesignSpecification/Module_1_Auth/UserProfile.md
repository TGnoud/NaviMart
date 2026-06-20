# Class Design Specification - UserProfile

**Module:** Module_1_Auth
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `UserProfile`.

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
| save | void | Cập nhật hoặc lưu trữ dữ liệu save. |

### 3. Method Details
**Method:** `save(data: String)`
- **Parameters:**
  - `data` (String): Tham số data truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu save.

