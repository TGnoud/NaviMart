# Đánh giá Coupling & Cohesion - Module 4 (Pantry)

## 1. Mức độ Cohesion (Gắn kết)
**Đánh giá:** Functional Cohesion
**Giải thích:**
- Module Pantry tập hợp tất cả các method liên quan đến vòng đời thực phẩm: Thêm vào tủ, cập nhật số lượng, trừ số lượng, quản lý hạn sử dụng.
- Tất cả các thao tác đều xoay quanh một mục đích cốt lõi là Quản lý Kho lưu trữ (Pantry).

## 2. Mức độ Coupling (Phụ thuộc)
**Đánh giá:** Data Coupling
**Giải thích:**
- `Pantry` là trạm trung chuyển dữ liệu được nhiều module khác (như Meals, Shopping) gọi tới.
- Nó chỉ nhận/trả tham số `List<Ingredient>` hoặc `FoodID` thông qua các API công khai chứ không chia sẻ chung bộ nhớ hay dữ liệu Database thô, tuân thủ đúng nguyên lý Information Hiding.
