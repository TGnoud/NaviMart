# Class Design Specification - EmailService

**Module:** Module_1_Auth
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `EmailService`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| sendOTP | void | Xử lý nghiệp vụ sendOTP. |

### 3. Method Details
**Method:** `sendOTP()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ sendOTP.

