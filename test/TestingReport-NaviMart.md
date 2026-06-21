# Tài liệu kiểm thử phần mềm — HỆ THỐNG NAVIMART

**Phiên bản 0.0.1** · Môn: Phát triển phần mềm theo chuẩn kỹ năng ITSS

> Tài liệu này được xây dựng theo cùng cấu trúc với template kiểm thử chuẩn ITSS (tham chiếu
> ISO/IEC/IEEE 29119-3), nhưng ánh xạ sang đúng công nghệ của NaviMart: **backend NestJS + Jest**
> và **frontend React + Vitest**. Khác với template gốc (chỉ tính backend), tài liệu này **bao gồm cả
> frontend** trong phạm vi.

---

## Contents

1. Giới thiệu và mục đích tài liệu
2. Căn cứ xây dựng tài liệu và định hướng ITSS
3. Tổng quan hệ thống và phạm vi kiểm thử
4. Chiến lược kiểm thử
5. Môi trường, công cụ và dữ liệu kiểm thử
6. Thiết kế testcase và ma trận kiểm thử
7. Unit Test
8. API/Controller Test
9. Security Test
10. Integration / E2E Test
11. Kết quả thực thi và coverage
12. Rủi ro, lỗi phát hiện và tiêu chí đóng
13. Đánh giá mức độ đáp ứng ITSS
14. Kết luận và kế hoạch cải tiến
- Phụ lục A. Danh mục testcase chi tiết
- Phụ lục B. Checklist chạy và nghiệm thu

---

## 1. Giới thiệu và mục đích tài liệu

Tài liệu tổng hợp kế hoạch, thiết kế testcase, thực thi kiểm thử và đánh giá chất lượng cho hệ thống
**NaviMart** — ứng dụng quản lý tủ lạnh/kho thực phẩm gia đình, lập kế hoạch bữa ăn, công thức nấu ăn và
danh sách mua sắm dùng chung trong gia đình. Nội dung theo hướng tài liệu bàn giao: không chỉ ghi nhận
số test pass/fail mà còn giải thích mục tiêu từng loại test, phạm vi, công cụ, dữ liệu test, cách đánh giá,
rủi ro còn tồn tại và điều kiện ký duyệt.

### 1.1. Mục đích kiểm thử

- Xác minh backend NestJS thực hiện đúng các chức năng nghiệp vụ quan trọng (xác thực, gia đình/chia sẻ,
  kho thực phẩm, công thức, kế hoạch bữa ăn, danh sách mua sắm, báo cáo).
- Kiểm tra API contract: route, HTTP method, path/query, validation DTO, response wrapper và error code.
- Kiểm tra logic nghiệp vụ trong service, mapper, helper và các state transition ở mức unit test.
- Kiểm tra authentication/authorization: JwtAuthGuard, FamilyPermissionGuard, RolesGuard và quyền truy cập.
- Kiểm tra persistence và luồng end-to-end bằng app NestJS thật + MongoDB (mongodb-memory-server).
- Kiểm tra frontend React: util thuần, context provider, component định tuyến, lớp gọi API.
- Đo coverage (Jest cho backend, Vitest cho frontend) và đề xuất kế hoạch cải tiến.

### 1.2. Đối tượng sử dụng tài liệu

| Đối tượng | Nhu cầu sử dụng |
|---|---|
| Developer | Hiểu phạm vi test, cách chạy/bổ sung test, lỗi/rủi ro cần xử lý trước khi merge. |
| Tester/QA | Đánh giá testcase, kết quả thực thi, coverage, điều kiện ký duyệt. |
| Project Lead | Ra quyết định về chất lượng bàn giao, ưu tiên P0/P1 và kế hoạch test tiếp theo. |

### 1.3. Phạm vi tổng quát

Phạm vi gồm **backend** (`backend/src`, `backend/test`) và **frontend** (`frontend/src`, `frontend/test`).
Báo cáo coverage Jest (`backend/coverage`) và Vitest. Kiểm thử người dùng cuối thủ công, kiểm thử trình
duyệt tự động (E2E Playwright) và DAST/pentest chuyên sâu hiện **chưa có artifact** (xem mục 14).

---

## 2. Căn cứ xây dựng tài liệu và định hướng ITSS

| Hoạt động | Cách thể hiện trong NaviMart |
|---|---|
| Lập kế hoạch kiểm thử | Mục tiêu, phạm vi, công cụ, môi trường, entry/exit criteria. |
| Thiết kế testcase | Ma trận theo Unit/API/Security/Integration + phụ lục testcase. |
| Triển khai tự động hóa | Jest, ts-jest, @nestjs/testing, supertest, mongodb-memory-server; Vitest, @testing-library, jsdom. |
| Thực thi và ghi nhận bằng chứng | Kết quả `npm run test` / `npm run test:e2e` / `vitest run`, coverage, rủi ro. |
| Đánh giá chất lượng | Kết luận theo từng loại kiểm thử, risk log và tiêu chí đóng. |

---

## 3. Tổng quan hệ thống và phạm vi kiểm thử

### 3.1. Tổng quan Backend

NaviMart backend là hệ thống **NestJS** expose REST API + WebSocket realtime, dùng **JWT (access + refresh)**
stateless và phân quyền theo role (admin/user) cùng permission theo gia đình (FamilyPermissionGuard).
Dữ liệu lưu trên **MongoDB (Mongoose)**.

