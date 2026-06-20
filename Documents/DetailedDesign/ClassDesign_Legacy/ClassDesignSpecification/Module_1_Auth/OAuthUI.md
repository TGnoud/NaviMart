# Class Design Specification - OAuthUI

**Module:** Module_1_Auth
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `OAuthUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| Chọn Login with Google/FB | void | Xử lý nghiệp vụ Chọn Login with Google/FB. |
| Success & Redirect | void | Xử lý nghiệp vụ Success & Redirect. |

### 3. Method Details
**Method:** `Chọn Login with Google/FB()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Chọn Login with Google/FB.

**Method:** `Success & Redirect()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Success & Redirect.

