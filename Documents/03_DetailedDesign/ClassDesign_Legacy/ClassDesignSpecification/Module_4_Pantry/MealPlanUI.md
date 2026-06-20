# Class Design Specification - MealPlanUI

**Module:** Module_4_Pantry
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `MealPlanUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| confirmMealCooked | void | Xử lý nghiệp vụ confirmMealCooked. |
| displayUpdate | void | Hiển thị dữ liệu trên giao diện. |

### 3. Method Details
**Method:** `confirmMealCooked()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ confirmMealCooked.

**Method:** `displayUpdate()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Hiển thị dữ liệu trên giao diện.