| Module | Nội dung nghiệp vụ kiểm thử | Có test |
|---|---|---|
| auth | Đăng ký, đăng nhập, refresh/rotate token, logout, forgot/reset password, verify email. | ✓ |
| families | Tạo family, family hiện tại, invite code, join, quản lý quyền thành viên. | ✓ |
| pantry | CRUD item kho, consume/waste, lọc theo trạng thái hết hạn, ghi inventory event. | ✓ |
| meals | Kế hoạch bữa ăn, gắn recipe, missing-ingredients, sinh shopping-list. | ✓ |
| recipes | Tìm kiếm/gợi ý theo độ phủ kho, favorites, duyệt status (admin), CRUD. | ✓ |
| shopping-lists | CRUD list/item, hoàn tất list → đẩy vào pantry. | ✓ |
| reports | Báo cáo tiêu thụ/lãng phí/chi tiêu (aggregate). | ✓ (service) |
| catalog | Danh mục food/category/unit, tìm theo tên/barcode. | ✓ |
| notifications | Thông báo, thông báo hết hạn. | ✓ |
| users | Hồ sơ người dùng, cập nhật profile. | ✓ |
| admin | Quản trị catalog/recipes/stats/users. | ✓ |
| ai-chef | Gợi ý món bằng AI, timely service. | ✗ |
| realtime | Gateway/Service WebSocket. | ✗ (chỉ qua e2e) |
| uploads | Upload ảnh. | ✗ |
| inventory-events | Ghi nhận sự kiện kho. | một phần (qua pantry) |

### 3.2. Trong phạm vi và ngoài phạm vi

| Trong phạm vi | Ngoài phạm vi |
|---|---|
| Logic service, controller, util, mapper, guard, validation, exception. | E2E trình duyệt tự động (Playwright/Cypress) — chưa có artifact. |
| Unit/API test (Jest + supertest), E2E (app thật + mongo in-memory). | DAST/pentest chuyên sâu (OWASP ZAP) — chưa có artifact. |
| Frontend: util, context, component, lớp gọi API (Vitest). | Load/stress/soak thực tế; triển khai production, backup/restore. |
| Authorization ở endpoint rủi ro cao (auth, family, pantry, shopping-list). | |

---

## 4. Chiến lược kiểm thử

| Tầng | Mục tiêu chính | Công cụ | Đặc điểm |
|---|---|---|---|
| Unit Test | Logic service/util/mapper. | Jest + mock model/service | Không chạy Nest context đầy đủ; dependency được mock. |
| API/Controller Test | Route, status, validation, JSON, exception mapping. | supertest + `createApiTestApp` | Service được mock; guard thay bằng mock; tập trung contract. |
| Security Test | 401/403, authority, guard, object-level. | mock guard (contract) + guard thật (e2e) | Service không được gọi khi denied. |
| Integration/E2E | Persistence, luồng nghiệp vụ xuyên module, realtime. | @nestjs/testing + mongodb-memory-server + socket.io-client | Dùng MongoDB thật trong tiến trình; chạy guard thật. |
| Frontend Unit/Component | Hàm thuần, context, component, lớp API. | Vitest + @testing-library + jsdom | Mock fetch/api/socket. |

### 4.1. Nguyên tắc phân tầng test

- Unit Test chứng minh business logic cục bộ, không dùng để kết luận persistence/DB thật.
- Controller/API Test (`*.controller.api.spec.ts`) chứng minh contract ở tầng controller với ValidationPipe
  thật nhưng guard/service được mock — không tự động chứng minh toàn bộ security chain.
- Security Test phải kiểm tra negative path: không token, thiếu quyền, token sai/hết hạn, quyền object-level.
- E2E test dùng app thật + datasource cô lập (mongodb-memory-server) để luồng lặp lại, không phụ thuộc DB local.

### 4.2. Entry criteria và exit criteria

| Nhóm | Entry criteria | Exit criteria |
|---|---|---|
| Unit/API/Security | Mã build được, dependency test sẵn có, spec đã định nghĩa. | Targeted test pass, full `npm run test` pass, không failure/error. |
| E2E | mongodb-memory-server khởi động được, env JWT/secret được set, seed ổn định. | `npm run test:e2e` pass; luồng xuyên module được xác minh. |
| Release QA gate | CI chạy test, coverage/risk được review. | Không còn P0 mở; P1 có kế hoạch xử lý/chấp nhận rủi ro. |

---

## 5. Môi trường, công cụ và dữ liệu kiểm thử

### 5.1. Môi trường quan sát được

| Thành phần | Cấu hình |
|---|---|
| Runtime | Node.js (TypeScript). |
| Backend test | Jest 30 + ts-jest 29, @nestjs/testing 11, supertest 7, socket.io-client 4.8, mongodb-memory-server 11. |
| Frontend test | Vitest 4.1 (jsdom), @testing-library/react 16, jest-dom 6, user-event 14. |
| Database (test) | MongoDB in-memory (`mongodb-memory-server`); có thể trỏ DB ngoài qua `E2E_MONGODB_URI`. |
| Coverage | Jest coverage (backend → `backend/coverage`); Vitest coverage **chưa cấu hình** (xem mục 12). |
| CI hiện tại | **Không có** `.github/workflows` (xem rủi ro TEST-001). |

### 5.2. Lệnh chạy test

```bash
# Backend (thư mục backend/)
npm run test            # toàn bộ unit + API spec
npm run test:cov        # kèm coverage
npm run test:e2e        # e2e (app thật + mongo in-memory)
npx jest --coverage --verbose   # liệt kê từng testcase + coverage

# Frontend (thư mục frontend/)
npm run test            # vitest run (1 lần)
npm run test:watch      # chế độ watch
```

