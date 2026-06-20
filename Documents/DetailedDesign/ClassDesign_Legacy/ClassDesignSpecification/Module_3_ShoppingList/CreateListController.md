# Class Design Specification - CreateListController

**Module:** Module_3_ShoppingList
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `CreateListController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| createList | void | Xử lý nghiệp vụ createList. |

### 3. Method Details
**Method:** `createList(listName: String, groupId: String)`
- **Parameters:**
  - `listName` (String): Tham số listName truyền vào hàm
  - `groupId` (String): Tham số groupId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ createList.

