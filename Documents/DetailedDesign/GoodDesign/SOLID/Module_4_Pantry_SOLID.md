# Đánh giá nguyên lý SOLID - Module 4 (Pantry)

## 1. Single Responsibility Principle (SRP)
- Lớp `PantryService` chỉ xử lý logic quản lý số lượng tồn kho. Việc phát cảnh báo (Notification) hết hạn sẽ được 위 thác sang `NotificationService` để không vi phạm SRP.

## 2. Open-Closed Principle (OCP)
- Mở rộng chức năng quét Barcode/AI nhận diện hóa đơn mà không làm ảnh hưởng đến luồng lưu dữ liệu truyền thống. Ta có thể thêm `BarcodePantryInput` implement interface `IPantryInput` mà không sửa đổi `ManualPantryInput`.

## 3. Liskov Substitution Principle (LSP)
- Bất kỳ nguồn dữ liệu nguyên liệu nào (được người dùng nhập tay, hay tự động từ hóa đơn chuyển qua) đều được xử lý chính xác bởi hệ thống mà không có sự phân biệt đối xử (không văng lỗi khi gặp kiểu dữ liệu dẫn xuất).

## 4. Interface Segregation Principle (ISP)
- Thay vì `IPantryInterface` khổng lồ, ta tách ra `IExpiryChecker` (cho các batch job tự động chạy quét đồ hết hạn hàng ngày) và `IPantryManager` (cho người dùng CRUD thực phẩm).

## 5. Dependency Inversion Principle (DIP)
- Các hàm trừ số lượng nguyên liệu trong Pantry không kết nối Database trực tiếp (cấp thấp) mà gọi qua `IPantryRepository` (cấp cao).
