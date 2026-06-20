# Class Design Specification - MasterDataDB

**Module:** Module_8_Admin
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `MasterDataDB`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| updateDatabase | Boolean | Cập nhật hoặc lưu trữ dữ liệu updateDatabase. |

### 3. Method Details
**Method:** `updateDatabase(action: String, data: Data)`
- **Parameters:**
  - `action` (String): Tham số action truyền vào hàm
  - `data` (Data): Tham số data truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateDatabase.

