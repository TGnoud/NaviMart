# Class Design Specification - AIService

**Module:** Module_6_AI_Recipes
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `AIService`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| generateRecipes | List | Xử lý nghiệp vụ generateRecipes. |
| callAiAPI | String | Xử lý nghiệp vụ callAiAPI. |

### 3. Method Details
**Method:** `generateRecipes(ingredientList: List)`
- **Parameters:**
  - `ingredientList` (List): Tham số ingredientList truyền vào hàm
- **Return:** `List`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ generateRecipes.

**Method:** `callAiAPI(question: String, context: Data)`
- **Parameters:**
  - `question` (String): Tham số question truyền vào hàm
  - `context` (Data): Tham số context truyền vào hàm
- **Return:** `String`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ callAiAPI.

