# Đánh giá nguyên lý SOLID - Module 5 (Meals)

## 1. Single Responsibility Principle (SRP)
- `MealController` chỉ quản lý logic sắp xếp bữa ăn vào các khung giờ. Việc trừ thực phẩm khi nấu hoàn tất được 위 thác sang `PantryController`.

## 2. Open-Closed Principle (OCP)
- Mở rộng chức năng "Gợi ý bữa ăn" (Meal Suggestion). Module cho phép truyền vào các `IMealSuggestStrategy` khác nhau (như gợi ý theo lượng Calo, gợi ý theo thực phẩm sắp hỏng) mà không cần can thiệp logic của Controller.

## 3. Liskov Substitution Principle (LSP)
- Mọi bữa ăn (Sáng, Trưa, Tối, Ăn Vặt) kế thừa từ `AbstractMealSession` đều có thể thay thế nhau trong hàm tính toán tổng lượng Calo hàng ngày.

## 4. Interface Segregation Principle (ISP)
- Thay vì dồn mọi thứ vào `IMealService`, ta chia ra `IMealPlanner` (dành cho người dùng lập kế hoạch) và `IMealExecutor` (để tick hoàn thành bữa ăn và trừ kho).

## 5. Dependency Inversion Principle (DIP)
- Các module khác muốn giao tiếp với Meals đều phải thông qua `IMealService` abstraction, chứ không được khởi tạo trực tiếp instance của `MealServiceImpl`.
