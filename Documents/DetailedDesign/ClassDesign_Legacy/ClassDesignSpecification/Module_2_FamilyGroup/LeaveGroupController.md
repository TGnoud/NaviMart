# Class Design Specification - LeaveGroupController

**Module:** Module_2_FamilyGroup
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `LeaveGroupController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| leaveGroup | void | Xử lý nghiệp vụ leaveGroup. |

### 3. Method Details
**Method:** `leaveGroup(groupId: String, userId: String)`
- **Parameters:**
  - `groupId` (String): Tham số groupId truyền vào hàm
  - `userId` (String): Tham số userId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ leaveGroup.

