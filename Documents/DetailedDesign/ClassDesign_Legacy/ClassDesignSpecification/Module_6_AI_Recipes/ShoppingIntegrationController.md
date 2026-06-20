# Class Design Specification - ShoppingIntegrationController

**Module:** Module_6_AI_Recipes
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ShoppingIntegrationController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| findMissingIngredients | void | Xử lý nghiệp vụ findMissingIngredients. |

### 3. Method Details
**Method:** `findMissingIngredients(recipeIngredients: List)`
- **Parameters:**
  - `recipeIngredients` (List): Tham số recipeIngredients truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ findMissingIngredients.