### 5.3. Dữ liệu kiểm thử

| Nguồn | Cách dùng | Rủi ro/ghi chú |
|---|---|---|
| `backend/test/utils/fixtures.ts` | Factory tạo user/family/recipe/pantry item (object thuần). | Tốt cho unit/API; không chứng minh DB thật. |
| `backend/test/utils/mock-model.ts` | `createMockModel`, `mockQuery` mô phỏng Mongoose model. | Mặc định trả null/empty để fail-loud khi quên mock. |
| `backend/test/utils/api-test-app.ts` | `createApiTestApp` dựng 1 controller với guard/pipe thật-mock. | Dùng cho toàn bộ `*.controller.api.spec.ts`. |
| mongodb-memory-server | Cấp MongoDB cô lập cho e2e. | Cần set env trước khi import AppModule; cleanup ở `afterAll`. |
| Frontend mocks | `vi.fn()`/`vi.mock()` cho fetch/api/socket. | Không có MSW; mock gắn chặt implementation. |

---

## 6. Thiết kế testcase và ma trận kiểm thử

### 6.1. Quy ước mã testcase

NaviMart đã áp dụng tiền tố mã ở tầng API; tài liệu chuẩn hóa toàn bộ như sau:

| Prefix | Ý nghĩa | Ví dụ |
|---|---|---|
| `API-AUTH-*` | API/controller test cho auth. | API-AUTH-001 |
| `API-FAM-*` | API test cho families. | API-FAM-003 |
| `API-PAN-*` | API test cho pantry. | API-PAN-005 |
| `API-RCP-*` | API test cho recipes. | API-RCP-005 |
| `API-SL-*` | API test cho shopping-lists. | API-SL-006 |
| `UT-<MOD>-*` | Unit/service/util test theo module. | UT-PAN-009 |
| `SEC-*` | Security/authorization test. | SEC-JWT-001 |
| `E2E-*` | End-to-end (app thật + mongo). | E2E-FLOW-003 |
| `FE-*` | Frontend test (util/context/component/api). | FE-AUTH-001 |

### 6.2. Ma trận truy vết loại kiểm thử

| Module | Unit Test | API Test | Security Test | Integration/E2E |
|---|---|---|---|---|
| auth | ✓ service (21) | ✓ (10) | ✓ 401 (API-AUTH-008) · negative JWT (SEC-JWT-001…005) | ✓ register/refresh/reset flow |
| families | ✓ service (13), util (4) | ✓ (7) | ✓ 403/400 (API-FAM-003/007) | ✓ invite/join flow |
| pantry | ✓ service (15), util (11) | ✓ (8) | ✓ 401/403 (API-PAN-002/003) · object-level (SEC-OBJ-001) | ✓ lọc trạng thái hết hạn · concurrency (INT-CONC-001) |
| meals | ✓ service (11+9+4) | qua e2e | — | ✓ meal → missing → list |
| recipes | ✓ service (19) | ✓ (7) | ✓ 403 sai role (API-RCP-005) | ✓ favorites/suggestions |
| shopping-lists | ✓ service (12) | ✓ (6) | ✓ 403 (API-SL-002) | ✓ complete → pantry |
| reports | ✓ service (3) | qua e2e | — | ✓ tổng hợp báo cáo |
| catalog | ✓ service (6) | ✗ | — | ✓ (đọc trong e2e) |
| users | ✓ service (7) | ✗ | — | ✓ profile flow |
| notifications | ✓ service (8) | ✗ | — | một phần |
| admin | ✓ stats/catalog/recipes/users + controller delegation | ✗ | ✓ (promote trong e2e) | ✓ admin promotion |
| realtime | ✓ gateway/service | — | — | ✓ WebSocket flow |
| concurrency | ✓ (pantry consume unit) | — | — | ✓ INT-CONC-001 (no-oversell) |

### 6.3. Kỹ thuật thiết kế testcase

| Kỹ thuật | Áp dụng trong NaviMart | Ví dụ |
|---|---|---|
| Equivalence Partitioning | Chia dữ liệu hợp lệ/không hợp lệ. | quantity > 0, = 0, < 0, > tồn kho. |
| Boundary Value Analysis | Biên ngày hết hạn, số lượng, cửa sổ cảnh báo. | `warningDays=0` chỉ hôm nay là "expiring"; month rollover. |
| State Transition | Chuyển trạng thái nghiệp vụ. | pantry active→used_up→active; shopping-list →completed. |
| Negative Testing | Input/trạng thái sai. | item not found, hoàn tất list đã completed, sai role. |
| RBAC Matrix | authority/role. | 401 chưa auth, 403 thiếu quyền, 200/201 khi đủ quyền. |
| Concurrency Test | Race condition. | hoàn tất shopping-list / consume pantry đồng thời — **cần bổ sung**. |

---

## 7. Unit Test

### 7.1. Mục tiêu

Kiểm thử logic nghiệp vụ ở mức service/util độc lập. Model Mongoose và service phụ thuộc được mock
(`createMockModel`, `mockQuery`) để test nhanh, cô lập. Phù hợp kiểm tra rule nghiệp vụ, tính toán
trạng thái, mapper và exception/error code.

### 7.2. Auth Service (`auth.service.spec.ts` — 21 testcase, P0)

