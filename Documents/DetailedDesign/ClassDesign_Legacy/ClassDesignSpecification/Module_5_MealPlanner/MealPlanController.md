# Class Design Specification - MealPlanController

**Module:** Module_5_MealPlanner
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `MealPlanController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| getMealPlan | void | Lấy dữ liệu cho getMealPlan. |
| createSession | void | Xử lý nghiệp vụ createSession. |

### 3. Method Details
**Method:** `getMealPlan(dateRange: Data)`
- **Parameters:**
  - `dateRange` (Data): Tham số dateRange truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Lấy dữ liệu cho getMealPlan.

**Method:** `createSession(date: Date, type: String)`
- **Parameters:**
  - `date` (Date): Tham số date truyền vào hàm
  - `type` (String): Tham số type truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ createSession.

