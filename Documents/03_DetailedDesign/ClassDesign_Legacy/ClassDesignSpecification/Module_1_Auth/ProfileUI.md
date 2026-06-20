# Class Design Specification - ProfileUI

**Module:** Module_1_Auth
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ProfileUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| Sửa Name/Avatar & Lưu | void | Xử lý nghiệp vụ Sửa Name/Avatar & Lưu. |
| Cập nhật thành công | void | Xử lý nghiệp vụ Cập nhật thành công. |

### 3. Method Details
**Method:** `Sửa Name/Avatar & Lưu()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Sửa Name/Avatar & Lưu.

**Method:** `Cập nhật thành công()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Cập nhật thành công.

