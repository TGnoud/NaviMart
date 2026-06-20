# Đánh giá nguyên lý SOLID - Module 2 (Family)

## 1. Single Responsibility Principle (SRP)
- `FamilyEntity` chỉ chứa định nghĩa cấu trúc dữ liệu của một nhóm gia đình. Nó không chứa logic để tính toán xem thành viên có được phép xóa nhóm hay không, phần đó nằm ở `FamilyService`.

## 2. Open-Closed Principle (OCP)
- Nếu sau này hệ thống cho phép "Tạo nhóm doanh nghiệp" ngoài "Tạo nhóm gia đình", ta có thể extend lớp cơ sở `Group` mà không phải phá vỡ các chức năng có sẵn của `FamilyGroup`.

## 3. Liskov Substitution Principle (LSP)
- Các loại thành viên (Member, Admin, Owner) có thể kế thừa từ một interface `IFamilyRole` và hoàn toàn có thể thay thế cho nhau trong các vòng lặp kiểm tra phân quyền.

## 4. Interface Segregation Principle (ISP)
- Thay vì một interface lớn `IFamilyManager` chứa tất cả các lệnh (thêm, sửa, xóa, tìm kiếm), hệ thống phân tách thành `IFamilyReader` (chỉ tra cứu thành viên) cho các user thông thường và `IFamilyWriter` cho Group Admin.

## 5. Dependency Inversion Principle (DIP)
- `FamilyController` không phụ thuộc trực tiếp vào `FamilyEntity` mà gọi gián tiếp thông qua `IFamilyService`. Tầng cao không phụ thuộc tầng thấp.
