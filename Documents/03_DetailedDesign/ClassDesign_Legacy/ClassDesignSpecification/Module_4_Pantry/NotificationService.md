# Class Design Specification - NotificationService

**Module:** Module_4_Pantry
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `NotificationService`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| sendExpiryWarning | void | Xử lý nghiệp vụ sendExpiryWarning. |

### 3. Method Details
**Method:** `sendExpiryWarning(userId: String, foods: List)`
- **Parameters:**
  - `userId` (String): Tham số userId truyền vào hàm
  - `foods` (List): Tham số foods truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ sendExpiryWarning.

