# Class Design Specification - ViewGroupController

**Module:** Module_2_FamilyGroup
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ViewGroupController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| getGroupDetails | void | Lấy dữ liệu cho getGroupDetails. |

### 3. Method Details
**Method:** `getGroupDetails(groupId: String)`
- **Parameters:**
  - `groupId` (String): Tham số groupId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Lấy dữ liệu cho getGroupDetails.

