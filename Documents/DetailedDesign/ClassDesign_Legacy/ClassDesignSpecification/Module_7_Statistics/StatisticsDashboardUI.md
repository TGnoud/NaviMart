# Class Design Specification - StatisticsDashboardUI

**Module:** Module_7_Statistics
**Stereotype:** `<<boundary>>`
**Description:** Xử lý các logic và lưu trữ thông tin liên quan đến `StatisticsDashboardUI`.

### 1. Attribute Design
| Name | Type | Default Value | Description |
|---|---|---|---|
| isRendered | Boolean | false | Trạng thái hiển thị giao diện |
| screenTitle | String | "" | Tiêu đề màn hình |

### 2. Operation Design
| Name | Return Type | Description |
|---|---|---|
| selectDateRange | void | Xử lý nghiệp vụ selectDateRange. |
| renderChart | void | Xử lý nghiệp vụ renderChart. |

### 3. Method Details
**Method:** `selectDateRange()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ selectDateRange.

**Method:** `renderChart()`
- **Parameters:**
  - _Không có tham số_
- **Return:** `void`
- **Exceptions:**
  - `NullPointerException`
  - `Exception`
- **Description:** Xử lý nghiệp vụ renderChart.

