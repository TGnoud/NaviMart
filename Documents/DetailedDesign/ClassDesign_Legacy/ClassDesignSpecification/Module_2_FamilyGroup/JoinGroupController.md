# Class Design Specification - JoinGroupController

**Module:** Module_2_FamilyGroup
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `JoinGroupController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| joinGroup | void | Xử lý nghiệp vụ joinGroup. |

### 3. Method Details
**Method:** `joinGroup(inviteCode: String)`
- **Parameters:**
  - `inviteCode` (String): Tham số inviteCode truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ joinGroup.

