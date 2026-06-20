# Class Design Specification - RegisterUI

**Module:** Module_1_Auth
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `RegisterUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| Chọn Đăng ký | void | Xử lý nghiệp vụ Chọn Đăng ký. |
| Điền & Gửi form | void | Xử lý nghiệp vụ Điền & Gửi form. |
| Success | void | Xử lý nghiệp vụ Success. |

### 3. Method Details
**Method:** `Chọn Đăng ký()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Chọn Đăng ký.

**Method:** `Điền & Gửi form()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Điền & Gửi form.

**Method:** `Success()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Success.

