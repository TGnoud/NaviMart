# Class Design Specification - MarkItemBoughtUI

**Module:** Module_3_ShoppingList
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `MarkItemBoughtUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| checkItemAsBought | void | Xử lý nghiệp vụ checkItemAsBought. |
| displayUpdate | void | Hiển thị dữ liệu trên giao diện. |

### 3. Method Details
**Method:** `checkItemAsBought()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ checkItemAsBought.

**Method:** `displayUpdate()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Hiển thị dữ liệu trên giao diện.

