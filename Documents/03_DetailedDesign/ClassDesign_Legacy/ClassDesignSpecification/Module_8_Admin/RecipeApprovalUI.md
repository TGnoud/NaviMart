# Class Design Specification - RecipeApprovalUI

**Module:** Module_8_Admin
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `RecipeApprovalUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| viewPendingRecipes | void | Xử lý nghiệp vụ viewPendingRecipes. |
| approveOrReject | void | Xử lý nghiệp vụ approveOrReject. |
| displayResult | void | Hiển thị dữ liệu trên giao diện. |

### 3. Method Details
**Method:** `viewPendingRecipes()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ viewPendingRecipes.

**Method:** `approveOrReject()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ approveOrReject.

**Method:** `displayResult()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Hiển thị dữ liệu trên giao diện.