Nhóm P0 vì liên quan trực tiếp tới xác thực và token. Bao phủ: tạo user + owner family rồi phát token;
duplicate-key → Conflict; sai identifier/password/account inactive → Unauthorized; verify/rotate refresh
token (sai chữ ký, hash không khớp); reset/verify-email (token hợp lệ/sai/hết hạn); không lộ tồn tại tài
khoản khi forgot-password; dev token khi tắt email ở non-production. (Danh mục chi tiết: Phụ lục A.)

### 7.3. Pantry Service + Expiry util (`pantry.service.spec.ts` 14 + `expiry-status.util.spec.ts` 11)

Bao phủ: lọc theo family + regex tên không phân biệt hoa thường; NotFound khi item không thuộc family;
từ chối consume item không active / vượt tồn; đánh dấu used_up khi consume hết và ghi event; reactivate;
thay field từ catalog khi đổi foodId; ghi nhận added/wasted/deleted event. Util: strip giờ về nửa đêm,
cộng ngày không mutate input, phân loại expired/expiring/safe theo cửa sổ cảnh báo (gồm biên `warningDays=0`).

### 7.4. Recipes / Meals / Shopping-lists / Families / Reports Service

- **recipes (19):** xếp hạng theo match ratio + lọc dưới minMatch; ưu tiên item sắp hết hạn; filter
  approved + sort; text search; cờ favorite; tăng/giảm `favoritesCount`; auto-approve khi admin; cấm
  non-admin sửa recipe người khác / đổi status; archive khi remove.
- **meals (11 + missing 9 + generation 4):** lọc theo family + date range, batch tên recipe; match
  ingredient theo foodId/đơn vị/tên; scale theo servings, làm tròn 3 chữ số; bỏ qua optional; clamp 0;
  sinh shopping-list từ missing + broadcast.
- **shopping-lists (12):** CRUD list/item, sync status/boughtAt, stamp completedAt, từ chối hoàn tất list
  đã completed / không có item checked, đẩy item đã mua vào pantry.
- **families (13 + util 4):** tạo owner family + set active; NotFound khi không có active family; join theo
  invite (hash code); cấm tự sửa quyền mình / sửa owner / gán role owner / tự xóa mình.
- **reports (3):** map aggregate ra day/type + top-consumed; gộp wasted-event với item đang hết hạn;
  tổng hợp shopping/pantry/inventory/waste.

---

## 8. API/Controller Test

### 8.1. Mục tiêu

Kiểm tra hợp đồng HTTP ở tầng controller: route, method, path/query, request body, validation
(`ValidationPipe` whitelist + forbidNonWhitelisted + transform), response wrapper và exception mapping.
Dùng `createApiTestApp` (supertest) với guard mock cấu hình được `authState`/`permState`.

### 8.2. Danh mục API Test (đã có)

| Module | Mã | Số case | Kịch bản chính |
|---|---|---|---|
| auth | API-AUTH-001…010 | 10 | register 201; thiếu password 400; field lạ 400; trùng email/phone 409; login 200; sai credential 401; refresh unwrap; logout không token 401; forgot luôn 200; verify token sai 400. |
| families | API-FAM-001…007 | 7 | family hiện tại 200; không có family 404; invite thiếu quyền 403; join sai/hết hạn 404; join khi đã member 409; sửa quyền owner 403; tự sửa quyền 400. |
| pantry | API-PAN-001…008 | 8 | list 200; chưa auth 401; tạo thiếu quyền 403; quantity âm 400; consume ≤0 400; consume vượt tồn 400; không tồn tại 404; waste 200. |
| recipes | API-RCP-001…007 | 7 | tìm kiếm 200; gợi ý 200; missing unwrap servings; archived 404; tạo sai role 403; thiếu name 400; addFavorite 201. |
| shopping-lists | API-SL-001…006 | 6 | tạo 201; thiếu quyền 403; thêm item thiếu quantity 400; list không tồn tại 404; hoàn tất list đã completed 400; hoàn tất hợp lệ 200 kèm pantryItems. |

---

## 9. Security Test

### 9.1. Mục tiêu

Kiểm tra authentication/authorization ở endpoint rủi ro cao. Ở tầng API dùng guard mock để xác minh
mapping 401/403 và "service không được gọi khi denied". Ở tầng e2e chạy **guard thật** với JWT thật.

### 9.2. Danh mục Security Test hiện có và đề xuất bổ sung

| Mã | Mục tiêu | Trạng thái |
|---|---|---|
| API-AUTH-008 | Logout không token → 401, service không gọi | Pass |
| API-PAN-002 | Pantry chưa đăng nhập → 401 | Pass |
| API-PAN-003 | Tạo pantry item thiếu quyền → 403, service không gọi | Pass |
| API-FAM-003 | Tạo invite thiếu quyền → 403 | Pass |
| API-FAM-007 | Tự sửa quyền mình → 400 | Pass |
| API-RCP-005 | Tạo recipe sai role → 403, service không gọi | Pass |
| API-SL-002 | Tạo list thiếu quyền → 403 | Pass |
| family-access.util (4) | Forbidden khi không active/không member/đã removed | Pass |
| SEC-JWT-001 | Không có Authorization header → 401 (guard thật) | Pass |
| SEC-JWT-002 | Bearer token dị dạng → 401 | Pass |
| SEC-JWT-003 | Token ký sai secret → 401 | Pass |
| SEC-JWT-004 | Token hết hạn (đúng secret) → 401 | Pass |
| SEC-JWT-005 | Token hợp lệ nhưng user không tồn tại → 401 | Pass |
| SEC-OBJ-000 | Owner family A đọc item của chính mình → 200 | Pass |
| SEC-OBJ-001 | User family B đọc **item kho** của family A → 404 (không lộ dữ liệu) | Pass |
| SEC-OBJ-002 | User family B đọc **danh sách mua** của family A → 404 | Pass |
| SEC-OBJ-003 | User family B đọc **kế hoạch bữa ăn** của family A → 404 | Pass |
| **SEC-DAST-001** | OWASP ZAP baseline | **Cần bổ sung (ngoài phạm vi hiện tại)** |

