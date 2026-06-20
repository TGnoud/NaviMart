# Class Design Specification - ShoppingDB

**Module:** Module_3_ShoppingList
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ShoppingDB`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| listName | String | "" | Tên danh sách |
| status | String | "PENDING" | Trạng thái danh sách |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| saveNewList | String | Cập nhật hoặc lưu trữ dữ liệu saveNewList. |
| executeDbQuery | Boolean | Xử lý nghiệp vụ executeDbQuery. |
| saveItem | String | Cập nhật hoặc lưu trữ dữ liệu saveItem. |
| executeItemDbAction | Boolean | Xử lý nghiệp vụ executeItemDbAction. |
| updateItemStatus | Boolean | Cập nhật hoặc lưu trữ dữ liệu updateItemStatus. |

### 3. Method Details
**Method:** `saveNewList(listName: String, groupId: String)`
- **Parameters:**
  - `listName` (String): Tham số listName truyền vào hàm
  - `groupId` (String): Tham số groupId truyền vào hàm
- **Return:** `String`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu saveNewList.

**Method:** `executeDbQuery(action: String, listId: String, data: Data)`
- **Parameters:**
  - `action` (String): Tham số action truyền vào hàm
  - `listId` (String): Tham số listId truyền vào hàm
  - `data` (Data): Tham số data truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ executeDbQuery.

**Method:** `saveItem(listId: String, itemName: String, quantity: Number)`
- **Parameters:**
  - `listId` (String): Tham số listId truyền vào hàm
  - `itemName` (String): Tham số itemName truyền vào hàm
  - `quantity` (Number): Tham số quantity truyền vào hàm
- **Return:** `String`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu saveItem.

**Method:** `executeItemDbAction(action: String, itemId: String, data: Data)`
- **Parameters:**
  - `action` (String): Tham số action truyền vào hàm
  - `itemId` (String): Tham số itemId truyền vào hàm
  - `data` (Data): Tham số data truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ executeItemDbAction.

**Method:** `updateItemStatus(itemId: String, status: String)`
- **Parameters:**
  - `itemId` (String): Tham số itemId truyền vào hàm
  - `status` (String): Tham số status truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateItemStatus.

