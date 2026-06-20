# NaviMart — Hệ thống đi chợ tiện lợi

Ứng dụng hỗ trợ lập kế hoạch mua sắm, quản lý thực phẩm trong tủ lạnh, lên thực đơn và gợi ý món ăn cho gia đình (đề tài ITSS — xem `Topic.pdf`).

| Thành phần | Công nghệ | Cổng |
|---|---|---|
| Backend | NestJS + MongoDB (Mongoose), JWT, Swagger | `3000` |
| Frontend | React 19 + Vite + TailwindCSS | `5173` |

---

## 1. Yêu cầu môi trường

- **Node.js** ≥ 20
- **MongoDB** — chọn 1 trong 3 cách:
  - MongoDB cài sẵn trên máy (service chạy ở `localhost:27017`), **hoặc**
  - Docker: `docker run -d --name navimart-mongo -p 27017:27017 -v navimart-data:/data/db mongo:8`, **hoặc**
  - Không cài gì cả: dùng binary mà `mongodb-memory-server` tải về (xem mục 2.1).

## 2. Cách chạy app

### 2.0. Cài dependencies (lần đầu)

```powershell
cd backend  ; npm install
cd ../frontend ; npm install
```

### 2.1. Khởi động MongoDB

Nếu không có MongoDB/Docker, dùng binary đã được `mongodb-memory-server` tải về cache (chạy 1 lần `npm run test:e2e` hoặc lệnh node dưới đây sẽ tự tải):

```powershell
# Tải binary nếu chưa có (chỉ cần 1 lần)
cd backend
node -e "const {MongoMemoryServer}=require('mongodb-memory-server'); (async()=>{const m=await MongoMemoryServer.create(); console.log('ready'); await m.stop();})()"

# Chạy MongoDB thật từ binary cache, dữ liệu lưu ở .mongodb-data (giữ qua các lần chạy)
mkdir ..\.mongodb-data -Force
& "node_modules\.cache\mongodb-memory-server\mongod-x64-win32-8.2.6.exe" --dbpath "..\.mongodb-data" --port 27017 --bind_ip 127.0.0.1
```

> Tên file `mongod-x64-win32-<version>.exe` có thể khác tùy phiên bản — xem trong thư mục `backend/node_modules/.cache/mongodb-memory-server/`.

### 2.2. Cấu hình env backend

```powershell
cd backend
Copy-Item .env.example .env
```

Nội dung mặc định đã chạy được ngay (Mongo `localhost:27017`, CORS cho `http://localhost:5173`). Chỉ cần đổi `JWT_*_SECRET` khi triển khai thật.

**AI Chef (tùy chọn):** điền `TIMELY_API_KEY` (TimelyGPT) vào `.env` để bật chat NaviChef — bot biết tủ lạnh của bạn có gì và gợi ý món theo nguyên liệu thật. Không có key thì các tính năng khác vẫn hoạt động bình thường, chỉ trang AI Chef báo chưa cấu hình.

### 2.3. Seed dữ liệu mẫu

```powershell
cd backend
npm run seed
```

Seed tạo: 6 danh mục, 10 đơn vị tính, 16 thực phẩm, 5 công thức nấu ăn (đã duyệt) và **tài khoản admin**:

| Tài khoản | Mật khẩu |
|---|---|
| `admin@navimart.local` | `Admin@12345` |

(Đổi qua biến môi trường `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` nếu muốn.)

### 2.4. Chạy backend + frontend

```powershell
# Terminal 1
cd backend  ; npm run start:dev    # http://localhost:3000/api

# Terminal 2
cd frontend ; npm run dev          # http://localhost:5173
```

- Ứng dụng web: **http://localhost:5173**
- Swagger API docs: **http://localhost:3000/api/docs** (bấm Authorize, dán `accessToken` lấy từ `POST /api/auth/login`)
- Frontend đọc địa chỉ API từ `VITE_API_URL` (mặc định `http://localhost:3000/api` — xem `frontend/.env.example`).

