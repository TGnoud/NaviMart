# Class Design Specification - ShoppingDB

**Module:** Module_6_AI_Recipes
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ShoppingDB`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| listName | String | "" | Tên danh sách |
| status | String | "PENDING" | Trạng thái danh sách |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| saveItems | Boolean | Cập nhật hoặc lưu trữ dữ liệu saveItems. |

### 3. Method Details
**Method:** `saveItems()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu saveItems.

