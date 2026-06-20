# NaviMart — Hướng dẫn phát triển nhanh

> Tài liệu này dành cho thành viên nhảy vào dự án lần đầu hoặc cần tra cứu nhanh.  
> Tech stack: **NestJS 11 + MongoDB** (backend) · **React 19 + Vite + Tailwind** (frontend)

---

## 0. Khởi động trong 5 phút

```powershell
# 1. Cài dependencies (chỉ lần đầu)
cd backend  ; npm install
cd ../frontend ; npm install

# 2. Khởi động MongoDB (nếu không có Docker)
cd backend
& "node_modules\.cache\mongodb-memory-server\mongod-x64-win32-8.2.6.exe" `
    --dbpath "..\.mongodb-data" --port 27017 --bind_ip 127.0.0.1

# 3. Cấu hình env
Copy-Item .env.example .env   # chỉnh sửa nếu cần

# 4. Seed dữ liệu
npm run seed

# 5. Chạy song song 2 terminal
cd backend  ; npm run start:dev   # → http://localhost:3000/api (Swagger)
cd frontend ; npm run dev         # → http://localhost:5173
```

**Tài khoản admin mặc định:** `admin@navimart.local` / `Admin@12345`

---

## 1. Cấu trúc dự án

```
NaviMart/
├── backend/src/
│   ├── admin/          # CRUD quản trị (danh mục, thực phẩm, công thức)
│   ├── ai-chef/        # Chat NaviChef (TimelyGPT)
│   ├── auth/           # JWT + Passport (local + refresh token)
│   ├── catalog/        # Danh mục, đơn vị tính, thực phẩm
│   ├── families/       # Gia đình + thành viên
│   ├── inventory/      # Tủ lạnh / tủ bếp theo gia đình
│   ├── notifications/  # Thông báo real-time (Socket.io)
│   ├── recipes/        # Công thức nấu ăn + gợi ý từ nguyên liệu
│   └── users/          # Hồ sơ người dùng + favorites
├── frontend/src/
│   ├── api/            # Axios instances + typed request helpers
│   ├── components/     # UI components tái sử dụng
│   ├── pages/          # Một trang = một folder (lazy-loaded)
│   └── utils/          # Helpers, constants, formatters
└── skills/             # Agent scripts crawl dữ liệu (Cookpad…)
```

---

## 2. Quy trình thêm tính năng mới (backend)

### 2.1 Tạo module NestJS

```bash
# Dùng CLI để scaffold đủ file một lần
npx nest g module   ten-module
npx nest g service  ten-module
npx nest g controller ten-module
```

### 2.2 Checklist cho mỗi module

- [ ] Schema Mongoose → `*.schema.ts` (thêm index nếu query theo field đó)
- [ ] DTO validation → `*.dto.ts` dùng `class-validator`
- [ ] Guard phân quyền → dùng `@Roles()` + `RolesGuard` đã có sẵn
- [ ] Swagger annotation → `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`
- [ ] Export service nếu module khác cần dùng

### 2.3 Pattern service chuẩn

```typescript
// Luôn trả về entity đã populate — tránh N+1
async findAll(): Promise<FooDocument[]> {
  return this.fooModel.find().populate('relatedField').exec();
}

// Ném HttpException thay vì trả null
async findOne(id: string): Promise<FooDocument> {
  const doc = await this.fooModel.findById(id);
  if (!doc) throw new NotFoundException(`Foo #${id} not found`);
  return doc;
}
```

---

## 3. Quy trình thêm tính năng mới (frontend)

### 3.1 Thêm trang mới

```
frontend/src/pages/TenTrang/
├── index.tsx          # export default component
├── TenTrang.tsx       # logic chính
└── components/        # sub-components chỉ dùng ở trang này
```

Đăng ký route trong `App.tsx` (hoặc router config):

```tsx
<Route path="/ten-trang" element={<LazyPage page="TenTrang" />} />
```

### 3.2 Gọi API

```typescript
// frontend/src/api/tenModule.ts
import { api } from './client';    // axios instance đã có interceptor JWT

