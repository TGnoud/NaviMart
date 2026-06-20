# Class Design Specification - ProfileController

**Module:** Module_1_Auth
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ProfileController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| updateProfile | void | Cập nhật hoặc lưu trữ dữ liệu updateProfile. |

### 3. Method Details
**Method:** `updateProfile(data: String)`
- **Parameters:**
  - `data` (String): Tham số data truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateProfile.

