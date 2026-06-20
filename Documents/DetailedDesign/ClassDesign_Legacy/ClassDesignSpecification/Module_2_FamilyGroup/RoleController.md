# Class Design Specification - RoleController

**Module:** Module_2_FamilyGroup
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `RoleController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| updateRole | void | Cập nhật hoặc lưu trữ dữ liệu updateRole. |

### 3. Method Details
**Method:** `updateRole(groupId: String, memberId: String, newRole: String)`
- **Parameters:**
  - `groupId` (String): Tham số groupId truyền vào hàm
  - `memberId` (String): Tham số memberId truyền vào hàm
  - `newRole` (String): Tham số newRole truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateRole.

