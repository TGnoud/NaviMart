# Đánh giá Coupling và Cohesion - Hệ thống NaviMart

Dựa trên lý thuyết về thiết kế phần mềm (Good Design), một hệ thống có kiến trúc tốt cần đạt được mục tiêu: **"Loose Coupling and Tight Cohesion"** (Giảm thiểu sự phụ thuộc giữa các module và Tối đa hóa tính gắn kết bên trong mỗi module). 

Dưới đây là đánh giá toàn diện về hệ thống NaviMart theo từng module dựa trên mô hình BCE (Boundary - Control - Entity) đã thiết kế:

## 1. Đánh giá Cohesion (Mức độ gắn kết)
**Kết quả đánh giá:** Hệ thống đạt mức **Functional Cohesion** (Mức cao nhất và lý tưởng nhất).

**Giải thích chi tiết:**
- **Functional Cohesion** xảy ra khi tất cả các thành phần bên trong một module cùng làm việc để thực hiện một nhiệm vụ/trách nhiệm duy nhất.
- Trong kiến trúc của NaviMart, nhờ áp dụng triệt để mô hình BCE và phân tách 8 phân hệ (Auth, Family, Pantry, Shopping, Meals, Recipes, Statistics, Admin):
  - **Tầng Boundary**: Chỉ chịu trách nhiệm duy nhất là tiếp nhận request từ người dùng và hiển thị dữ liệu (View/API Client). Không chứa logic nghiệp vụ.
  - **Tầng Control**: Mỗi Controller/Service chỉ xử lý logic nghiệp vụ cho một chức năng cụ thể (Ví dụ: `AuthController` chỉ lo luồng đăng nhập/đăng ký, không dính dáng đến logic quản lý tủ lạnh).
  - **Tầng Entity**: Chỉ làm nhiệm vụ đóng gói cấu trúc dữ liệu và tương tác với Database (CRUD).

> **Minh họa bằng Biểu đồ Cohesion:**
> Mời bạn xem file `Cohesion_Diagram.puml` để thấy cách các lớp trong module Auth tương tác cực kỳ tập trung cho một mục đích duy nhất.

---

## 2. Đánh giá Coupling (Mức độ phụ thuộc)
**Kết quả đánh giá:** Hệ thống đạt mức **Data Coupling** (Mức thấp nhất/lỏng lẻo nhất và lý tưởng nhất).

**Giải thích chi tiết:**
- **Data Coupling** xảy ra khi các module giao tiếp với nhau thuần túy thông qua việc truyền tham số (parameters) hoặc truyền Data Transfer Objects (DTO) đơn giản.
- Trong NaviMart:
  - Các module hoàn toàn **không** dùng chung các biến toàn cục (tránh được Common Coupling).
  - Không có module nào nhảy thẳng vào sửa đổi logic nội bộ hoặc dữ liệu của module khác (tránh được Content Coupling).
  - Khi `Shopping Module` muốn cập nhật thực phẩm vào Tủ lạnh, nó gọi đến phương thức của `PantryController` và truyền vào một đối tượng `DTO_Item` chứa thông tin cơ bản. `Shopping Module` không cần biết bên trong `PantryController` lưu dữ liệu bằng cách nào.
  - Tầng Boundary truyền dữ liệu xuống Control thông qua tham số (VD: `credentials`), và Control gọi Entity bằng cách truyền các cấu trúc dữ liệu nguyên thủy (Primitive types) hoặc DTO.

> **Minh họa bằng Biểu đồ Coupling:**
> Mời bạn xem file `Coupling_Diagram.puml` để thấy các module độc lập tương tác với nhau lỏng lẻo thông qua tham số truyền vào hàm.

## Kết luận
Hệ thống NaviMart tuân thủ nghiêm ngặt thiết kế **Loose Coupling** và **Tight Cohesion**, giúp cho:
1. **Dễ bảo trì (Maintainability):** Khi sửa lỗi trong module Tủ lạnh (Pantry) sẽ không làm hỏng chức năng Lên thực đơn (Meals).
2. **Dễ tái sử dụng (Reusability):** Lớp `FoodEntity` hoặc `AI_Service` có thể được dùng ở nhiều màn hình khác nhau mà không cần sửa code.
3. **Dễ mở rộng (Extensibility):** Dễ dàng cắm thêm các module mới vào hệ thống mà không phá vỡ liên kết cũ.
