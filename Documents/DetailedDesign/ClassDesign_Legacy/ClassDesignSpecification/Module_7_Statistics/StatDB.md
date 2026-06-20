# Class Design Specification - StatDB

**Module:** Module_7_Statistics
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `StatDB`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| queryUsageAndWasteData | Data | Xử lý nghiệp vụ queryUsageAndWasteData. |

### 3. Method Details
**Method:** `queryUsageAndWasteData(dateRange: Data)`
- **Parameters:**
  - `dateRange` (Data): Tham số dateRange truyền vào hàm
- **Return:** `Data`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ queryUsageAndWasteData.

