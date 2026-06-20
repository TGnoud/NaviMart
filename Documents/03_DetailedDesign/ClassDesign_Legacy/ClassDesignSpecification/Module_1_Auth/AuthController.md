# Class Design Specification - AuthController

**Module:** Module_1_Auth
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `AuthController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| submit | void | Xử lý nghiệp vụ submit. |
| verifyOTP | void | Xử lý nghiệp vụ verifyOTP. |
| submitLogin | void | Xử lý nghiệp vụ submitLogin. |
| Callback with Profile Data | void | Xử lý nghiệp vụ Callback with Profile Data. |
| requestReset | void | Xử lý nghiệp vụ requestReset. |
| resetPassword | void | Xử lý nghiệp vụ resetPassword. |
| changePassword | void | Xử lý nghiệp vụ changePassword. |
| verifyOldPassword | void | Xử lý nghiệp vụ verifyOldPassword. |
| logout | void | Xử lý nghiệp vụ logout. |

### 3. Method Details
**Method:** `submit(name: String, email_phone: String, password: String)`
- **Parameters:**
  - `name` (String): Tham số name truyền vào hàm
  - `email_phone` (String): Tham số email_phone truyền vào hàm
  - `password` (String): Tham số password truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ submit.

**Method:** `verifyOTP()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ verifyOTP.

**Method:** `submitLogin(credentials: String)`
- **Parameters:**
  - `credentials` (String): Tham số credentials truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ submitLogin.

**Method:** `Callback with Profile Data()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Callback with Profile Data.

**Method:** `requestReset(email: String)`
- **Parameters:**
  - `email` (String): Tham số email truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ requestReset.

**Method:** `resetPassword(otp: String, newPass: String)`
- **Parameters:**
  - `otp` (String): Tham số otp truyền vào hàm
  - `newPass` (String): Tham số newPass truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ resetPassword.

**Method:** `changePassword(oldP: String, newP: String)`
- **Parameters:**
  - `oldP` (String): Tham số oldP truyền vào hàm
  - `newP` (String): Tham số newP truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ changePassword.

**Method:** `verifyOldPassword()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ verifyOldPassword.

**Method:** `logout()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ logout.

