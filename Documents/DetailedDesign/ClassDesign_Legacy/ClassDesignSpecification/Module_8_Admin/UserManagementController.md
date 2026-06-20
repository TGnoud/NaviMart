# Class Design Specification - UserManagementController

**Module:** Module_8_Admin
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `UserManagementController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| loginAdmin | void | Xử lý nghiệp vụ loginAdmin. |
| getUsersList | void | Lấy dữ liệu cho getUsersList. |
| toggleUserLock | void | Xử lý nghiệp vụ toggleUserLock. |

### 3. Method Details
**Method:** `loginAdmin(credentials: Data)`
- **Parameters:**
  - `credentials` (Data): Tham số credentials truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ loginAdmin.

**Method:** `getUsersList(filters: Data)`
- **Parameters:**
  - `filters` (Data): Tham số filters truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Lấy dữ liệu cho getUsersList.

**Method:** `toggleUserLock(userId: String)`
- **Parameters:**
  - `userId` (String): Tham số userId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ toggleUserLock.

