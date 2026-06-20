# Class Design Specification - FamilyDB

**Module:** Module_2_FamilyGroup
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `FamilyDB`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| groupName | String | "" | Tên nhóm |
| memberCount | Int | 0 | Số lượng thành viên |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| saveNewGroup | String | Cập nhật hoặc lưu trữ dữ liệu saveNewGroup. |
| queryGroupInfoAndMembers | Data | Xử lý nghiệp vụ queryGroupInfoAndMembers. |
| saveInviteToken | Boolean | Cập nhật hoặc lưu trữ dữ liệu saveInviteToken. |
| validateToken | Boolean | Xử lý nghiệp vụ validateToken. |
| addMemberToGroup | Boolean | Xử lý nghiệp vụ addMemberToGroup. |
| updateMemberRole | Boolean | Cập nhật hoặc lưu trữ dữ liệu updateMemberRole. |
| deleteMember | Boolean | Xóa dữ liệu deleteMember. |
| removeMember | Boolean | Xóa dữ liệu removeMember. |

### 3. Method Details
**Method:** `saveNewGroup(groupName: String, ownerId: String)`
- **Parameters:**
  - `groupName` (String): Tham số groupName truyền vào hàm
  - `ownerId` (String): Tham số ownerId truyền vào hàm
- **Return:** `String`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu saveNewGroup.

**Method:** `queryGroupInfoAndMembers(groupId: String)`
- **Parameters:**
  - `groupId` (String): Tham số groupId truyền vào hàm
- **Return:** `Data`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ queryGroupInfoAndMembers.

**Method:** `saveInviteToken(groupId: String, token: String, expiry: Date)`
- **Parameters:**
  - `groupId` (String): Tham số groupId truyền vào hàm
  - `token` (String): Tham số token truyền vào hàm
  - `expiry` (Date): Tham số expiry truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu saveInviteToken.

**Method:** `validateToken(inviteCode: String)`
- **Parameters:**
  - `inviteCode` (String): Tham số inviteCode truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ validateToken.

**Method:** `addMemberToGroup(userId: String, groupId: String)`
- **Parameters:**
  - `userId` (String): Tham số userId truyền vào hàm
  - `groupId` (String): Tham số groupId truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ addMemberToGroup.

**Method:** `updateMemberRole(groupId: String, memberId: String, newRole: String)`
- **Parameters:**
  - `groupId` (String): Tham số groupId truyền vào hàm
  - `memberId` (String): Tham số memberId truyền vào hàm
  - `newRole` (String): Tham số newRole truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateMemberRole.

**Method:** `deleteMember(groupId: String, memberId: String)`
- **Parameters:**
  - `groupId` (String): Tham số groupId truyền vào hàm
  - `memberId` (String): Tham số memberId truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xóa dữ liệu deleteMember.

**Method:** `removeMember(groupId: String, userId: String)`
- **Parameters:**
  - `groupId` (String): Tham số groupId truyền vào hàm
  - `userId` (String): Tham số userId truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xóa dữ liệu removeMember.

