# Class Design Specification - MealSessionController

**Module:** Module_5_MealPlanner
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `MealSessionController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| addOrUpdateMeal | void | Xử lý nghiệp vụ addOrUpdateMeal. |
| removeMeal | void | Xóa dữ liệu removeMeal. |

### 3. Method Details
**Method:** `addOrUpdateMeal(sessionId: String, recipeId: String)`
- **Parameters:**
  - `sessionId` (String): Tham số sessionId truyền vào hàm
  - `recipeId` (String): Tham số recipeId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ addOrUpdateMeal.

**Method:** `removeMeal(sessionId: String, mealId: String)`
- **Parameters:**
  - `sessionId` (String): Tham số sessionId truyền vào hàm
  - `mealId` (String): Tham số mealId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xóa dữ liệu removeMeal.

