# Đánh giá nguyên lý SOLID - Module 8 (Admin)

## 1. Single Responsibility Principle (SRP)
- Giao diện `AdminBoundary` chỉ lo vẽ màn hình quản trị. Các quyền logic "được phép khóa hay không" nằm trọn ở `AdminService`.

## 2. Open-Closed Principle (OCP)
- Mở rộng chức năng quản trị dễ dàng. Nếu tương lai có thêm nghiệp vụ "Duyệt bình luận", ta chỉ cần mở rộng logic ở `AdminService` mà không phá hỏng luồng duyệt công thức.

## 3. Liskov Substitution Principle (LSP)
- Bất kỳ loại dữ liệu nào bị user report (Recipe, Comment, User) đều có chung một interface `IReportable` để `AdminService` xử lý hàng loạt mà không cần kiểm tra kiểu dữ liệu thủ công (`instanceof`).

## 4. Interface Segregation Principle (ISP)
- Không có một `ISystemManager` chung. Tách thành `IUserModerator` (cho mod quản lý user) và `IRecipeModerator` (cho mod duyệt công thức nấu ăn).

## 5. Dependency Inversion Principle (DIP)
- Module Admin phụ thuộc vào các Abstraction của các module khác. Ví dụ khi cần lấy danh sách người dùng, nó gọi `IUserReaderService` thay vì gọi thẳng vào `UserEntity`.
