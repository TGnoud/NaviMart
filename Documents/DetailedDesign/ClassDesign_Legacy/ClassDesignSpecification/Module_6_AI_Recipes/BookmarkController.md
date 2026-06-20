# Class Design Specification - BookmarkController

**Module:** Module_6_AI_Recipes
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `BookmarkController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| toggleBookmark | void | Xử lý nghiệp vụ toggleBookmark. |

### 3. Method Details
**Method:** `toggleBookmark(recipeId: String, userId: String)`
- **Parameters:**
  - `recipeId` (String): Tham số recipeId truyền vào hàm
  - `userId` (String): Tham số userId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ toggleBookmark.

