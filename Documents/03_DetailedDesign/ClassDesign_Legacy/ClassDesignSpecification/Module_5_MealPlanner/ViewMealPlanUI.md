# Class Design Specification - ViewMealPlanUI

**Module:** Module_5_MealPlanner
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ViewMealPlanUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| selectDateRange | void | Xử lý nghiệp vụ selectDateRange. |
| displayMealPlan | void | Hiển thị dữ liệu trên giao diện. |

### 3. Method Details
**Method:** `selectDateRange()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ selectDateRange.

**Method:** `displayMealPlan()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Hiển thị dữ liệu trên giao diện.

