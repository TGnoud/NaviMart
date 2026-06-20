# Class Design Specification - PantrySearchController

**Module:** Module_4_Pantry
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `PantrySearchController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| searchFood | void | Xử lý nghiệp vụ searchFood. |

### 3. Method Details
**Method:** `searchFood(keyword: String, filters: Data)`
- **Parameters:**
  - `keyword` (String): Tham số keyword truyền vào hàm
  - `filters` (Data): Tham số filters truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ searchFood.