> Các test SEC-JWT-* và SEC-OBJ-* nằm trong `backend/test/security.e2e-spec.ts`, chạy qua **Passport
> JWT strategy + guard thật** (không mock). Token âm tính được giả lập bằng `jsonwebtoken` (sai secret /
> hết hạn) ngay trong test.

### 9.3. Nguyên tắc assertion security

- Request không xác thực → 401 và service không được gọi.
- Request có user nhưng thiếu authority/role → 403 và service không được gọi.
- Request đủ quyền → đi tiếp, service được gọi đúng.
- Không gọi trực tiếp controller method để "giả lập" security; phải qua supertest/app thật.
- Bổ sung object-level authorization: user không truy cập được tài nguyên của family/người khác.

---

## 10. Integration / E2E Test

### 10.1. Mục tiêu

Kiểm tra behavior không thể chứng minh bằng mock: persistence, luồng nghiệp vụ xuyên module, guard/JWT
thật, realtime WebSocket. Công cụ: app NestJS thật + `mongodb-memory-server` + `socket.io-client`.

### 10.2. Danh mục E2E hiện có

**`test/main-flows.e2e-spec.ts`** (~10 luồng): register + refresh + đọc family; tạo invite + join family với
user thứ 2; hoàn tất shopping-list → consume pantry; lọc pantry (safe/expiring/expired); recipe missing →
sinh shopping-list; meal → missing → shopping-list → reports.

**`test/extended-flows.e2e-spec.ts`** (~14 luồng): promote user → admin; catalog (category/food theo
tên/barcode/unit); favorites recipe (add/remove + đồng bộ count); suggestions theo độ phủ kho; sinh
shopping-list từ recipe `{ shoppingList, missingSummary }`; sinh từ meal; hoàn tất list trả
`{ shoppingList, pantryItems }`; profile (GET/PATCH, auto displayName); reset password qua dev token;
realtime WebSocket update.

### 10.3. Chuẩn hóa setup

Các file e2e set env (JWT secret, `E2E_USE_MEMORY_MONGO`, cron timing) **trước khi** import AppModule;
`beforeAll` compile module + init app, `afterAll` drop DB + close app + stop mongo. `cloudinary` (dependency
chỉ cần lúc import của module uploads) được map sang stub `test/stubs/cloudinary.ts` qua `moduleNameMapper`
trong `test/jest-e2e.json` để AppModule boot được offline.

### 10.4. Concurrency Test (INT-CONC-001) — phát hiện & sửa lỗi oversell

`backend/test/concurrency.e2e-spec.ts` bắn **5 request consume đồng thời** vào cùng một pantry item tồn kho 2
và kiểm tra bất biến "không oversell" (chỉ 1 request thành công, tồn kho cuối = 0, không âm).

> **Lỗi phát hiện (BUG-CONC-001):** `pantry.service.consume()` ban đầu là read-modify-write
> (`findOne` → kiểm tra → `item.save()`), nên cả 5 request đồng thời đều thành công → trừ kho vượt mức.
> **Đã sửa:** chuyển sang `findOneAndUpdate` nguyên tử với guard `quantity: { $gte }` + aggregation
> pipeline (`updatePipeline: true`) để chỉ một request thắng cuộc khi tồn kho không đủ cho cả hai. Sau khi
> sửa: 1 × 200 + 4 × 400 "exceeds current stock". Đây là tiêu chí đóng của TEST-004.

---

## 11. Kết quả thực thi và coverage

### 11.1. Kết quả regression chính (backend, Jest)

| Chỉ số | Kết quả |
|---|---|
| Test suites (unit/API) | 48 passed / 48 |
| Testcase (unit/API) | 335 passed / 335 |
| Test suites (e2e) | 4 passed / 4 |
| Testcase (e2e) | 32 passed / 32 |
| Failure / Error | 0 / 0 |
| Thời gian | ~9 giây |

Frontend (Vitest): **9 file / 61 testcase — pass toàn bộ**, thời gian ~3.7s.

> So với baseline ban đầu (21/176 unit, 6/32 frontend), bộ test đã bổ sung unit/API test cho catalog,
> users, notifications, admin, uploads, Gmail mail, realtime, guards, config, inventory-events,
> security e2e (SEC-JWT/SEC-OBJ), concurrency e2e (INT-CONC-001), và frontend (api/index, Login page).

### 11.2. Coverage tổng quan backend (Jest — phạm vi unit logic)

| Metric | Tỷ lệ |
|---|---|
| Statements | 88,33% |
| Branch | 71,27% |
| Functions | 84,17% |
| Lines | 89,20% |

> Lưu ý: phạm vi đo unit coverage loại trừ `main.ts`, `*.module.ts` và `database/**` vì đây là bootstrap,
> module wiring và seed/migrate script. Các thành phần này phù hợp hơn với e2e/triển khai thay vì unit test.

### 11.3. Coverage theo module (statements %)

