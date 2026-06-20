# Đánh giá Coupling & Cohesion - Module 8 (Admin)

## 1. Mức độ Cohesion (Gắn kết)
**Đánh giá:** Functional Cohesion
**Giải thích:**
- Module Admin thực hiện tất cả các tác vụ quản trị hệ thống (Duyệt công thức, Khóa tài khoản, Xem tổng quan). Nó cô lập mọi nghiệp vụ rủi ro cao vào chung một module.

## 2. Mức độ Coupling (Phụ thuộc)
**Đánh giá:** Data Coupling
**Giải thích:**
- Admin gọi sang module Auth để đổi trạng thái khóa tài khoản của User bằng cách gọi API nội bộ và truyền `UserId`. Nó không dùng chung database connection hay thao tác chọc thẳng vào memory của module Auth.
