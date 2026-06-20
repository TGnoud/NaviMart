# Phân chia công việc (WBS 3 Levels)

| Level | WBS | Task Description | Assigned To | Start | End | Notes | Chi phí |
| :---: | :---: | :--- | :---: | :---: | :---: | :--- | :--- |
| **1** | **1** | **Sprint 1: Prototype Core - Khởi tạo & Auth** | | **26/03/2026** | **01/04/2026** | Giai đoạn khởi tạo | |
| 2 | 1.1 | Setup Project | | 26/03/2026 | 27/03/2026 | | |
| 3 | 1.1.1 | Setup Frontend (React/Flutter) | C | 26/03/2026 | 27/03/2026 | | |
| 3 | 1.1.2 | Setup Backend (NodeJS/Java) | A | 26/03/2026 | 27/03/2026 | | |
| 2 | 1.2 | Khởi tạo Database | | 27/03/2026 | 28/03/2026 | | |
| 3 | 1.2.1 | Thiết kế sơ đồ ERD chi tiết | B | 27/03/2026 | 27/03/2026 | | |
| 3 | 1.2.2 | Viết script tạo bảng & chạy SQL | B | 28/03/2026 | 28/03/2026 | | |
| 2 | 1.3 | Xây dựng Shared Components | | 28/03/2026 | 31/03/2026 | | |
| 3 | 1.3.1 | Xây dựng Design System cơ bản | D | 28/03/2026 | 29/03/2026 | | |
| 3 | 1.3.2 | Code các Component (Button - Input - Modal) | D | 30/03/2026 | 31/03/2026 | | |
| 2 | 1.4 | Tính năng Đăng ký / Đăng nhập (Auth) | | 28/03/2026 | 01/04/2026 | | |
| 3 | 1.4.1 | Thiết kế UI màn hình Auth | D | 28/03/2026 | 29/03/2026 | | |
| 3 | 1.4.2 | Code giao diện Auth Frontend | C | 29/03/2026 | 30/03/2026 | | |
| 3 | 1.4.3 | Viết API xử lý Đăng ký/Đăng nhập | A | 29/03/2026 | 30/03/2026 | | |
| 3 | 1.4.4 | Cấu hình bảo mật JWT Auth | A | 30/03/2026 | 31/03/2026 | | |
| 3 | 1.4.5 | Ghép API vào UI Auth | C | 31/03/2026 | 01/04/2026 | | |
| 2 | 1.5 | Kiểm thử Sprint 1 | | 30/03/2026 | 01/04/2026 | | |
| 3 | 1.5.1 | Viết Test case cho tính năng Auth | E | 30/03/2026 | 31/03/2026 | | |
| 3 | 1.5.2 | Thực thi test, log bug & verify | E | 31/03/2026 | 01/04/2026 | | |
| **1** | **2** | **Sprint 2: Prototype Core - Family & Pantry** | | **02/04/2026** | **08/04/2026** | Tính năng Gia đình & Tủ bếp | |
| 2 | 2.1 | Tính năng Quản lý Gia đình (Family) | | 02/04/2026 | 06/04/2026 | | |
| 3 | 2.1.1 | UI/UX luồng Tạo/Tham gia gia đình | D | 02/04/2026 | 03/04/2026 | | |
| 3 | 2.1.2 | API Tạo gia đình & Mời thành viên | B | 03/04/2026 | 04/04/2026 | | |
| 3 | 2.1.3 | Code UI & Ghép API Family | C | 04/04/2026 | 06/04/2026 | | |
| 2 | 2.2 | Tính năng Quản lý Tủ bếp (Pantry) | | 04/04/2026 | 08/04/2026 | | |
| 3 | 2.2.1 | UI/UX Danh sách thực phẩm & Thêm mới | D | 04/04/2026 | 05/04/2026 | | |
| 3 | 2.2.2 | API CRUD Nguyên liệu tủ bếp | A | 05/04/2026 | 06/04/2026 | | |
| 3 | 2.2.3 | Tính năng Quét mã vạch (Demo) | C | 06/04/2026 | 07/04/2026 | | |
| 3 | 2.2.4 | Ghép API Quản lý tủ bếp | C | 07/04/2026 | 08/04/2026 | | |
| 2 | 2.3 | Kiểm thử Sprint 2 | | 06/04/2026 | 08/04/2026 | | |
| 3 | 2.3.1 | Viết Test case Family & Pantry | E | 06/04/2026 | 07/04/2026 | | |
| 3 | 2.3.2 | Thực thi test & Kiểm tra chéo | E | 07/04/2026 | 08/04/2026 | | |
| **1** | **3** | **Sprint 3: Review Prototype 1 & Shopping List**| | **09/04/2026** | **15/04/2026** | Đánh giá Core & Mua sắm | |
| 2 | 3.1 | Review Prototype 1 (Core) | | 09/04/2026 | 12/04/2026 | | |
| 3 | 3.1.1 | Meeting Demo sản phẩm với User/Client | A | 09/04/2026 | 09/04/2026 | | |
| 3 | 3.1.2 | Cải thiện UI/UX theo feedback | D | 10/04/2026 | 11/04/2026 | | |
| 3 | 3.1.3 | Fix bug logic Auth/Family/Pantry | B | 10/04/2026 | 12/04/2026 | | |
| 2 | 3.2 | Tính năng Danh sách mua sắm (Shopping List) | | 10/04/2026 | 15/04/2026 | | |
| 3 | 3.2.1 | UI/UX Danh sách mua sắm chung | D | 10/04/2026 | 11/04/2026 | | |
| 3 | 3.2.2 | API CRUD Danh sách mua sắm | B | 11/04/2026 | 13/04/2026 | | |
| 3 | 3.2.3 | Code UI & Ghép API Shopping List | C | 12/04/2026 | 14/04/2026 | | |
| 3 | 3.2.4 | Xử lý logic chuyển đồ đã mua vào Tủ bếp | A | 13/04/2026 | 15/04/2026 | | |
| 2 | 3.3 | Kiểm thử Sprint 3 | | 14/04/2026 | 15/04/2026 | | |
| 3 | 3.3.1 | Test luồng Shopping -> Pantry | E | 14/04/2026 | 15/04/2026 | | |
| **1** | **4** | **Sprint 4: Prototype Main - Recipes AI** | | **16/04/2026** | **22/04/2026** | Tính năng Cốt lõi AI | |
| 2 | 4.1 | Tính năng Kho Công Thức | | 16/04/2026 | 20/04/2026 | | |
| 3 | 4.1.1 | Cấu trúc DB lưu trữ Recipe | B | 16/04/2026 | 17/04/2026 | | |
| 3 | 4.1.2 | API lấy danh sách & Chi tiết công thức | B | 17/04/2026 | 19/04/2026 | | |
| 3 | 4.1.3 | UI/UX Danh sách công thức nấu ăn | D | 16/04/2026 | 18/04/2026 | | |
| 3 | 4.1.4 | Code UI hiển thị công thức | C | 18/04/2026 | 20/04/2026 | | |
| 2 | 4.2 | Tích hợp AI (Gợi ý món ăn) | | 18/04/2026 | 22/04/2026 | | |
| 3 | 4.2.1 | Thiết kế Prompt AI cho Gợi ý món ăn | A | 18/04/2026 | 19/04/2026 | | |
| 3 | 4.2.2 | API gọi OpenAI/Gemini phân tích Tủ bếp | A | 19/04/2026 | 21/04/2026 | | |
| 3 | 4.2.3 | UI/UX Chatbot/Màn hình gợi ý AI | D | 19/04/2026 | 20/04/2026 | | |
| 3 | 4.2.4 | Ghép API AI vào Frontend | C | 20/04/2026 | 22/04/2026 | | |
| 2 | 4.3 | Kiểm thử Sprint 4 | | 21/04/2026 | 22/04/2026 | | |
| 3 | 4.3.1 | Test độ chính xác của AI Prompt | E | 21/04/2026 | 22/04/2026 | | |
| **1** | **5** | **Sprint 5: Review Prototype 2 & Meal Planner**| | **23/04/2026** | **29/04/2026** | Lên thực đơn & Review AI | |
| 2 | 5.1 | Review Prototype 2 (Main) | | 23/04/2026 | 26/04/2026 | | |
| 3 | 5.1.1 | Meeting Demo AI & Recipe | A | 23/04/2026 | 23/04/2026 | | |
| 3 | 5.1.2 | Fine-tune Prompt AI theo feedback | A | 24/04/2026 | 25/04/2026 | | |
| 3 | 5.1.3 | Sửa UI/UX phần hiển thị AI | D | 24/04/2026 | 26/04/2026 | | |
| 2 | 5.2 | Tính năng Lên Lịch Bữa Ăn (Meal Planner) | | 24/04/2026 | 29/04/2026 | | |
| 3 | 5.2.1 | UI/UX Lịch ăn (Calendar view) | D | 24/04/2026 | 25/04/2026 | | |
| 3 | 5.2.2 | API CRUD Lên lịch bữa ăn | B | 25/04/2026 | 27/04/2026 | | |
| 3 | 5.2.3 | Code Frontend UI Calendar | C | 26/04/2026 | 28/04/2026 | | |
| 3 | 5.2.4 | Auto tạo Shopping List từ Meal Plan | B | 27/04/2026 | 29/04/2026 | | |
| 2 | 5.3 | Kiểm thử Sprint 5 | | 28/04/2026 | 29/04/2026 | | |
| 3 | 5.3.1 | Test logic Meal Plan -> Shopping | E | 28/04/2026 | 29/04/2026 | | |
| **1** | **6** | **Sprint 6: Prototype Full - Reports & Admin** | | **30/04/2026** | **06/05/2026** | Thống kê & Quản trị | |
| 2 | 6.1 | Tính năng Thống kê (Reports) | | 30/04/2026 | 04/05/2026 | | |
| 3 | 6.1.1 | API tổng hợp dữ liệu chi tiêu & tiêu thụ | B | 30/04/2026 | 02/05/2026 | | |
| 3 | 6.1.2 | UI/UX Vẽ biểu đồ thống kê | D | 30/04/2026 | 01/05/2026 | | |
| 3 | 6.1.3 | Code Frontend tích hợp thư viện Chart | C | 01/05/2026 | 04/05/2026 | | |
| 2 | 6.2 | Tính năng Admin Portal | | 30/04/2026 | 05/05/2026 | | |
| 3 | 6.2.1 | API Quản lý User & Cấu hình hệ thống | A | 30/04/2026 | 02/05/2026 | | |
| 3 | 6.2.2 | UI/UX Trang Dashboard Admin | D | 01/05/2026 | 02/05/2026 | | |
| 3 | 6.2.3 | Code CMS quản trị dữ liệu | C | 03/05/2026 | 05/05/2026 | | |
| 2 | 6.3 | Kiểm thử Sprint 6 | | 05/05/2026 | 06/05/2026 | | |
| 3 | 6.3.1 | Test báo cáo số liệu & Quyền Admin | E | 05/05/2026 | 06/05/2026 | | |
| **1** | **7** | **Sprint 7: Review Prototype 3 & Release** | | **07/05/2026** | **13/05/2026** | Kiểm thử cuối & Triển khai | |
| 2 | 7.1 | Review Prototype 3 (Full) | | 07/05/2026 | 10/05/2026 | | |
| 3 | 7.1.1 | Meeting Demo phiên bản Full | A | 07/05/2026 | 07/05/2026 | | |
| 3 | 7.1.2 | Sửa lỗi Bug Fixing toàn hệ thống | C | 08/05/2026 | 10/05/2026 | | |
| 3 | 7.1.3 | Refactor Code & Optimize Backend | B | 08/05/2026 | 10/05/2026 | | |
| 2 | 7.2 | Viết tài liệu Hướng dẫn sử dụng | | 10/05/2026 | 12/05/2026 | | |
| 3 | 7.2.1 | Biên soạn User Manual (PDF) | E | 10/05/2026 | 11/05/2026 | | |
| 3 | 7.2.2 | Viết Release Notes & API Specs | A | 11/05/2026 | 12/05/2026 | | |
| 2 | 7.3 | Kiểm thử UAT & Triển khai | | 11/05/2026 | 13/05/2026 | | |
| 3 | 7.3.1 | Kiểm thử tổng thể User Acceptance Test | E | 11/05/2026 | 12/05/2026 | | |
| 3 | 7.3.2 | Cấu hình VPS & CI/CD Pipeline | A | 11/05/2026 | 12/05/2026 | | |
| 3 | 7.3.3 | Triển khai Production (Go Live) | A | 13/05/2026 | 13/05/2026 | | |
