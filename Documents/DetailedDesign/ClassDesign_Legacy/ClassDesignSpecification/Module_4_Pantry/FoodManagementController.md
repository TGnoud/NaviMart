# Class Design Specification - FoodManagementController

**Module:** Module_4_Pantry
**Stereotype:** `<<control>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `FoodManagementController`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| controllerId | String | uuid() | ID phiên điều khiển |
| isActive | Boolean | true | Trạng thái hoạt động |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| addFood | void | Xử lý nghiệp vụ addFood. |
| updateFood | void | Cập nhật hoặc lưu trữ dữ liệu updateFood. |
| removeFood | void | Xóa dữ liệu removeFood. |

### 3. Method Details
**Method:** `addFood(foodDetails: Data)`
- **Parameters:**
  - `foodDetails` (Data): Tham số foodDetails truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ addFood.

**Method:** `updateFood(foodId: String, updatedData: Data)`
- **Parameters:**
  - `foodId` (String): Tham số foodId truyền vào hàm
  - `updatedData` (Data): Tham số updatedData truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Cập nhật hoặc lưu trữ dữ liệu updateFood.

**Method:** `removeFood(foodId: String)`
- **Parameters:**
  - `foodId` (String): Tham số foodId truyền vào hàm
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xóa dữ liệu removeFood.

