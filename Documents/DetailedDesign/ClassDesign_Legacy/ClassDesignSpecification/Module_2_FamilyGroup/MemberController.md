# Class Design Specification - MemberController

**Module:** Module_2_FamilyGroup
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `MemberController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| removeMember | void | Xóa dữ liệu removeMember. |

### 3. Method Details
**Method:** `removeMember(groupId: String, memberId: String)`
- **Parameters:**
  - `groupId` (String): Tham số groupId truyền vào hàm
  - `memberId` (String): Tham số memberId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xóa dữ liệu removeMember.

