# Đánh giá Nguyên lý SOLID - Hệ thống NaviMart

SOLID là 5 nguyên lý thiết kế cơ bản trong Lập trình Hướng đối tượng (OOP) giúp phần mềm trở nên dễ hiểu, linh hoạt và dễ bảo trì. Dưới đây là đánh giá chi tiết việc áp dụng 5 nguyên lý này vào 8 phân hệ của ứng dụng NaviMart.

---

## 1. S - Single Responsibility Principle (Nguyên lý Đơn trách nhiệm)
> *"Một lớp (class) chỉ nên có duy nhất một lý do để thay đổi, nghĩa là nó chỉ nên đảm nhiệm một trách nhiệm duy nhất."*

**Đánh giá tại NaviMart:**
Hệ thống tuân thủ cực kỳ chặt chẽ SRP thông qua việc chia nhỏ kiến trúc thành 3 tầng Boundary, Control, Entity (BCE):
- **Ví dụ trong Phân hệ Auth (Module 1):**
  - Lớp `RegisterView` (Boundary) chỉ chịu trách nhiệm duy nhất là Render giao diện đăng ký. Nó không chứa bất kỳ câu lệnh truy vấn cơ sở dữ liệu nào.
  - Lớp `AuthController` (Control) chỉ làm nhiệm vụ tiếp nhận dữ liệu từ View, xác thực định dạng và trả kết quả. Nó không thao tác trực tiếp với Database.
  - Lớp `AuthService` (Control) chỉ chuyên lo các tác vụ bảo mật như mã hóa mật khẩu, tạo Token JWT.
  - Lớp `UserEntity` (Entity) chỉ chuyên lo việc `save()`, `update()`, `find()` tương tác với bảng `users` trong cơ sở dữ liệu.
👉 *Đánh giá: Rất tốt.*

---

## 2. O - Open/Closed Principle (Nguyên lý Đóng/Mở)
> *"Phần mềm (lớp, module, hàm) nên MỞ để mở rộng, nhưng ĐÓNG với việc sửa đổi."*

**Đánh giá tại NaviMart:**
Hệ thống sử dụng các mẫu thiết kế (Design Patterns) và Interface để cho phép dễ dàng cắm (plug-in) các tính năng mới mà không phải đập đi viết lại code cũ.
- **Ví dụ trong Phân hệ AI Chef (Module 6) & External Services:**
  - Để tương tác với AI, NaviMart định nghĩa một Interface chung `IAiService`. 
  - Hiện tại hệ thống đang sử dụng `OpenAiServiceImpl` (Sử dụng ChatGPT). Nếu tương lai NaviMart muốn đổi sang Gemini hoặc Claude, lập trình viên chỉ cần tạo thêm class `GeminiServiceImpl` implements `IAiService` mà **hoàn toàn không phải sửa đổi** bất kỳ dòng code nào ở tầng Controller hiện tại.
👉 *Đánh giá: Rất tốt.*

---

## 3. L - Liskov Substitution Principle (Nguyên lý Thay thế Liskov)
> *"Các đối tượng của lớp con (Subclass) có thể thay thế cho các đối tượng của lớp cha (Superclass) mà không làm hỏng tính đúng đắn của chương trình."*

**Đánh giá tại NaviMart:**
NaviMart sử dụng Interface inheritance thay vì Implementation inheritance nhằm tránh các lỗi logic tiềm ẩn của lớp con.
- **Ví dụ trong Phân hệ Pantry & Shopping List:**
  - Hệ thống định nghĩa `IRecipeSource`. Cả `UserGeneratedRecipe` và `AIGeneratedRecipe` đều implements interface này.
  - Bất cứ hàm nào yêu cầu nhận vào tham số là `IRecipeSource` thì đều có thể nhận bản công thức do user tự tạo HOẶC do AI tự tạo để tính toán nguyên liệu một cách minh bạch. Cả hai lớp con đều đáp ứng đủ (không throw Exception bất thường) các hành vi mà lớp cha cam kết.
👉 *Đánh giá: Khá tốt.*

---

## 4. I - Interface Segregation Principle (Nguyên lý Phân tách Interface)
> *"Nhiều Interface cụ thể dành cho từng Client thì tốt hơn là một Interface chung chung (Fat Interface) chứa mọi thứ."*

**Đánh giá tại NaviMart:**
Hệ thống phân tách rạch ròi các Interface theo mục đích sử dụng.
- **Ví dụ trong Phân hệ User / Admin (Module 8):**
  - Lớp Entity User không có một `IUserInterface` khổng lồ.
  - Nó được chia thành `IUserReadOnly` (chỉ chứa hàm `getProfile()`, `getSettings()`) dành cho các luồng hiển thị thông thường, và `IUserWrite` (chứa `updateProfile()`, `changePassword()`, `lockAccount()`) dành cho Admin và luồng cập nhật.
  - Nhờ vậy, khi một class chỉ cần đọc dữ liệu, nó sẽ implement `IUserReadOnly` và không bị "ép" phải nhận cả các hàm ghi/sửa dữ liệu không mong muốn.
👉 *Đánh giá: Rất tốt.*

---

## 5. D - Dependency Inversion Principle (Nguyên lý Đảo ngược Phụ thuộc)
> *"Các module cấp cao không nên phụ thuộc vào các module cấp thấp. Cả hai nên phụ thuộc vào các Abstraction (Interface). Chi tiết (Implementation) phải phụ thuộc vào Abstraction."*

**Đánh giá tại NaviMart:**
NaviMart áp dụng Dependency Injection (DI) rất mạnh mẽ trong thiết kế Class Diagram.
- **Ví dụ trong toàn bộ hệ thống Controller - Service:**
  - Các lớp `Controller` (Cấp cao) không bao giờ tự dùng từ khóa `new ServiceImpl()` (Cấp thấp).
  - Thay vào đó, trong hàm Constructor của `FamilyController` sẽ truyền vào tham số là Interface `IFamilyService`.
  - Tương tự, `FamilyService` không trực tiếp phụ thuộc vào thư viện kết nối Database (MySQL/PostgreSQL), mà nó phụ thuộc vào `IFamilyRepository` (Abstraction).
  - Điều này giúp code có thể dễ dàng được Mock Data khi viết Unit Test mà không cần kết nối DB thật.
👉 *Đánh giá: Xuất sắc.*

---
**TỔNG KẾT:** Kiến trúc thiết kế của NaviMart bám sát và tôn trọng 5 nguyên lý SOLID, biến nó trở thành một kiến trúc mạnh mẽ, chuẩn kỹ thuật phần mềm (Software Engineering) và sẵn sàng cho môi trường doanh nghiệp (Enterprise-level).
