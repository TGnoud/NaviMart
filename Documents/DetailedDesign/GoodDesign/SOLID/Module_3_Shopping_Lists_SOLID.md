# Đánh giá nguyên lý SOLID - Module 3 (Shopping Lists)

## 1. Single Responsibility Principle (SRP)
- `ShoppingListEntity` chỉ đảm nhiệm lưu trữ các List name. Các Item cụ thể bên trong List được tách ra thành `ShoppingItemEntity`. Mỗi class quản lý một bảng duy nhất trong cơ sở dữ liệu.

## 2. Open-Closed Principle (OCP)
- Logic gợi ý mua sắm (Auto-suggest missing ingredients) được đóng gói trong `ShoppingSuggestStrategy`. Nếu muốn đổi thuật toán từ "gợi ý theo nguyên liệu món ăn" sang "gợi ý theo tần suất mua", ta chỉ việc tạo Strategy mới.

## 3. Liskov Substitution Principle (LSP)
- Bất cứ loại Danh sách mua sắm nào (Danh sách thường, Danh sách sự kiện, Danh sách tự động tạo) đều kế thừa chung `IShoppingList` và hoạt động hoàn hảo khi truyền vào hàm `renderList()`.

## 4. Interface Segregation Principle (ISP)
- `IShoppingItemManager` có thể chia làm `IAddItem` và `ICheckItem` để các giao diện UI thu gọn không cần phải ôm trọn toàn bộ method.

## 5. Dependency Inversion Principle (DIP)
- `ShoppingController` không phụ thuộc trực tiếp vào `PantryController` mà phụ thuộc vào interface `IPantryService` để thực hiện việc chuyển nguyên liệu vào tủ lạnh.