export const getFoos = () => api.get<Foo[]>('/foos');
export const createFoo = (dto: CreateFooDto) => api.post<Foo>('/foos', dto);
```

### 3.3 State management

- Dữ liệu server → dùng `useState` + `useEffect` (hoặc React Query nếu đã import)
- Trạng thái global nhẹ (auth, theme) → Context đã có trong `src/context/`
- Không thêm Redux / Zustand trừ khi thực sự cần

---

## 4. Biến môi trường quan trọng

| Biến | Mặc định | Mô tả |
|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017/navimart` | Kết nối MongoDB |
| `JWT_ACCESS_SECRET` | `dev-secret` | **Đổi khi deploy** |
| `JWT_REFRESH_SECRET` | `dev-refresh-secret` | **Đổi khi deploy** |
| `TIMELY_API_KEY` | _(trống)_ | AI Chef — để trống thì tắt tính năng |
| `CLOUDINARY_*` | _(trống)_ | Upload ảnh — cần khi test upload |
| `FRONTEND_URL` | `http://localhost:5173` | CORS whitelist |

---

## 5. Chạy tests

```powershell
# Backend — unit tests
cd backend ; npm test

# Backend — coverage
cd backend ; npm run test:cov

# Backend — e2e (cần MongoDB hoặc memory server)
cd backend ; npm run test:e2e

# Frontend — unit tests (Vitest)
cd frontend ; npm test

# Frontend — e2e (Playwright, cần app đang chạy)
cd frontend ; npm run test:e2e
```

> **Lưu ý e2e backend:** test sẽ tự dùng `mongodb-memory-server`; set biến `USE_MEMORY_MONGO=true` nếu cần override.

---

## 6. Swagger & debug API

Sau khi backend chạy: [http://localhost:3000/api](http://localhost:3000/api)

- Dùng "Authorize" (🔒) → paste Bearer token lấy từ `POST /auth/login`
- Mọi endpoint đều có schema response — test trực tiếp trên Swagger trước khi viết frontend

---

## 7. Dữ liệu mẫu & seed

```powershell
cd backend
npm run seed          # reset + seed mặc định
npm run seed:recipes  # chỉ seed công thức (nếu có script riêng)
```

File JSON crawl từ Cookpad: `cookpad_recipes_full.json` ở root dự án — có thể import thêm bằng script trong `skills/`.

---

## 8. Luồng auth

```
Login → POST /auth/login → { accessToken, refreshToken }
         ↓
   Lưu accessToken vào memory (không localStorage)
   Lưu refreshToken vào httpOnly cookie (backend tự set)
         ↓
   Mọi request → Authorization: Bearer <accessToken>
         ↓
   Token hết hạn → POST /auth/refresh → accessToken mới
```

Guard có sẵn: `@UseGuards(JwtAuthGuard)` (xác thực) · `@Roles('admin')` (phân quyền)

---

## 9. WebSocket / Thông báo real-time

```typescript
// Backend — emit từ service bất kỳ
constructor(private notifService: NotificationsService) {}
this.notifService.sendToUser(userId, { type: 'INVENTORY_LOW', payload });

// Frontend — subscribe
import { useSocket } from '@/hooks/useSocket';
const { on } = useSocket();
useEffect(() => on('INVENTORY_LOW', handler), []);
```

---

## 10. Hotkeys & tips

| Tình huống | Lệnh |
|---|---|
| Xem log MongoDB query | thêm `DEBUG=mongoose` vào `.env` |
| Xem Swagger schema đầy đủ | `/api-json` (JSON) hoặc `/api-yaml` |
| Reload backend không restart | `npm run start:dev` dùng watch mode — lưu file là reload |
| Kiểm tra bundle size frontend | `npm run build -- --report` |
| Format code | `npm run lint` (ESLint + Prettier) ở cả hai thư mục |

---

## 11. Checklist trước khi push

- [ ] `npm run lint` không có lỗi
- [ ] `npm test` pass (ít nhất unit tests)
- [ ] Không commit file `.env` thật, key, mật khẩu
- [ ] Swagger doc còn đúng với API thực tế
- [ ] Migration / seed script nếu schema thay đổi
