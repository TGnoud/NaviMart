# Class Design Specification - MealPlanDB

**Module:** Module_5_MealPlanner
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `MealPlanDB`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| querySessions | List | Xử lý nghiệp vụ querySessions. |
| insertSession | String | Xử lý nghiệp vụ insertSession. |
| saveMealToSession | Boolean | Cập nhật hoặc lưu trữ dữ liệu saveMealToSession. |
| deleteMeal | Boolean | Xóa dữ liệu deleteMeal. |

### 3. Method Details
**Method:** `querySessions(dateRange: Data)`
- **Parameters:**
  - `dateRange` (Data): Tham số dateRange truyền vào hàm
- **Return:** `List`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ querySessions.

**Method:** `insertSession(date: Date, type: String)`
- **Parameters:**
  - `date` (Date): Tham số date truyền vào hàm
  - `type` (String): Tham số type truyền vào hàm
- **Return:** `String`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ insertSession.

**Method:** `saveMealToSession(sessionId: String, recipeId: String)`
- **Parameters:**
  - `sessionId` (String): Tham số sessionId truyền vào hàm
  - `recipeId` (String): Tham số recipeId truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu saveMealToSession.

**Method:** `deleteMeal(sessionId: String, mealId: String)`
- **Parameters:**
  - `sessionId` (String): Tham số sessionId truyền vào hàm
  - `mealId` (String): Tham số mealId truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xóa dữ liệu deleteMeal.

