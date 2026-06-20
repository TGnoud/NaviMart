# Đánh giá Coupling & Cohesion - Module 1 (Auth)

## 1. Mức độ Cohesion (Gắn kết)
**Đánh giá:** Functional Cohesion (Tốt nhất)
**Giải thích:**
- Phân hệ Auth tập trung hoàn toàn vào một mục tiêu duy nhất: Quản lý xác thực và người dùng.
- Các Boundary (như `LoginView`, `RegisterView`) chỉ thu thập thông tin đăng nhập.
- `AuthController` chỉ điều phối luồng đăng nhập.
- `AuthService` chỉ thực hiện xử lý token và mã hóa mật khẩu.
Tất cả các thành phần hướng tới một công việc (Functional).

## 2. Mức độ Coupling (Phụ thuộc)
**Đánh giá:** Data Coupling (Tốt nhất)
**Giải thích:**
- Module Auth tương tác với các hệ thống bên ngoài (ví dụ gửi Email OTP) thông qua các tham số nguyên thủy (primitive data) hoặc đối tượng truyền tải (DTO).
- Không chia sẻ biến dùng chung toàn cục (Global Variable) nào với các module khác, đảm bảo khi sửa module Auth không ảnh hưởng đến Family hay Pantry.
