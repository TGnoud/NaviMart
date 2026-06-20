# NaviMart — Todo List

> Cập nhật lần cuối: **12/06/2026**. Cách chạy app & test: xem `README.md`.

## Tóm tắt phần đã hoàn thành

Toàn bộ yêu cầu nghiệp vụ trong `Topic.pdf` đã chạy được end-to-end (build + unit 5/5 + e2e 6/6 pass):

- **Backend NestJS + MongoDB**: auth (JWT + refresh, quên mật khẩu), nhóm gia đình (mã mời, phân quyền), danh sách mua sắm (complete → tự nhập kho tủ lạnh), tủ lạnh (consume/waste, cron nhắc hết hạn), công thức (CRUD + kiểm duyệt, favorites, gợi ý theo % nguyên liệu có sẵn), kế hoạch bữa ăn (tạo danh sách đi chợ từ nguyên liệu thiếu), báo cáo, admin (users/catalog/foods/duyệt công thức/stats), catalog public + barcode, **realtime socket.io** (danh sách mua sắm + thông báo), **AI Chef** (TimelyGPT, prompt kèm tủ lạnh thật).
- **Frontend React + Vite**: 23 trang nối API thật, AuthContext + ProtectedRoute, autocomplete từ catalog, scanner mã vạch (camera @zxing), trang admin, trang tạo công thức, quên mật khẩu, **code-split theo trang** (bundle khởi tạo 985KB → ~277KB) + **loading skeleton** thay spinner.

---

## ⚠️ Các phần đang DEMO / LÀM TẠM (cần hoàn thiện)

Đây là những chỗ hiện chạy được nhưng chỉ ở mức demo hoặc giải pháp tạm:

| # | Hạng mục | Hiện trạng tạm | Việc cần làm |
|---|---|---|---|
| T1 | **Gửi email (SMTP)** | Quên mật khẩu & xác thực email hoạt động nhưng token hiển thị thẳng trên màn hình (`devResetToken` — chỉ bật khi NODE_ENV≠production) | Tích hợp SMTP (nodemailer + Gmail/SendGrid), gửi token qua email, ẩn dev token; thêm UI xác thực email (backend đã có sẵn `POST /auth/send-verification`, `verify-email`) |
| T2 | **Push notification ngoài app** | Thông báo realtime chỉ hiện khi đang mở tab (socket + browser Notification) | Web Push chuẩn: service worker + VAPID keys (`web-push`), đăng ký subscription, gửi push từ cron kể cả khi đóng tab |
| T3 | **Social login Google/Facebook** | Nút trên trang Login/Register chỉ là trang trí, bấm không làm gì | Hoặc implement OAuth thật (passport-google-oauth20), hoặc bỏ nút đi cho gọn |
| T4 | **QR mã mời gia đình** | Ảnh QR tạo bằng dịch vụ bên thứ 3 (api.qrserver.com — gửi mã mời ra ngoài); quét QR bằng điện thoại không tự join (vẫn phải nhập mã tay) | Tạo QR cục bộ (lib `qrcode`), QR encode deep-link `/family?invite=<code>` và app tự điền/join khi mở link |
| T5 | **Upload ảnh** | Avatar, ảnh công thức chỉ nhận URL; ô "Chụp hoặc tải ảnh lên" trong Thêm thực phẩm là trang trí | Endpoint upload (multer, lưu local hoặc S3/Cloudinary) + input file ở EditProfile / RecipeEditor / AddItem |
| T6 | **Trang Settings** | Dark mode & ngôn ngữ chỉ đổi client-side, không lưu; cài đặt thông báo chưa nối backend | Nối với `PATCH /users/me` (backend đã có `notificationSettings`: expiryReminder, expiryReminderDays, shoppingReminder); lưu theme vào localStorage |
| T7 | **Link chết / nút trang trí** | Profile→"Quyền riêng tư & Bảo mật", footer Home ("Về chúng tôi/Chính sách/Hướng dẫn"), nút mic + đính kèm trong AI Chef | Làm trang thật hoặc gỡ bỏ |
| T8 | **Đơn vị tính hardcode** | Dropdown đơn vị trong "Thêm thực phẩm" là danh sách cứng | Lấy từ `GET /catalog/units` (admin quản lý được) |
| T9 | **MongoDB dev** | Đang chạy bằng binary cache của mongodb-memory-server (`--dbpath .mongodb-data`) | Đủ dùng cho dev; khi deploy chuyển sang MongoDB service/Atlas/Docker (xem D1) |
| T10 | **Scanner chỉ tra catalog nội bộ** | Mã vạch lạ → "không tìm thấy" (admin phải tự thêm barcode) | Tùy chọn: tra thêm OpenFoodFacts API khi không có trong catalog; tính năng quét hóa đơn (OCR) của design cũ chưa làm |

