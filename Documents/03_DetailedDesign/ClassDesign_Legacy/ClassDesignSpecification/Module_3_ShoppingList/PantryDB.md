# Class Design Specification - PantryDB

**Module:** Module_3_ShoppingList
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `PantryDB`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| itemName | String | "" | Tên thực phẩm/mặt hàng |
| quantity | Float | 0.0 | Số lượng |
| expiryDate | DateTime | null | Ngày hết hạn |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| addFood | Boolean | Xử lý nghiệp vụ addFood. |

### 3. Method Details
**Method:** `addFood(itemDetails: Data)`
- **Parameters:**
  - `itemDetails` (Data): Tham số itemDetails truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ addFood.

