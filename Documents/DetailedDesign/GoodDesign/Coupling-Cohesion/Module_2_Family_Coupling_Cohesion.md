# Đánh giá Coupling & Cohesion - Module 2 (Family)

## 1. Mức độ Cohesion (Gắn kết)
**Đánh giá:** Functional Cohesion
**Giải thích:**
- Mọi chức năng liên quan đến việc tạo nhóm, rời nhóm, mời thành viên đều nằm trọn trong module Family.
- `FamilyController` không chứa bất kỳ logic nào về việc quản lý thực phẩm của nhóm (việc đó để Pantry lo), do đó mức độ chuyên biệt và tập trung vào chức năng là tuyệt đối.

## 2. Mức độ Coupling (Phụ thuộc)
**Đánh giá:** Data Coupling
**Giải thích:**
- Module Family cung cấp dữ liệu cho Module Pantry và Shopping thông qua việc trả về `groupId` dưới dạng tham số cơ bản (Primitive Data Type).
- Không có sự phụ thuộc lẫn lộn (Common Coupling), ví dụ: Pantry không gọi thẳng vào biến private của Family.