---

## 3. Cách test

### 3.1. Test tự động

```powershell
cd backend
npm test                      # unit tests

# E2E (không cần MongoDB cài sẵn — tự tạo Mongo in-memory; lần đầu sẽ tải binary ~100MB)
$env:E2E_USE_MEMORY_MONGO='true'
npm run test:e2e

# Hoặc dùng MongoDB có sẵn:
$env:E2E_MONGODB_URI='mongodb://localhost:27017'
npm run test:e2e
```

E2E gồm 22 test / 2 suite: `main-flows` (6 luồng chính: đăng ký/family → shopping list → complete nhập kho → pantry expiry → missing ingredients → meal plan + reports) và `extended-flows` (16 test: suggestions, favorites, kiểm duyệt công thức, admin, catalog + barcode, forgot/reset password, websocket realtime, khóa contract response shape).

```powershell
cd frontend
npm test                      # vitest: api client (refresh token...) + components
npm run build                 # type-check (tsc) + build production
```

### 3.2. Test thủ công trên web (theo yêu cầu Topic.pdf)

Đăng ký tài khoản mới (email hoặc SĐT) — hệ thống tự tạo nhóm gia đình. Sau đó test theo các luồng:

**① Quản lý danh sách mua sắm (mục 3.1 + quy trình 4.1)**
1. Menu **Danh sách** → tạo danh sách mới → mở chi tiết.
2. Thêm món bằng ô nhập (gõ tên, Enter), chỉnh số lượng bằng nút +/−.
3. Tick checkbox các món "đã mua" → bấm **"Hoàn thành & nhập kho"**.
4. Kiểm tra: các món đã mua xuất hiện trong **Tủ lạnh** với hạn dùng mặc định.

**② Quản lý tủ lạnh (mục 3.2 + quy trình 4.2)**
1. **Tủ lạnh** → "Thêm thực phẩm": tên, số lượng + đơn vị, hạn dùng, vị trí (tủ đông/tủ mát/kệ khô).
2. Thêm 1 món có hạn dùng còn 1–2 ngày → thấy badge "Còn X ngày" màu cam, và món đó hiện ở mục "Sắp hết hạn" trên **Trang chủ**.
3. Tìm kiếm theo tên, lọc theo vị trí bằng các chip phía trên.
4. Menu ⋮ trên thẻ thực phẩm: "Cập nhật số lượng" (khi nấu ăn), "Bỏ đi (lãng phí)", "Đã dùng hết (Xóa)" — có nút Hoàn tác.
5. Thông báo nhắc hết hạn: cron chạy 8h sáng hàng ngày (đổi `EXPIRY_NOTIFICATION_CRON` trong `.env` thành `* * * * *` để test mỗi phút) → xem chuông **Thông báo**.

**③ Gợi ý món ăn thông minh (mục 3.4 + quy trình 4.3)**
1. Thêm vào tủ lạnh vài nguyên liệu trùng với công thức seed (vd: `Thit bo`, `Ca chua`, `Trung ga`, `Hanh la`... — xem tên chính xác trong Swagger `GET /api/recipes`).
2. **Gợi ý món** → công thức được xếp hạng theo **% nguyên liệu có sẵn**, món "giải cứu" đồ sắp hết hạn lên đầu.
3. Mở chi tiết công thức: nguyên liệu nào thiếu có icon 🛒 viền đỏ → bấm **"Thêm X nguyên liệu thiếu vào danh sách đi chợ"** → tự tạo danh sách mới.
4. Bấm ❤️ để lưu công thức yêu thích.

**④ Kế hoạch bữa ăn (mục 3.3 + quy trình 4.4)**
1. **Bữa ăn** → chọn ngày trong tuần → thêm món vào bữa sáng/trưa/tối (hoặc tạo bữa tùy chỉnh).
2. Bấm "Gợi ý món ăn từ tủ lạnh" trong từng bữa → chấp nhận gợi ý.
3. Với món gắn công thức: "Xem công thức" → tạo danh sách mua sắm cho nguyên liệu thiếu.