| Module | Stmts % | Đánh giá |
|---|---|---|
| realtime | 100,00% | Đạt |
| config | 100,00% | Đạt |
| inventory-events | 100,00% | Đạt |
| catalog | 100,00% | Đạt |
| reports | 95,94% | Đạt |
| users | 96,15% | Đạt |
| notifications | 96,84% | Đạt |
| auth | 94,38% | Đạt |
| uploads | 90,69% | Đạt |
| pantry | 87,87% | Đạt |
| families | 84,41% | Đạt |
| recipes | 83,26% | Đạt |
| meals | 81,39% | Đạt |
| admin | 76,94% | Khá |
| shopping-lists | 73,17% | Còn nhánh recurrence/complete phức tạp |

### 11.4. Frontend coverage

Hiện **chưa cấu hình** coverage cho Vitest → không đo được tỷ lệ. Đề xuất bật `@vitest/coverage-v8`
(xem mục 14, Giai đoạn 2).

### 11.5. Practical Rationalization

1. **Business Logic First:** Unit Test dồn vào tầng service — nơi chứa rule nghiệp vụ. Các service cốt
   lõi (families, pantry, recipes, shopping-lists, meals, auth) đều có coverage cao, khóa chặt rủi ro sai
   lệch nghiệp vụ.
2. **Tách đúng phạm vi unit:** bootstrap, module wiring và seed/migrate không còn kéo tụt coverage unit vì
   ít giá trị kiểm thử bằng unit test; chúng được kiểm chứng tốt hơn ở e2e/triển khai.
3. **Khoảng trống còn lại:** shopping-lists, recipes, meals và admin-catalog còn nhánh nghiệp vụ phức tạp,
   là hạng mục ưu tiên nếu tiếp tục nâng branch coverage.

---

## 12. Rủi ro, lỗi phát hiện và tiêu chí đóng

### 12.1. Rủi ro kiểm thử

| ID | Mức | Phát hiện | Ảnh hưởng | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|
| TEST-001 | High | Không có CI (`.github/workflows`) chạy test | PR lỗi vẫn merge được | P0 | Open (Giai đoạn 2) |
| TEST-002 | Medium | Frontend chưa cấu hình coverage | Không đo được độ phủ FE | P1 | Open (Giai đoạn 2) |
| TEST-003 | Medium | Một số nhánh backend còn ít unit test | Chủ yếu còn recurrence/complete/update trong shopping-lists, meals, recipes, admin-catalog | P1 | Partially mitigated (đã thêm uploads/realtime/guards/config/inventory/admin controllers) |
| TEST-004 | High | Concurrency consume có race oversell | Trừ kho vượt mức khi nhiều request đồng thời | P0 | **Closed** (sửa atomic + INT-CONC-001) |
| TEST-005 | Medium | Security test thiếu JWT negative & object-level | Chưa đủ bằng chứng an toàn API | P1 | **Closed** (SEC-JWT-001…005, SEC-OBJ-000/001) |
| TEST-006 | Medium | Chưa có coverage quality gate | Coverage có thể tụt mà vẫn xanh | P1 | Open (Giai đoạn 2) |
| TEST-007 | Low | Mock FE gắn chặt implementation (không MSW) | Test dễ vỡ khi refactor | P2 | Monitor |

### 12.2. Ghi nhận lỗi QA

| Mã lỗi | Chức năng | Mô tả | Mức | Trạng thái |
|---|---|---|---|---|
| **BUG-CONC-001** | Pantry consume | `consume()` read-modify-write → oversell khi consume đồng thời. **Đã sửa** bằng `findOneAndUpdate` nguyên tử có guard `quantity:{$gte}`; phủ bởi INT-CONC-001 + unit test "rejects when a concurrent consume already drained the stock". | High | **Fixed** |
| BUG-TEST-001 | CI pipeline | Không có workflow chạy test/coverage. | High | Open (Giai đoạn 2) |
| BUG-TEST-002 | Test reporting | Không có ngưỡng coverage (gate). | Medium | Open (Giai đoạn 2) |

### 12.3. Tiêu chí đóng P0

1. ✓ Concurrency consume chứng minh chống oversell (TEST-004 closed).
2. ✓ Security negative (JWT + object-level) đã có bằng chứng (TEST-005 closed).
3. ☐ (Giai đoạn 2) CI chạy `npm run test` (backend) + `vitest run` (frontend) và lưu coverage artifacts.
4. ☐ (Giai đoạn 2) Thiết lập coverage gate để chống regression độ phủ.

---

## 13. Đánh giá mức độ đáp ứng ITSS

- **Unit Test:** Tốt — service cốt lõi phủ cao, dùng fixture/mock chuẩn hóa.
- **API/Controller Test:** Tốt — contract đầy đủ cho 5 module chính, có mã truy vết.
- **Security Test:** Khá — 401/403/role/object-level cơ bản; còn thiếu JWT negative & object-level e2e.
- **Integration/E2E:** Tốt — luồng xuyên module + realtime trên DB cô lập.
- **Coverage & CI:** Cần cải thiện — chưa có CI, chưa có gate, FE chưa đo coverage.

---

## 14. Kết luận và kế hoạch cải tiến

### 14.1. Kết luận

Bộ test NaviMart có nền tảng tốt cho regression ở tầng service/controller và đã có E2E thật với MongoDB
cô lập + WebSocket. Regression mặc định không failure/error (backend 335/335 unit/API + 32/32 e2e, frontend 61/61). Tuy nhiên
chưa có CI, chưa có coverage gate, frontend chưa đo coverage và một số module chưa kiểm chứng → chưa nên
coi là bằng chứng duy nhất cho release gate.

