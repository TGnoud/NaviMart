# Class Design Specification - ChangePassUI

**Module:** Module_1_Auth
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ChangePassUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| Nhập Pass cũ & Pass mới | void | Xử lý nghiệp vụ Nhập Pass cũ & Pass mới. |
| Success Msg | void | Xử lý nghiệp vụ Success Msg. |

### 3. Method Details
**Method:** `Nhập Pass cũ & Pass mới()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Nhập Pass cũ & Pass mới.

**Method:** `Success Msg()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Success Msg.

