# Class Design Specification - ChatController

**Module:** Module_6_AI_Recipes
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ChatController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| sendMessage | void | Xử lý nghiệp vụ sendMessage. |

### 3. Method Details
**Method:** `sendMessage(question: String, context: Data)`
- **Parameters:**
  - `question` (String): Tham số question truyền vào hàm
  - `context` (Data): Tham số context truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ sendMessage.

