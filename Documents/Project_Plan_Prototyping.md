# Kế Hoạch Dự Án Theo Mô Hình Nguyên Mẫu (Prototyping Model)

Mô hình Nguyên mẫu (Prototyping) tập trung vào việc xây dựng nhanh các tính năng, đưa ra bản mẫu (prototype) cho người dùng trải nghiệm để nhận feedback, sau đó tinh chỉnh lại trước khi hoàn thiện sản phẩm. Dựa trên 9 Module của hệ thống NaviMart, dự án sẽ được chia thành các giai đoạn như sau:

| Giai đoạn (Phase) | Tên Giai Đoạn | Mô Tả Công Việc | Kết Quả Đầu Ra (Deliverable) |
| --- | --- | --- | --- |
| **Phase 1** | **Yêu Cầu & Thiết Kế Nhanh** | Phân tích yêu cầu, thiết kế kiến trúc, database (ERD), UI/UX mockups, API Specs cho toàn bộ hệ thống. | Các tài liệu Detailed Design, UI/UX Mockups, Database Schema. |
| **Phase 2** | **Xây Dựng Prototype 1 (Core)** | Xây dựng các tính năng cốt lõi nhất để hệ thống có thể chạy được: Đăng nhập/Đăng ký (Module 1), Gia đình (Module 2), và Tủ bếp (Module 4), Shared Components (Module 9). | **Prototype 1 (Core)**: Người dùng có thể tạo tài khoản, tạo gia đình, và thêm nguyên liệu vào tủ bếp. |
| **Phase 3** | **Đánh Giá Prototype 1** | Cho khách hàng/nhóm thử nghiệm sử dụng Prototype 1, ghi nhận lỗi, luồng thao tác chưa hợp lý và cải thiện UI/UX. | Danh sách feedback và các thay đổi cần cập nhật. |
| **Phase 4** | **Xây Dựng Prototype 2 (Main)** | Tích hợp tính năng chính trị giá cao nhất: Công thức nấu ăn AI (Module 6), Lên thực đơn (Module 5), và Danh sách mua sắm (Module 3). Kết hợp tinh chỉnh lỗi từ Phase 3. | **Prototype 2 (Main)**: Người dùng có thể gợi ý món ăn qua AI từ đồ trong tủ bếp, lên thực đơn và tạo danh sách đi chợ. |
| **Phase 5** | **Đánh Giá Prototype 2** | Khách hàng trải nghiệm toàn bộ luồng giá trị (Từ nguyên liệu -> AI gợi ý -> Lên thực đơn -> Mua sắm). Ghi nhận phản hồi. | Danh sách feedback, đánh giá độ chính xác của AI. |
| **Phase 6** | **Xây Dựng Prototype 3 (Admin & Reports)** | Hoàn thiện các tính năng cho Admin (Module 8), Thống kê (Module 7). Xử lý các feedback từ Phase 5. | **Prototype 3 (Full)**: Bản đầy đủ tính năng cho User và Admin. |
| **Phase 7** | **Kiểm Thử & Hoàn Thiện (Engineering)** | Tối ưu hóa code (Refactoring), kiểm thử bảo mật, hiệu năng (Performance testing), sửa lỗi cuối cùng. | Sản phẩm hoàn chỉnh (Release Candidate). |
| **Phase 8** | **Triển Khai (Deployment)** | Đưa ứng dụng lên môi trường Production (App Store/Google Play, Vercel/VPS...). | Ứng dụng NaviMart Live. |
