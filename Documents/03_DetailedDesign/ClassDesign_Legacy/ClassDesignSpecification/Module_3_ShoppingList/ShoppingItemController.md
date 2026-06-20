# Class Design Specification - ShoppingItemController

**Module:** Module_3_ShoppingList
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ShoppingItemController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| addItem | void | Xử lý nghiệp vụ addItem. |
| updateOrRemoveItem | void | Cập nhật hoặc lưu trữ dữ liệu updateOrRemoveItem. |
| markItemAsBought | void | Xử lý nghiệp vụ markItemAsBought. |

### 3. Method Details
**Method:** `addItem(listId: String, itemName: String, quantity: Number)`
- **Parameters:**
  - `listId` (String): Tham số listId truyền vào hàm
  - `itemName` (String): Tham số itemName truyền vào hàm
  - `quantity` (Number): Tham số quantity truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ addItem.

**Method:** `updateOrRemoveItem(action: String, itemId: String, data: Data)`
- **Parameters:**
  - `action` (String): Tham số action truyền vào hàm
  - `itemId` (String): Tham số itemId truyền vào hàm
  - `data` (Data): Tham số data truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateOrRemoveItem.

**Method:** `markItemAsBought(itemId: String)`
- **Parameters:**
  - `itemId` (String): Tham số itemId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ markItemAsBought.