### 14.2. Roadmap cải tiến

| Ưu tiên | Giai đoạn | Hạng mục | Kết quả mong đợi |
|---|---|---|---|
| P1 | 1 | Nâng branch coverage cho shopping-lists, recipes, meals, admin-catalog | Tăng coverage vùng rủi ro còn lại |
| P1 | 1 | Thêm SEC-JWT-001 (JWT negative) + SEC-OBJ-001 (object-level) qua guard thật | Nâng mức Security Test |
| P1 | 1 | Thêm test concurrency (hoàn tất list / consume) | Chứng minh chống double-spend |
| P2 | 1 | Mở rộng test frontend (api/index.ts, vài page chính) | Phủ lớp gọi API + UI chính |
| P0 | 2 | Bật Vitest coverage + coverageThreshold (Jest & Vitest) | Đo và khóa coverage |
| P0 | 2 | Tạo `.github/workflows/ci.yml` chạy BE+FE test/coverage | Hết "build xanh giả" |
| P2 | — | E2E Playwright, DAST/ZAP (ghi nhận, ngoài phạm vi hiện tại) | Tăng độ tin cậy E2E/bảo mật |

---

## Phụ lục A. Danh mục testcase chi tiết

### A.1. Backend — Unit (service/util)

| File | Testcase |
|---|---|
| `auth.service.spec.ts` | creates user+owner family then issues tokens; duplicate-key→Conflict; unknown identifier→Unauthorized; password mismatch→Unauthorized; account inactive→Unauthorized; valid credentials→tokens; token not verifiable→Unauthorized; refresh hash mismatch→Unauthorized; rotates tokens; invalid/expired token→BadRequest; updates password hash; forgot không lộ tồn tại; dev reset token; revokes refresh token; user inactive→Unauthorized; no email→BadRequest; dev verification token; user gone/inactive→Unauthorized; maps active user; invalid verification token→BadRequest; marks email verified. (21) |
| `families.service.spec.ts` | creates owner family + active; no active family→NotFound; populated family for member; no match invite→NotFound; already member→Conflict; adds member + consumes invite; generate code + store hash; reject self perms; forbid owner perms; reject owner role; update member perms; reject remove self; mark removed + unset active. (13) |
| `family-access.util.spec.ts` | Forbidden no active family; Forbidden family not found; Forbidden not active member; returns active family ObjectId. (4) |
| `pantry.service.spec.ts` | default active + name regex; NotFound not in family; reject consume non-active; reject consume > stock; used_up khi hết + event; reactivate; replace từ catalog khi đổi foodId; validate categoryId; wasted event; set wasted + event; deleted event + delete; derive từ food catalog; food not found→NotFound; ad-hoc item + added event. (14) |
| `expiry-status.util.spec.ts` | strip time→midnight; default current date; add days không mutate; negative offset + month rollover; before today→expired; today..window→expiring; sau window→safe; default window; warningDays=0; date ranges cho filter; undefined khi không có status. (11) |
| `meals.service.spec.ts` | lọc family+range + batch tên; recipe missing→NotFound; default servings từ recipe; no recipe→BadRequest; delegate missing-ingredients; delegate generation (plannedFor=meal date); meal not in family→NotFound; trả meal + recipe name; update + persist; delete. (11) |
| `missing-ingredients.service.spec.ts` | match foodId + đơn vị; reject khác đơn vị; fallback tên; scale theo servings + round 3; bỏ optional; clamp 0; query active+stock; recipe không có→NotFound; recipe archived→NotFound; missing summary. (10) |
| `shopping-list-generation.service.spec.ts` | recipe missing/archived→NotFound; no missing→BadRequest; tạo list + broadcast; default servings. (4) |
| `recipes.service.spec.ts` | rank theo match ratio + minMatch; respect limit; boost expiring; approved filter + createdAt sort; text search + score sort; flag favorite; archived→NotFound; recipe detail + favorite; increment favoritesCount; không tăng nếu đã có; decrement khi remove; favorites theo thứ tự; default pending; auto-approve admin; delegate generation; archived→NotFound; cấm non-admin sửa của người khác; cấm đổi status; archive on remove. (19) |
| `shopping-lists.service.spec.ts` | list not in family→NotFound; tạo + broadcast; sync status/boughtAt; unknown item→NotFound; lọc family(+status) + map; stamp completedAt; archive + broadcast removal; append ad-hoc + validate category; remove item; reject hoàn tất đã completed; reject không có item checked; đẩy bought vào pantry + complete. (12) |
| `reports.service.spec.ts` | map aggregate→day/type + top-consumed; gộp wasted + expired active; tổng hợp shopping/pantry/inventory/waste. (3) |
| `catalog.service.spec.ts` | categories active + sort; foods default active + limit 10; filter barcode; regex escape $or; map food response; units active + sort. (6) |
| `users.service.spec.ts` | getProfile map shape; getProfile NotFound; update fields + save; derive displayName; giữ displayName tường minh; update nested notificationSettings; updateProfile NotFound. (7) |
| `notifications.service.spec.ts` | findAll scope user + limit 50; findAll unreadOnly; markAsRead stamp readAt; markAsRead null; markAllAsRead modifiedCount; createManyDeduped rỗng→0; createManyDeduped upsert by dedupeKey. (8) |
| `admin-stats.service.spec.ts` | tổng hợp user/family + recipe theo status; mọi status = 0 khi không có recipe. (2) |
| `uploads.service.spec.ts` | cấu hình Cloudinary; thiếu cấu hình→InternalServerError; upload stream thành công; stream lỗi→reject. (4) |
| `gmail-mail.service.spec.ts` | bật/tắt theo mode; thiếu cấu hình; OAuth token + gửi mail + cache; lỗi OAuth; lỗi Gmail send. (5) |
| `realtime.service.spec.ts` / `realtime.gateway.spec.ts` | emit room family/user; disconnect thiếu/sai token; join room user/family khi token hợp lệ. (7) |
| `roles.guard.spec.ts` / `family-permission.guard.spec.ts` | role metadata; user thiếu/sai role; family member active; owner/admin bypass; member thiếu/đủ permission. (10) |
| `env.validation.spec.ts` / `mongoose.config.spec.ts` | default env; parse port; reject env/port sai; map mongoose uri/db/autoIndex. (6) |
| `inventory-events.service.spec.ts` | create/save event; preserve createdAt; createMany rỗng; insertMany timestamps false. (4) |
| `pantry.service.spec.ts` (concurrency) | deduct nguyên tử guarded + used_up + event; reject khi request khác đã trừ hết kho. (2 trong 15) |
| `app.controller.spec.ts` | health status. (1) |

