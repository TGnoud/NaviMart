# Class Design Specification - RecipeDB

**Module:** Module_8_Admin
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `RecipeDB`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| title | String | "" | Tên công thức |
| ingredients | List<String> | [] | Danh sách nguyên liệu |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| queryPending | List | Xử lý nghiệp vụ queryPending. |
| updateRecipeStatus | Boolean | Cập nhật hoặc lưu trữ dữ liệu updateRecipeStatus. |

### 3. Method Details
**Method:** `queryPending()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `List`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ queryPending.

**Method:** `updateRecipeStatus(recipeId: String, status: String)`
- **Parameters:**
  - `recipeId` (String): Tham số recipeId truyền vào hàm
  - `status` (String): Tham số status truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateRecipeStatus.

