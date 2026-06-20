# Class Design Specification - MissingIngredientUI

**Module:** Module_6_AI_Recipes
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `MissingIngredientUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| clickAddMissing | void | Xử lý nghiệp vụ clickAddMissing. |
| displaySuccess | void | Hiển thị dữ liệu trên giao diện. |

### 3. Method Details
**Method:** `clickAddMissing()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ clickAddMissing.

**Method:** `displaySuccess()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Hiển thị dữ liệu trên giao diện.

