# Class Design Specification - PantryController

**Module:** Module_3_ShoppingList
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
| transferItemToPantry | void | Xử lý nghiệp vụ transferItemToPantry. |

### 3. Method Details
**Method:** `transferItemToPantry(itemDetails: Data)`
- **Parameters:**
  - `itemDetails` (Data): Tham số itemDetails truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ transferItemToPantry.

