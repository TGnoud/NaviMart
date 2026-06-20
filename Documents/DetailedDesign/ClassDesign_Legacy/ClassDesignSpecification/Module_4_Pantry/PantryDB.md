# Class Design Specification - PantryDB

**Module:** Module_4_Pantry
**Stereotype:** `<<entity>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `PantryDB`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| id | String | null | Khóa chính / ID định danh |
| itemName | String | "" | Tên thực phẩm/mặt hàng |
| quantity | Float | 0.0 | Số lượng |
| expiryDate | DateTime | null | Ngày hết hạn |
| createdAt | DateTime | now() | Thời gian tạo bản ghi |
| updatedAt | DateTime | now() | Thời gian cập nhật lần cuối |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| queryFoodList | List | Xử lý nghiệp vụ queryFoodList. |
| saveFood | String | Cập nhật hoặc lưu trữ dữ liệu saveFood. |
| updateFoodData | Boolean | Cập nhật hoặc lưu trữ dữ liệu updateFoodData. |
| deleteFoodData | Boolean | Xóa dữ liệu deleteFoodData. |
| decreaseFoodQuantity | Boolean | Xử lý nghiệp vụ decreaseFoodQuantity. |
| queryExpiringFoods | List | Xử lý nghiệp vụ queryExpiringFoods. |

### 3. Method Details
**Method:** `queryFoodList(keyword: String, filters: Data)`
- **Parameters:**
  - `keyword` (String): Tham số keyword truyền vào hàm
  - `filters` (Data): Tham số filters truyền vào hàm
- **Return:** `List`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ queryFoodList.

**Method:** `saveFood(foodDetails: Data)`
- **Parameters:**
  - `foodDetails` (Data): Tham số foodDetails truyền vào hàm
- **Return:** `String`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu saveFood.

**Method:** `updateFoodData(foodId: String, updatedData: Data)`
- **Parameters:**
  - `foodId` (String): Tham số foodId truyền vào hàm
  - `updatedData` (Data): Tham số updatedData truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateFoodData.

**Method:** `deleteFoodData(foodId: String)`
- **Parameters:**
  - `foodId` (String): Tham số foodId truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xóa dữ liệu deleteFoodData.

**Method:** `decreaseFoodQuantity(ingredients: List)`
- **Parameters:**
  - `ingredients` (List): Tham số ingredients truyền vào hàm
- **Return:** `Boolean`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ decreaseFoodQuantity.

**Method:** `queryExpiringFoods(daysLimit: Number)`
- **Parameters:**
  - `daysLimit` (Number): Tham số daysLimit truyền vào hàm
- **Return:** `List`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ queryExpiringFoods.