### A.2. Backend — Controller unit (mock service)

`auth.controller.spec.ts` (4), `families.controller.spec.ts` (3), `pantry.controller.spec.ts` (4),
`recipes.controller.spec.ts` (4), `admin-controllers.spec.ts` (4), `uploads.controller.spec.ts` (2)
— kiểm tra forward dto + unwrap tham số + inject user/family context.

### A.3. Backend — API (supertest)

API-AUTH-001…010 (10) · API-FAM-001…007 (7) · API-PAN-001…008 (8) · API-RCP-001…007 (7) ·
API-SL-001…006 (6). (Chi tiết kịch bản: mục 8.2.)

### A.3b. Backend — E2E (app thật + mongodb-memory-server)

| File | Testcase |
|---|---|
| `test/main-flows.e2e-spec.ts` | ~10 luồng: register/refresh/family; invite+join; complete list→pantry; lọc pantry; recipe missing→list; meal→missing→list→reports. |
| `test/extended-flows.e2e-spec.ts` | ~14 luồng: promote admin; catalog; favorites; suggestions; generate list từ recipe/meal; complete list; profile; reset password; realtime WS. |
| `test/security.e2e-spec.ts` | SEC-JWT-001…005 (no header / malformed / sai secret / hết hạn / user không tồn tại → 401); SEC-OBJ-000 (owner đọc → 200); SEC-OBJ-001/002/003 (family khác đọc item kho / danh sách mua / bữa ăn → 404). (9) |
| `test/concurrency.e2e-spec.ts` | INT-CONC-001: 5 consume đồng thời → chỉ 1 thành công, tồn kho 0, không oversell. (1) |

### A.4. Frontend (Vitest)

| File | Testcase |
|---|---|
| `utils/expiry.test.ts` | daysUntilExpiry: future dương / boundary now 0 / past âm / ceil; daysLeft: expired→0 / future khớp; daysOverdue: days past / future→0. (8) |
| `api/client.test.ts` | store/read tokens; corrupted JSON→null; clearSession; Authorization header + query; ApiError ghép message; 401 refresh + retry; 401 refresh fail→clearSession + dispatch unauthorized. (9) |
| `components/ProtectedRoute.test.tsx` | redirect chưa auth→/login; render outlet khi auth; non-admin bị chặn admin route; admin vào được. (4) |
| `components/FoodAutocomplete.test.tsx` | debounce + suggestions + select; onSubmit Enter free-text. (2) |
| `contexts/AuthContext.test.tsx` | login persist + set user + connect socket; register persist; logout clear dù API fail; refresh null khi không có token; refresh re-issue + update user; unauthorized event clear user. (6) |
| `contexts/DialogContext.test.tsx` | throw khi dùng ngoài provider; showAlert render + close; confirm chạy callback on accept + clear sau animation; không chạy khi cancel; confirm title chuẩn. (5) |
| `api/index.test.ts` | authApi login/refresh/logout đúng path+options; pantryApi list/get/consume/remove + query; shoppingListsApi list/complete; recipesApi addFavorite/removeFavorite/suggestions. (13) |
| `pages/Login.test.tsx` | validation rỗng không gọi login; login thành công → /home; admin → /admin; login lỗi hiện message. (4) |

---

## Phụ lục B. Checklist chạy và nghiệm thu

| Bước | Lệnh/hoạt động | Kết quả mong đợi | Bằng chứng |
|---|---|---|---|
| 1 | `cd backend && npm run test` | 48 suites / 335 test pass, 0 fail. | Console log Jest. |
| 2 | `cd backend && npm run test:cov` | Coverage unit logic đạt 88,33% statements. | `backend/coverage` (lcov/clover). |
| 3 | `cd backend && cross-env E2E_USE_MEMORY_MONGO=true npm run test:e2e` | Các luồng e2e pass. | Console log e2e. |
| 4 | `cd frontend && npm run test` | 9 file / 61 test pass. | Console log Vitest. |
| 5 | (Giai đoạn 2) Kiểm tra CI workflow | BE + FE job chạy test/coverage xanh. | GitHub Actions run/artifacts. |
| 6 | Review risk log | Không còn P0 mở. | Danh sách TEST/BUG closed/accepted. |
