# Class Design Specification - RecipeDB

**Module:** Module_6_AI_Recipes
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
| queryRecipes | List | Xử lý nghiệp vụ queryRecipes. |
| queryRecipeById | Data | Xử lý nghiệp vụ queryRecipeById. |
| updateBookmarkStatus | Boolean | Cập nhật hoặc lưu trữ dữ liệu updateBookmarkStatus. |

### 3. Method Details
**Method:** `queryRecipes(keyword: String)`
- **Parameters:**
  - `keyword` (String): Tham số keyword truyền vào hàm
- **Return:** `List`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ queryRecipes.

**Method:** `queryRecipeById(recipeId: String)`
- **Parameters:**
  - `recipeId` (String): Tham số recipeId truyền vào hàm
- **Return:** `Data`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ queryRecipeById.

**Method:** `updateBookmarkStatus(recipeId: String, userId: String)`
- **Parameters:**
  - `recipeId` (String): Tham số recipeId truyền vào hàm
  - `userId` (String): Tham số userId truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateBookmarkStatus.

