# Đánh giá nguyên lý SOLID - Module 1 (Auth)

## 1. Single Responsibility Principle (SRP)
- Các lớp trong module Auth có một lý do duy nhất để thay đổi. 
- `AuthService` thay đổi khi thuật toán hash mật khẩu hoặc định dạng JWT thay đổi. Nó không chứa code gửi giao diện UI hay lưu Database trực tiếp.

## 2. Open-Closed Principle (OCP)
- `AuthService` mở để mở rộng. Nếu thêm hình thức đăng nhập bằng Google (OAuth2), ta có thể tạo `GoogleAuthStrategy` kế thừa từ `IAuthStrategy` mà không phải sửa logic xác thực nội bộ của email/password hiện tại.

## 3. Liskov Substitution Principle (LSP)
- Mọi hình thức cấp quyền (Authorization) dù bằng JWT hay Session đều có thể thay thế vào interface `ITokenProvider` mà không làm thay đổi kỳ vọng (hành vi) của hệ thống.

## 4. Interface Segregation Principle (ISP)
- Các API xác thực được tách riêng biệt: `IUserAuthentication` (dành cho Login/Register) và `IUserProfile` (dành cho Edit Info). Tránh tạo ra một Fat Interface chứa cả hàm login lẫn hàm update profile.

## 5. Dependency Inversion Principle (DIP)
- `AuthController` phụ thuộc vào Interface `IAuthService` thay vì implement cụ thể `AuthServiceImpl`. Điều này giúp việc viết Unit Test cho Controller trở nên dễ dàng bằng cách truyền vào các lớp Mock Service.
