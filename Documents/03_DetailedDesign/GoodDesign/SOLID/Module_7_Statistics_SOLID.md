# Đánh giá nguyên lý SOLID - Module 7 (Statistics)

## 1. Single Responsibility Principle (SRP)
- Việc tính toán số liệu được giao cho `ReportService`, trong khi việc render biểu đồ (Chart) được giao riêng cho `DashboardView`. Nếu muốn đổi thư viện vẽ Chart, ta chỉ đổi View mà không đụng tới Service.

## 2. Open-Closed Principle (OCP)
- Có thể thêm các loại báo cáo mới (ví dụ "Báo cáo xu hướng nấu ăn") bằng cách tạo class mới `TrendReportStrategy` kế thừa `IReportStrategy` mà không cần sửa `ReportService`.

## 3. Liskov Substitution Principle (LSP)
- Bất kỳ class nào sinh ra báo cáo đều implement `IReport`. Có thể thay thế `WasteReport` bằng `SpendingReport` ở giao diện gọi hàm export PDF mà không bị lỗi cấu trúc.

## 4. Interface Segregation Principle (ISP)
- `IExportable` được tách riêng cho các tính năng Export ra Excel/PDF. Nếu báo cáo nào không hỗ trợ export, nó sẽ không cần phải implement interface này.

## 5. Dependency Inversion Principle (DIP)
- Các module khác khi cần log số liệu thống kê sẽ gọi qua `IStatsLogger` interface, thay vì gọi trực tiếp class.
