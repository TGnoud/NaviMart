# Class Design Specification - SearchRecipeUI

**Module:** Module_6_AI_Recipes
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `SearchRecipeUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| searchRecipes | void | Xử lý nghiệp vụ searchRecipes. |
| viewRecipeDetail | void | Xử lý nghiệp vụ viewRecipeDetail. |
| displayDetails | void | Hiển thị dữ liệu trên giao diện. |

### 3. Method Details
**Method:** `searchRecipes()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ searchRecipes.

**Method:** `viewRecipeDetail()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ viewRecipeDetail.

**Method:** `displayDetails()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Hiển thị dữ liệu trên giao diện.

