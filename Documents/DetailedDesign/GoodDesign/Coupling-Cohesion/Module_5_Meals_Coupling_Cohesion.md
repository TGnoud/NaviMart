# Đánh giá Coupling & Cohesion - Module 5 (Meals)

## 1. Mức độ Cohesion (Gắn kết)
**Đánh giá:** Functional Cohesion
**Giải thích:**
- Module Meals đảm nhiệm chức năng tạo Lịch trình ăn (Meal Plan) và quản lý các phiên nấu ăn (Cooking Session).
- Mọi logic bên trong module (chọn ngày, chọn món, tính toán calo của bữa ăn) đều hướng đến một mục đích chung duy nhất là xây dựng bữa ăn hoàn chỉnh cho gia đình.

## 2. Mức độ Coupling (Phụ thuộc)
**Đánh giá:** Data Coupling
**Giải thích:**
- Khi Meals cần nguyên liệu để nấu, nó không tự tiện chọc vào Database của Pantry để trừ. Thay vào đó nó gọi hàm `deductIngredients(list)` của PantryController.
- Khi cần công thức nấu ăn, nó nhận một đối tượng `RecipeDTO` từ module Recipes thay vì tự quản lý dữ liệu công thức.
