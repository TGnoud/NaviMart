# Class Design Specification - InviteMemberUI

**Module:** Module_2_FamilyGroup
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `InviteMemberUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| requestInviteToken | void | Xử lý nghiệp vụ requestInviteToken. |
| displayInviteToken | void | Hiển thị dữ liệu trên giao diện. |

### 3. Method Details
**Method:** `requestInviteToken()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ requestInviteToken.

**Method:** `displayInviteToken()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Hiển thị dữ liệu trên giao diện.

