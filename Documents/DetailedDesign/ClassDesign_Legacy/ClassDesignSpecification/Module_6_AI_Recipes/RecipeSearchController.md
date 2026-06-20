# Class Design Specification - RecipeSearchController

**Module:** Module_6_AI_Recipes
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `RecipeSearchController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| searchRecipes | void | Xử lý nghiệp vụ searchRecipes. |
| getRecipeDetail | void | Lấy dữ liệu cho getRecipeDetail. |

### 3. Method Details
**Method:** `searchRecipes(keyword: String)`
- **Parameters:**
  - `keyword` (String): Tham số keyword truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ searchRecipes.

**Method:** `getRecipeDetail(recipeId: String)`
- **Parameters:**
  - `recipeId` (String): Tham số recipeId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Lấy dữ liệu cho getRecipeDetail.

