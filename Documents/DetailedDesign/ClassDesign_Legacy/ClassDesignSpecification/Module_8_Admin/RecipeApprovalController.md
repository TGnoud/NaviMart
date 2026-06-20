# Class Design Specification - RecipeApprovalController

**Module:** Module_8_Admin
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `RecipeApprovalController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| getPendingRecipes | void | Lấy dữ liệu cho getPendingRecipes. |
| approveOrRejectRecipe | void | Xử lý nghiệp vụ approveOrRejectRecipe. |

### 3. Method Details
**Method:** `getPendingRecipes()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Lấy dữ liệu cho getPendingRecipes.

**Method:** `approveOrRejectRecipe(recipeId: String, status: String)`
- **Parameters:**
  - `recipeId` (String): Tham số recipeId truyền vào hàm
  - `status` (String): Tham số status truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ approveOrRejectRecipe.

