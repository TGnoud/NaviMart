# Class Design Specification - MasterDataController

**Module:** Module_8_Admin
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `MasterDataController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| executeCRUD | void | Xử lý nghiệp vụ executeCRUD. |

### 3. Method Details
**Method:** `executeCRUD(action: String, data: Data)`
- **Parameters:**
  - `action` (String): Tham số action truyền vào hàm
  - `data` (Data): Tham số data truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ executeCRUD.

