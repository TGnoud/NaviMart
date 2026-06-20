# Đánh giá Coupling & Cohesion - Module 6 (Recipes & AI Chef)

## 1. Mức độ Cohesion (Gắn kết)
**Đánh giá:** Functional Cohesion
**Giải thích:**
- Module tập trung cao độ vào việc tìm kiếm, gợi ý và xử lý công thức nấu ăn. 
- Ngay cả AI Chef (một tính năng phức tạp) cũng được gom vào đây vì bản chất nó phục vụ cho việc tạo hoặc giải đáp các thắc mắc xoay quanh "Công thức" (Recipe). Điều này giúp code gọn gàng, tránh bị phân tán (Coincidental Cohesion).

## 2. Mức độ Coupling (Phụ thuộc)
**Đánh giá:** Data Coupling
**Giải thích:**
- Khi module AI Chef tương tác với External API của ChatGPT, nó không truyền toàn bộ Database sang, mà chỉ truyền những tham số cần thiết (List of ingredients) bằng định dạng chuỗi JSON. Điều này tạo ra sự lỏng lẻo tuyệt đối giữa App và nền tảng AI bên thứ ba.
