# Class Design Specification - PantryController

**Module:** Module_4_Pantry
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `PantryController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| deductIngredients | void | Xử lý nghiệp vụ deductIngredients. |

### 3. Method Details
**Method:** `deductIngredients(ingredients: List)`
- **Parameters:**
  - `ingredients` (List): Tham số ingredients truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ deductIngredients.

