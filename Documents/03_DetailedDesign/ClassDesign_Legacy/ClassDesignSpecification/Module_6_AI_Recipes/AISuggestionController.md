# Class Design Specification - AISuggestionController

**Module:** Module_6_AI_Recipes
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `AISuggestionController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| getSuggestions | void | Lấy dữ liệu cho getSuggestions. |

### 3. Method Details
**Method:** `getSuggestions()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Lấy dữ liệu cho getSuggestions.

