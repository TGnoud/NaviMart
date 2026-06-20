# Đánh giá Coupling & Cohesion - Module 3 (Shopping Lists)

## 1. Mức độ Cohesion (Gắn kết)
**Đánh giá:** Functional Cohesion
**Giải thích:**
- Module tập trung giải quyết trọn vẹn luồng "Mua sắm": Tạo danh sách, thêm món đồ, đánh dấu đã mua.
- Không có bất kỳ logic nào lạc lõng lọt vào module này (Ví dụ: logic thêm món ăn vào tủ lạnh sẽ được gọi sang module Pantry thay vì tự viết code trực tiếp ở đây).

## 2. Mức độ Coupling (Phụ thuộc)
**Đánh giá:** Data Coupling
**Giải thích:**
- Khi người dùng đánh dấu mua một món (tick "Đã mua"), `ShoppingController` truyền `DTO_Item` sang `PantryController` để tủ lạnh tự động cộng số lượng.
- Nó truyền tham số rạch ròi, hoàn toàn không thao túng logic cập nhật Database nội bộ của Tủ lạnh (Content Coupling).
