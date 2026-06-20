# Đánh giá nguyên lý SOLID - Module 6 (Recipes & AI Chef)

## 1. Single Responsibility Principle (SRP)
- Việc tương tác với OpenAI được tách hẳn ra thành `OpenAiService`. Controller của phần Recipe chỉ chuyên trách định tuyến (routing) request. Lớp `RecipeEntity` chỉ thuần túy lưu trữ công thức chứ không lo việc parse dữ liệu trả về từ AI.

## 2. Open-Closed Principle (OCP)
- Rất xuất sắc: Định nghĩa `IAiService`. Nếu tương lai NaviMart không muốn dùng OpenAI mà chuyển sang Gemini hoặc Llama, lập trình viên chỉ cần tạo class mới implement interface này mà không cần sửa code của `AiChefController`.

## 3. Liskov Substitution Principle (LSP)
- Mọi mô hình AI được plug vào `IAiService` đều đảm bảo chung một đầu ra là đối tượng `RecipeDTO` hợp lệ, không phá vỡ kỳ vọng của các module tiêu thụ dữ liệu bên ngoài.

## 4. Interface Segregation Principle (ISP)
- `IRecipeManager` tách biệt các tính năng Public (xem, tìm kiếm) và tính năng Private (sửa, xóa của user). Tránh việc cấp quyền sửa xóa cho những client chỉ có nhu cầu read-only.

## 5. Dependency Inversion Principle (DIP)
- Module phụ thuộc vào Abstraction `IAiService` chứ không phụ thuộc vào `OpenAiServiceImpl`. Nhờ đó việc đổi thư viện AI là cực kỳ dễ dàng.
