# Class Design Specification - OAuthProvider (Google/FB)

**Module:** Module_1_Auth
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `OAuthProvider (Google/FB)`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| Request Auth URL | void | Xử lý nghiệp vụ Request Auth URL. |
| Đồng ý cấp quyền | void | Xử lý nghiệp vụ Đồng ý cấp quyền. |

### 3. Method Details
**Method:** `Request Auth URL()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Request Auth URL.

**Method:** `Đồng ý cấp quyền()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ Đồng ý cấp quyền.