**⑤ Nhóm gia đình (mục 2)**
1. **Gia đình** → "Tạo mã mời" → nhận mã + QR (hết hạn sau 24h).
2. Mở cửa sổ ẩn danh, đăng ký tài khoản thứ hai → **Gia đình** → "Nhập mã mời".
3. Quay lại tài khoản chủ hộ: thấy thành viên mới, bật/tắt quyền (tủ lạnh / danh sách / bữa ăn) cho từng người, hoặc xóa thành viên.
4. Đăng nhập thành viên với quyền bị tắt → thao tác tương ứng sẽ bị từ chối (403).

**⑥ Báo cáo & thống kê (mục 3.5)**
1. Sau khi đã mua sắm / tiêu thụ / bỏ đi vài món → mở **Báo cáo**.
2. Kiểm tra: số món đã mua, tỷ lệ hoàn thành mua sắm, tỷ lệ lãng phí, biểu đồ tiêu thụ theo ngày, top tiêu thụ, danh sách thực phẩm bị lãng phí. Chuyển "Tháng này / Tuần này".

**⑦ Trang quản trị (mục 2 — admin)**
1. Đăng nhập `admin@navimart.local` / `Admin@12345` → tự vào `/admin`.
2. **Tổng quan**: số người dùng / gia đình / công thức / chờ duyệt.
3. **Người dùng**: tìm kiếm, đổi vai trò, khóa (banned) / mở tài khoản, vô hiệu hóa. Thử đăng nhập tài khoản bị khóa → bị từ chối.
4. **Duyệt công thức**: tạo công thức pending qua Swagger (`POST /api/recipes` với token housewife) → duyệt/từ chối tại đây; công thức được duyệt mới xuất hiện ở trang Gợi ý món.
5. **Danh mục dữ liệu**: thêm/xóa danh mục thực phẩm và đơn vị tính.

### 3.3. Test API trực tiếp

- Swagger UI: `http://localhost:3000/api/docs` — có sẵn mô tả + ví dụ cho toàn bộ endpoint.
- Postman collection: `backend/docs/postman/`.

---

## 4. Cấu trúc dự án

```
NaviMart/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── auth/             # JWT, guards (role, family permission)
│   │   ├── users/            # GET/PATCH /users/me
│   │   ├── families/         # nhóm gia đình, mã mời, phân quyền
│   │   ├── shopping-lists/   # danh sách đi chợ + complete → pantry
│   │   ├── pantry/           # tủ lạnh, consume/waste, expiry status
│   │   ├── recipes/          # công thức, suggestions, favorites
│   │   ├── meals/            # meal plan, missing ingredients, generate list
│   │   ├── reports/          # dashboard, consumption trends, waste
│   │   ├── notifications/    # inbox + cron nhắc hết hạn
│   │   ├── admin/            # quản trị users/catalog/recipes/stats
│   │   ├── catalog/          # categories, foods, units (schemas)
│   │   ├── inventory-events/ # audit log tồn kho (nguồn dữ liệu reports)
│   │   └── database/seed.ts  # npm run seed
│   └── test/                 # e2e (jest + supertest + mongo in-memory)
└── frontend/                 # React + Vite
    └── src/
        ├── api/              # client fetch + JWT refresh + endpoint theo module
        ├── contexts/         # AuthContext, DialogContext
        ├── components/       # BottomNav, SideNav, ProtectedRoute...
        └── pages/            # 20 màn hình (Home, Pantry, Lists, Meals, Admin...)
```

## 5. Hạn chế hiện tại / việc tiếp theo

Xem mục **"Việc cần làm tiếp theo"** trong `todolist.md`. Đáng chú ý: chưa có real-time (WebSocket) cho danh sách mua sắm, Scanner và AI Chef đang là demo tĩnh, chưa có quên mật khẩu.