## 🧪 Chất lượng & kiểm thử

- [x] ~~**Q1. Mở rộng test backend**~~ ✅ **Xong 12/06/2026** — `test/extended-flows.e2e-spec.ts`: 16 test mới (tổng e2e 22/22) phủ suggestions, favorites, kiểm duyệt công thức, admin users/catalog/stats + ban/unban, catalog public + barcode, users/me, forgot/reset password, websocket (nhận `shoppingList:updated` thật + từ chối token sai), ai-chef status; **khóa contract** response shape `{shoppingList, missingSummary}` và `{shoppingList, pantryItems}` (regression cho bug 12/06). *Còn thiếu: unit test riêng cho suggestion scoring + mock TimelyGPT cho /ai-chef/chat.*
- [x] ~~**Q2. Test frontend**~~ ✅ **Xong 12/06/2026** — vitest + jsdom + React Testing Library (`npm test` trong frontend): 9 test cho `api/client.ts` (lưu token, query params, 401→refresh→retry, refresh fail→clear session + event) và `FoodAutocomplete` (debounce, chọn gợi ý, Enter submit). *Mở rộng dần cho các page khi có thời gian.*
- [ ] **Q3. Rate limiting & bảo mật**: @nestjs/throttler cho auth + ai-chef (chống spam LLM tốn phí), helmet, giới hạn kích thước payload.
- [ ] **Q4. Sửa item danh sách mua sắm trong UI**: hiện chỉ đổi được số lượng/tick — thêm sửa đơn vị, ghi chú, danh mục.
- [ ] **Q5. Phân trang/lazy-load** cho danh sách dài (pantry, recipes, notifications) — hiện tải toàn bộ.

## 🚀 Triển khai

- [ ] **D1. Docker hóa**: `docker-compose.yml` (mongo + backend + frontend nginx), Dockerfile multi-stage cho từng phần.
- [ ] **D2. CI (GitHub Actions)**: chạy build + unit + e2e (memory mongo) trên mỗi PR.
- [ ] **D3. Cấu hình production**: JWT secrets thật, CORS theo domain, tắt dev token (NODE_ENV=production), HTTPS; **rotate TIMELY_API_KEY** trước khi public (key đang nằm trong .env local).
- [ ] **D4. Seed dữ liệu phong phú hơn**: thêm foods/recipes/barcode thật cho demo đẹp (hiện 16 foods, 5 recipes).

## 💡 Ý tưởng mở rộng (sau khi xong phần trên)

- AI Chef nâng cao: tự động thêm món được gợi ý vào meal plan / tạo danh sách đi chợ từ câu trả lời (tool-calling — API TimelyGPT có `tool_call_required` nhưng chưa dùng).
- Thống kê chi tiêu theo tiền (cần thêm trường giá khi mua hàng).
- PWA (cài lên màn hình điện thoại, offline cache).
- Đa ngôn ngữ (i18n) — hiện toàn bộ UI là tiếng Việt cứng.
