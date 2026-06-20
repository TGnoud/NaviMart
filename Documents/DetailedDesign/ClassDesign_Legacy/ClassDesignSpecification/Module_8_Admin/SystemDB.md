# Class Design Specification - SystemDB

**Module:** Module_8_Admin
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `SystemDB`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| querySystemMetrics | Data | Xử lý nghiệp vụ querySystemMetrics. |

### 3. Method Details
**Method:** `querySystemMetrics()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `Data`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ querySystemMetrics.

