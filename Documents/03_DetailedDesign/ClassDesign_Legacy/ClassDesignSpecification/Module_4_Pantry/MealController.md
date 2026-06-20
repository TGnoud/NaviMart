# Class Design Specification - MealController

**Module:** Module_4_Pantry
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `MealController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| confirmMealCooked | void | Xử lý nghiệp vụ confirmMealCooked. |

### 3. Method Details
**Method:** `confirmMealCooked(mealId: String)`
- **Parameters:**
  - `mealId` (String): Tham số mealId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ confirmMealCooked.

