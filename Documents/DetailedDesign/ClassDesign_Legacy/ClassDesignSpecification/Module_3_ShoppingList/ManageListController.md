# Class Design Specification - ManageListController

**Module:** Module_3_ShoppingList
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ManageListController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| handleListAction | void | Xử lý nghiệp vụ handleListAction. |

### 3. Method Details
**Method:** `handleListAction(action: String, listId: String, data: Data)`
- **Parameters:**
  - `action` (String): Tham số action truyền vào hàm
  - `listId` (String): Tham số listId truyền vào hàm
  - `data` (Data): Tham số data truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ handleListAction.

