# Class Design Specification - InviteController

**Module:** Module_2_FamilyGroup
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `InviteController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| generateInvite | void | Xử lý nghiệp vụ generateInvite. |

### 3. Method Details
**Method:** `generateInvite(groupId: String)`
- **Parameters:**
  - `groupId` (String): Tham số groupId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ generateInvite.

