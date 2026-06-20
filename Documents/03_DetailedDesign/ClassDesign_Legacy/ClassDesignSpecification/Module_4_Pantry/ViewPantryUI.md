# Class Design Specification - ViewPantryUI

**Module:** Module_4_Pantry
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `ViewPantryUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| enterSearchKeyword | void | Tiếp nhận dữ liệu đầu vào từ người dùng. |
| displayFoodList | void | Hiển thị dữ liệu trên giao diện. |

### 3. Method Details
**Method:** `enterSearchKeyword()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Tiếp nhận dữ liệu đầu vào từ người dùng.

**Method:** `displayFoodList()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Hiển thị dữ liệu trên giao diện.

