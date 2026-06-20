# Class Design Specification - RemoveMemberUI

**Module:** Module_2_FamilyGroup
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `RemoveMemberUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| selectMemberToRemove | void | Xử lý nghiệp vụ selectMemberToRemove. |
| displayResult | void | Hiển thị dữ liệu trên giao diện. |

### 3. Method Details
**Method:** `selectMemberToRemove()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ selectMemberToRemove.

**Method:** `displayResult()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Hiển thị dữ liệu trên giao diện.

