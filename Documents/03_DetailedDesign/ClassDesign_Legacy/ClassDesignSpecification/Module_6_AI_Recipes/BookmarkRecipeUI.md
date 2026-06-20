# Class Design Specification - BookmarkRecipeUI

**Module:** Module_6_AI_Recipes
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `BookmarkRecipeUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| clickBookmark | void | Xử lý nghiệp vụ clickBookmark. |
| displayUpdate | void | Hiển thị dữ liệu trên giao diện. |

### 3. Method Details
**Method:** `clickBookmark()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ clickBookmark.

**Method:** `displayUpdate()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Hiển thị dữ liệu trên giao diện.

