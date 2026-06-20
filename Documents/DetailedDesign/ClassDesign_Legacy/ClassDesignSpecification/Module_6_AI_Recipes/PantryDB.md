# Class Design Specification - PantryDB

**Module:** Module_6_AI_Recipes
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
| getAvailableIngredients | List | Lấy dữ liệu cho getAvailableIngredients. |
| checkAvailable | List | Xử lý nghiệp vụ checkAvailable. |

### 3. Method Details
**Method:** `getAvailableIngredients(userId: String)`
- **Parameters:**
  - `userId` (String): Tham số userId truyền vào hàm
- **Return:** `List`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Lấy dữ liệu cho getAvailableIngredients.

**Method:** `checkAvailable(recipeIngredients: List)`
- **Parameters:**
  - `recipeIngredients` (List): Tham số recipeIngredients truyền vào hàm
- **Return:** `List`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ checkAvailable.

