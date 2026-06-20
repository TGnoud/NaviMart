# Đặc tả Lớp (Class Specification) - Module Reports

Tài liệu mô tả chi tiết các phương thức và thuộc tính của các lớp trong Module Reports.

## 1. Views
### 1.1. Lớp `StatsDashboard`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React hiển thị bảng điều khiển báo cáo thống kê.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | render | JSX.Element | Render giao diện HTML/CSS |

**Parameter:**
Không

**Exception:**
Không

**Method:**
- Hiển thị các biểu đồ (charts) phân tích số liệu.

**State:**
Không

## 2. API Clients
### 2.1. Lớp `ReportsApiClient`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Lớp gọi API bằng Axios để tương tác với Backend.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | baseUrl | String | `""` | URL gốc của backend |

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | getDashboard | Promise\<any\> | Lấy dữ liệu tổng hợp chung |
| 2 | getConsumptionTrends | Promise\<any\> | Lấy báo cáo xu hướng tiêu thụ |
| 3 | getWasteReport | Promise\<any\> | Lấy báo cáo thực phẩm lãng phí |

**Parameter:**
- `data` – Các bộ lọc tham số (ngày tháng, loại...).

**Exception:**
- Lỗi kết nối HTTP.

**Method:**
- Gọi đến `GET /api/reports/...` để tải số liệu JSON.

**State:**
Không

## 3. Controllers
### 3.1. Lớp `ReportsController`
- **Stereotype**: `<<Control>>`
- **Mô tả**: NestJS Controller nhận request báo cáo.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | getDashboard | Response | Gọi Service tổng hợp chung |
| 2 | getConsumptionTrends | Response | Gọi Service xu hướng tiêu dùng |
| 3 | getWasteReport | Response | Gọi Service báo cáo hao phí |

**Parameter:**
- `dto` – Tham số thời gian, nhóm.

**Exception:**
- `BadRequestException` – Dữ liệu tham số sai.

**Method:**
- Validate query params rồi chuyển tiếp cho Service.

**State:**
Không

## 4. Services
### 4.1. Lớp `ReportsService`
- **Stereotype**: `<<Control>>`
- **Mô tả**: Lớp chứa Business Logic thống kê dữ liệu.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | getDashboard | any | Tính toán chỉ số tổng quát |
| 2 | getConsumptionTrends | any | Tính toán xu hướng dùng |
| 3 | getWasteReport | any | Tính lượng thực phẩm bỏ đi |

**Parameter:**
- `data` – Dữ liệu lọc từ Controller.

**Exception:**
- Logic exception.

**Method:**
- Chạy các câu query phức tạp với SQL Aggregate Functions (`COUNT`, `SUM`, `GROUP BY`) vào các entity liên quan (Inventory, Meals, Shopping Lists).

**State:**
Không
