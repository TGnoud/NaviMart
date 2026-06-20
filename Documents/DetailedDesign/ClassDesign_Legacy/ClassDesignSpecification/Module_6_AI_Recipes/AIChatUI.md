# Class Design Specification - AIChatUI

**Module:** Module_6_AI_Recipes
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `AIChatUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| enterQuestion | void | Tiếp nhận dữ liệu đầu vào từ người dùng. |
| displayAnswer | void | Hiển thị dữ liệu trên giao diện. |

### 3. Method Details
**Method:** `enterQuestion()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Tiếp nhận dữ liệu đầu vào từ người dùng.

**Method:** `displayAnswer()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Hiển thị dữ liệu trên giao diện.

