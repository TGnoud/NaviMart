# Class Design Specification - SettingsUI

**Module:** Module_1_Auth
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `SettingsUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| Bấm Đăng xuất | void | Xử lý nghiệp vụ Bấm Đăng xuất. |
| Redirect to Login | void | Xử lý nghiệp vụ Redirect to Login. |

### 3. Method Details
**Method:** `Bấm Đăng xuất()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Bấm Đăng xuất.

**Method:** `Redirect to Login()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Redirect to Login.

