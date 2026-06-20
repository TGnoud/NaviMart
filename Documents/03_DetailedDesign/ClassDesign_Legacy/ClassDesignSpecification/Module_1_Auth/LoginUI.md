# Class Design Specification - LoginUI

**Module:** Module_1_Auth
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `LoginUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| Nhập Email/SĐT & Mật khẩu | void | Xử lý nghiệp vụ Nhập Email/SĐT & Mật khẩu. |
| Success & Redirect to Home | void | Xử lý nghiệp vụ Success & Redirect to Home. |

### 3. Method Details
**Method:** `Nhập Email/SĐT & Mật khẩu()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Nhập Email/SĐT & Mật khẩu.

**Method:** `Success & Redirect to Home()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Success & Redirect to Home.

