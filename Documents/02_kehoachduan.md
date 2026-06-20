# Bảng Phân Chia Công Việc & Sprint (Work Breakdown Structure)
*Áp dụng Mô hình Nguyên mẫu (Prototyping)*

- **Nhân sự tham gia (5 người)**:
  - **A**: Lead / Backend Developer / DevOps
  - **B**: Backend Developer / Database
  - **C**: Frontend Developer
  - **D**: Frontend Developer / UI/UX
  - **E**: QA / Tester / Docs
- **Thời gian**: 26/03 - 13/05 (7 Sprint, mỗi Sprint 1 tuần)

Dưới đây là chi tiết các Task kết hợp quy trình Prototype (Review - Sửa lỗi theo feedback), phân chia cho 5 thành viên (A, B, C, D, E):

| Level | Task ID (WBS) | TASK NAME | FEATURE TYPE | RESPONSIBLE | STORY POINTS | START | FINISH | DURATION (DAYS) | STATUS | COMMENTS |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | **1** | **Sprint 1: Prototype Core - Khởi tạo & Auth** | **Phase** | **A, B, C, D, E** | **-** | **26/03** | **01/04** | **7** | **To Do** | **Xây dựng khung dự án** |
| 2 | 1.1 | Setup project Frontend (React/Flutter) | Infrastructure | C | 2 | 26/03 | 27/03 | 2 | To Do | |
| 2 | 1.2 | Setup project Backend (NodeJS/Java) | Infrastructure | A | 2 | 26/03 | 27/03 | 2 | To Do | |
| 2 | 1.3 | Khởi tạo Database (chạy script SQL) | Database | B | 3 | 27/03 | 28/03 | 2 | To Do | |
| 2 | 1.4 | Xây dựng Shared Components (UI) | Frontend | D | 5 | 27/03 | 31/03 | 5 | To Do | Dùng thư viện UI |
| 2 | 1.5 | API Đăng ký, Đăng nhập & JWT Auth | Backend | A | 5 | 28/03 | 31/03 | 4 | To Do | |
| 2 | 1.6 | UI Đăng ký, Đăng nhập (Email/Social) | Frontend | C | 5 | 29/03 | 01/04 | 4 | To Do | |
| 2 | 1.7 | Lập kế hoạch test & Viết Test cases | QA | E | 3 | 30/03 | 01/04 | 3 | To Do | |
| **1** | **2** | **Sprint 2: Prototype Core - Family & Pantry** | **Phase** | **A, B, C, D, E** | **-** | **02/04** | **08/04** | **7** | **To Do** | **Hoàn thiện Core Modules** |
| 2 | 2.1 | API Tạo Family & Phân quyền | Backend | B | 5 | 02/04 | 05/04 | 4 | To Do | |
| 2 | 2.2 | UI Tạo Family, Mời thành viên | Frontend | C | 5 | 03/04 | 06/04 | 4 | To Do | |
| 2 | 2.3 | API Quản lý tủ bếp (Thêm/Sửa/Xóa) | Backend | A | 5 | 04/04 | 07/04 | 4 | To Do | |
| 2 | 2.4 | UI Quản lý tủ bếp & Quét mã vạch | Frontend | D | 8 | 04/04 | 08/04 | 5 | To Do | Demo quét mã giả lập |
| 2 | 2.5 | Test tính năng Family & Pantry | QA | E | 5 | 06/04 | 08/04 | 3 | To Do | |
| **1** | **3** | **Sprint 3: Review Prototype 1 & Shopping List**| **Phase** | **A, B, C, D, E** | **-** | **09/04** | **15/04** | **7** | **To Do** | **Đánh giá Prototype Core** |
| 2 | 3.1 | Review Prototype 1 (Core) & Nhận Feedback | Meeting | A, B, C, D, E | 2 | 09/04 | 09/04 | 1 | To Do | Lấy ý kiến KH/User |
| 2 | 3.2 | Sửa lỗi/Cải thiện UI/UX từ Feedback | BugFix | C, D | 5 | 10/04 | 12/04 | 3 | To Do | Nâng cấp sau review |
| 2 | 3.3 | API Quản lý danh sách mua sắm | Backend | B | 5 | 10/04 | 13/04 | 4 | To Do | |
| 2 | 3.4 | UI Quản lý danh sách mua sắm | Frontend | C | 5 | 11/04 | 14/04 | 4 | To Do | |
| 2 | 3.5 | Chức năng chuyển đồ đã mua vào Tủ bếp | Fullstack | A, D | 5 | 13/04 | 15/04 | 3 | To Do | |
| 2 | 3.6 | Kiểm thử tính năng Mua sắm & Feedback | QA | E | 4 | 14/04 | 15/04 | 2 | To Do | |
| **1** | **4** | **Sprint 4: Prototype Main - Recipes AI** | **Phase** | **A, B, C, D, E** | **-** | **16/04** | **22/04** | **7** | **To Do** | **Tính năng cốt lõi (AI)** |
| 2 | 4.1 | Tích hợp AI (Gemini/OpenAI) gợi ý công thức | Backend | A | 8 | 16/04 | 20/04 | 5 | To Do | Core feature |
| 2 | 4.2 | UI Gợi ý công thức nấu ăn từ Tủ bếp | Frontend | D | 8 | 17/04 | 21/04 | 5 | To Do | Thiết kế Chat/Gợi ý |
| 2 | 4.3 | API Kho công thức cơ bản & Đánh giá | Backend | B | 5 | 18/04 | 21/04 | 4 | To Do | |
| 2 | 4.4 | UI Quản lý công thức yêu thích | Frontend | C | 5 | 19/04 | 22/04 | 4 | To Do | |
| 2 | 4.5 | Test luồng AI gợi ý món ăn | QA | E | 5 | 21/04 | 22/04 | 2 | To Do | Cần test kỹ prompt AI |
| **1** | **5** | **Sprint 5: Review Prototype 2 & Meal Planner** | **Phase** | **A, B, C, D, E** | **-** | **23/04** | **29/04** | **7** | **To Do** | **Đánh giá Prototype Main** |
| 2 | 5.1 | Review Prototype 2 (Main) & Nhận Feedback | Meeting | A, B, C, D, E | 2 | 23/04 | 23/04 | 1 | To Do | Demo Prototype 2 |
| 2 | 5.2 | Fix lỗi AI & cải thiện Recipe từ Feedback | BugFix | A, D | 5 | 24/04 | 26/04 | 3 | To Do | Nâng cấp sau review |
| 2 | 5.3 | API Lên lịch bữa ăn (Meal Planner) | Backend | B | 5 | 24/04 | 27/04 | 4 | To Do | |
| 2 | 5.4 | UI Calendar & Lên lịch bữa ăn | Frontend | C | 8 | 25/04 | 28/04 | 4 | To Do | Hiển thị dạng lịch |
| 2 | 5.5 | Auto tạo DS mua sắm từ Meal Plan | Fullstack | B, C | 5 | 27/04 | 29/04 | 3 | To Do | Logic chuyển đổi recipe |
| 2 | 5.6 | Test Meal Planner & Shopping Sync | QA | E | 4 | 28/04 | 29/04 | 2 | To Do | |
| **1** | **6** | **Sprint 6: Prototype Full - Reports & Admin** | **Phase** | **A, B, C, D, E** | **-** | **30/04** | **06/05** | **7** | **To Do** | **Mở rộng hệ thống** |
| 2 | 6.1 | API Thống kê chi tiêu & tiêu thụ | Backend | B | 5 | 30/04 | 03/05 | 4 | To Do | |
| 2 | 6.2 | UI Dashboard Thống kê (Charts) | Frontend | D | 8 | 01/05 | 05/05 | 5 | To Do | Vẽ biểu đồ |
| 2 | 6.3 | API Admin: Quản lý Users & Master Data | Backend | A | 5 | 30/04 | 03/05 | 4 | To Do | |
| 2 | 6.4 | UI Admin Portal | Frontend | C | 5 | 02/05 | 06/05 | 5 | To Do | |
| 2 | 6.5 | Kiểm thử Dashboard & Admin Portal | QA | E | 5 | 05/05 | 06/05 | 2 | To Do | |
| **1** | **7** | **Sprint 7: Review Prototype 3 & Release** | **Phase** | **A, B, C, D, E** | **-** | **07/05** | **13/05** | **7** | **To Do** | **Review cuối & Ra mắt** |
| 2 | 7.1 | Review Prototype 3 (Full) & Chốt yêu cầu | Meeting | A, B, C, D, E | 2 | 07/05 | 07/05 | 1 | To Do | Demo Prototype 3 (Final) |
| 2 | 7.2 | Sửa lỗi (Bug fixing) từ đợt review cuối | BugFix | C, D | 5 | 08/05 | 10/05 | 3 | To Do | |
| 2 | 7.3 | Tối ưu hóa hiệu năng & Bảo mật API | Backend | A, B | 8 | 08/05 | 11/05 | 4 | To Do | Refactoring code |
| 2 | 7.4 | Viết tài liệu Hướng dẫn sử dụng | Docs | E | 3 | 10/05 | 12/05 | 3 | To Do | User Manual, Release Notes |
| 2 | 7.5 | Kiểm thử tổng thể hệ thống (UAT) | QA | E | 5 | 11/05 | 12/05 | 2 | To Do | Kiểm tra chéo toàn bộ app |
| 2 | 7.6 | Triển khai Production (Launch/Demo) | DevOps | A | 3 | 13/05 | 13/05 | 1 | To Do | Go Live! |

> **Lưu ý để dán vào Excel**: Bạn bôi đen toàn bộ nội dung bảng trên, chọn Copy (Ctrl+C), sau đó vào file Excel, chọn Paste Special -> Text (hoặc Match Destination Formatting) để dữ liệu tự chia cột cho khớp nhé.
