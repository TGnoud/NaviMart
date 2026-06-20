# Class Design Specification - UserAccount

**Module:** Module_1_Auth
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `UserAccount`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| email | String | "" | Địa chỉ email liên hệ |
| passwordHash | String | "" | Mật khẩu đã mã hóa |
| fullName | String | "" | Họ và tên đầy đủ |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| checkExists | void | Xử lý nghiệp vụ checkExists. |
| savePending | void | Cập nhật hoặc lưu trữ dữ liệu savePending. |
| activateAccount | void | Xử lý nghiệp vụ activateAccount. |
| verifyCredentials | void | Xử lý nghiệp vụ verifyCredentials. |
| checkEmail | void | Xử lý nghiệp vụ checkEmail. |
| updatePassword | void | Cập nhật hoặc lưu trữ dữ liệu updatePassword. |
| fetchCurrentHash | void | Lấy dữ liệu cho fetchCurrentHash. |
| updateHash | void | Cập nhật hoặc lưu trữ dữ liệu updateHash. |

### 3. Method Details
**Method:** `checkExists()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ checkExists.

**Method:** `savePending()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu savePending.

**Method:** `activateAccount()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ activateAccount.

**Method:** `verifyCredentials()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ verifyCredentials.

**Method:** `checkEmail()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ checkEmail.

**Method:** `updatePassword()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updatePassword.

**Method:** `fetchCurrentHash()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Lấy dữ liệu cho fetchCurrentHash.

**Method:** `updateHash()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateHash.

