# Tài liệu kiểm thử — Unit Test

**Hệ thống: NaviMart — Hệ thống đi chợ & quản lý thực phẩm gia đình**
Môn: Phát triển phần mềm theo chuẩn kỹ năng ITSS
Phiên bản tài liệu: 0.1 · Phạm vi: **Unit Test (Backend NestJS + Frontend React)**

> Tài liệu này tổng hợp mục tiêu, chiến lược, thiết kế testcase, kết quả thực thi và độ phủ
> của phần **Unit Test** hiện tại của NaviMart. Cách trình bày tham chiếu cấu trúc Test
> Documentation theo định hướng ITSS (ISO/IEC/IEEE 29119‑3), điều chỉnh cho dự án
> NestJS + React.

---

## 1. Giới thiệu và mục đích tài liệu

### 1.1. Mục đích kiểm thử
- Xác minh **logic nghiệp vụ cốt lõi** của backend (tính nguyên liệu còn thiếu, scale theo khẩu phần, xếp hạng gợi ý món, chuyển trạng thái kho thực phẩm, xoay token, hoàn tất danh sách đi chợ → nhập kho…) thực hiện đúng ở mức class/service **độc lập**, không phụ thuộc MongoDB thật.
- Kiểm tra các **nhánh lỗi** quan trọng (`NotFoundException`, `ForbiddenException`, `BadRequestException`, `ConflictException`, `UnauthorizedException`).
- Kiểm tra **controller** ủy quyền đúng tham số xuống service.
- Kiểm tra logic phía **frontend**: tiện ích ngày hết hạn, context xác thực (AuthContext), context hộp thoại (DialogContext), guard định tuyến (ProtectedRoute).
- Đo **độ phủ (coverage)** trên các đơn vị được chọn và xác định khoảng trống còn lại.

### 1.2. Đối tượng sử dụng tài liệu
| Đối tượng | Nhu cầu sử dụng |
|---|---|
| Developer | Hiểu phạm vi test hiện có, cách chạy, cách bổ sung testcase, rủi ro trước khi merge. |
| Tester/QA | Đánh giá testcase, kết quả thực thi, coverage và tiêu chí ký duyệt. |
| Project Lead | Ra quyết định về chất lượng bàn giao, ưu tiên rủi ro còn tồn. |

### 1.3. Phạm vi tổng quát
- **Trong phạm vi:** unit test cho service/util backend (`backend/src/**/*.spec.ts`), controller test mỏng, và unit test frontend (`frontend/src/**/*.test.{ts,tsx}`).
- **Ngoài phạm vi:** integration/e2e (đã có sẵn dạng `mongodb-memory-server`), kiểm thử UI thủ công, hiệu năng, bảo mật chuyên sâu.

---

## 2. Tổng quan hệ thống và phạm vi kiểm thử

NaviMart là hệ thống đa người dùng theo **gia đình (family)**: quản lý kho thực phẩm (pantry), danh mục thực phẩm (catalog), công thức (recipes) & gợi ý món theo kho, kế hoạch bữa ăn (meals), danh sách đi chợ (shopping lists), thông báo, báo cáo và gợi ý AI.

| Tầng | Công nghệ | Framework test |
|---|---|---|
| Backend | NestJS 11 + Mongoose 9 (MongoDB) | **Jest 30 + ts-jest** |
| Frontend | React 19 + Vite + TypeScript | **Vitest 4 + Testing Library + jsdom** |

**Trong phạm vi unit test:** logic service, util thuần, mapper, controller, các nhánh exception, context/hook/guard frontend.
**Ngoài phạm vi unit test:** persistence/transaction thật (thuộc e2e), WebSocket realtime end‑to‑end, tích hợp Cloudinary/Gmail/AI thật.

---

## 3. Chiến lược kiểm thử

Chiến lược **kết hợp (hybrid)** — mỗi loại logic dùng cách phù hợp nhất:

| Tầng kiểm thử | Mục tiêu | Kỹ thuật |
|---|---|---|
| **Util thuần** | Chứng minh phép tính/ngày tháng, không phụ thuộc DB | Gọi hàm trực tiếp, truyền `now`/input rõ ràng |
| **Service nghiệp vụ** | Chứng minh rule nghiệp vụ + nhánh lỗi | Mock Mongoose model qua helper `createMockModel()`; mock service phụ thuộc bằng `jest.fn()` |
| **Controller** | Chứng minh ủy quyền đúng tham số | Khởi tạo controller với service giả, assert delegation |
| **Frontend** | Chứng minh logic context/hook/guard | `vi.mock` cho `../api`/socket; `renderHook`/`render` (RTL); fake timers |

### 3.1. Nguyên tắc phân tầng
- Unit Test **không** dùng để kết luận transaction/DB thật (đó là việc của e2e).
- Service test **không chạm MongoDB** → nhanh, ổn định, dễ định vị lỗi.
- Mỗi service phải phủ **ít nhất một nhánh ném exception**.

### 3.2. Entry / Exit criteria
| Tiêu chí | Entry | Exit |
|---|---|---|
| Unit (BE/FE) | Mã build được, dependency test sẵn có, spec đã định nghĩa | Toàn bộ targeted test pass; coverage đơn vị chọn ≥ ~80%; không có failure không giải thích được |

---

## 4. Môi trường, công cụ và dữ liệu kiểm thử

### 4.1. Công cụ
| Thành phần | Cấu hình |
|---|---|
| Backend test | Jest 30, ts-jest 29, `testRegex: .*\.spec\.ts$`, `rootDir: src` |
| Frontend test | Vitest 4, @testing-library/react 16, jsdom, setup `test/test-setup.ts` |

### 4.2. Lệnh chạy test
```bash
# Backend (unit)
cd backend && npm test
cd backend && npm run test:cov            # coverage toàn bộ

# Frontend (unit)
cd frontend && npm test                   # vitest run
cd frontend && npm run test:watch
```

### 4.3. Hạ tầng & dữ liệu test dùng chung (mới bổ sung)
| Nguồn | Cách dùng |
|---|---|
| `backend/test/utils/mock-model.ts` | `createMockModel()` + `mockQuery(result)` — mock Mongoose model với query chainable `.sort/.limit/.select/.lean/.populate/.exec`. |
| `backend/test/utils/fixtures.ts` | Factory dữ liệu: `makeUser/makeFamily/makeRecipe/makePantryItem/makeIngredient/oid`. |

> *Lưu ý kỹ thuật:* subdocument Mongoose tự gán `_id` khi `.push()`. Trong unit test (không có Mongoose thật), test `addItem` chủ động gán `_id` để mapper phản hồi đúng như production.

---

## 5. Thiết kế testcase và ma trận truy vết

### 5.1. Quy ước mã testcase
| Prefix | Ý nghĩa | Ví dụ |
|---|---|---|
| `TC-EXP-*` | Util ngày hết hạn (backend) | `TC-EXP-003` |
| `TC-MISS-*` | MissingIngredientsService | `TC-MISS-005` |
| `TC-RCP-*` | RecipesService (gồm ranking) | `TC-RCP-001` |
| `TC-SLGEN-*` | ShoppingListGenerationService | `TC-SLGEN-002` |
| `TC-PAN-*` | PantryService | `TC-PAN-004` |
| `TC-FACC-*` | resolveActiveFamilyId (util) | `TC-FACC-002` |
| `TC-FAM-*` | FamiliesService | `TC-FAM-006` |
| `TC-AUTH-*` | AuthService | `TC-AUTH-010` |
| `TC-SL-*` | ShoppingListsService | `TC-SL-008` |
| `TC-MEAL-*` | MealsService | `TC-MEAL-003` |
| `TC-RPT-*` | ReportsService | `TC-RPT-001` |
| `TC-CTL-*` | Controller test (BE) | `TC-CTL-PAN-002` |
| `FE-*` | Frontend unit test | `FE-AUTH-001` |

### 5.2. Ma trận truy vết theo loại kiểm thử
| Module | Util thuần | Service | Controller | Frontend |
|---|---|---|---|---|
| Pantry / Expiry | ✅ expiry-status | ✅ pantry.service | ✅ pantry.controller | — |
| Meals | — | ✅ missing-ingredients, shopping-list-gen, meals.service | — | — |
| Recipes | — | ✅ recipes.service (ranking) | ✅ recipes.controller | — |
| Families | ✅ family-access | ✅ families.service | ✅ families.controller | — |
| Auth | — | ✅ auth.service | ✅ auth.controller | ✅ AuthContext |
| Shopping Lists | — | ✅ shopping-lists.service | — | — |
| Reports | — | ✅ reports.service | — | — |
| FE chung | ✅ utils/expiry | — | — | ✅ DialogContext, ProtectedRoute |

### 5.3. Kỹ thuật thiết kế testcase áp dụng
| Kỹ thuật | Áp dụng trong NaviMart |
|---|---|
| Equivalence Partitioning | quantity hợp lệ/không hợp lệ; recipe approved/archived |
| Boundary Value Analysis | `warningDays=0`, ngày = hôm nay, consume = đúng tồn kho, scale khẩu phần |
| State Transition | pantry `active→used_up`, `used_up→active`, `→wasted`; list `active→completed` |
| Negative Testing | recipe not found, invite hết hạn, sai mật khẩu, consume vượt tồn |
| RBAC | non‑admin sửa recipe người khác, đổi status, route admin‑only |

---

## 6. Unit Test — Backend (Service & Util)

### 6.1. Mục tiêu
Kiểm thử logic ở mức class/service độc lập; repository, security context, mail/realtime đều được mock.

### 6.2. Expiry util — `pantry/utils/expiry-status.util.ts` (`TC-EXP-*`)
| Mã | Mục tiêu | Tiền điều kiện | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|---|
| TC-EXP-001 | Cắt thời gian về 0h | `now`=11/06 15:30 | `getStartOfDay(now)` | Trả về 11/06 00:00 | Pass |
| TC-EXP-002 | Mặc định ngày hiện tại | không truyền tham số | `getStartOfDay()` | h/m/s/ms = 0 | Pass |
| TC-EXP-003 | Cộng ngày, không mutate input | base 11/06 | `addDays(base,4)` | 15/06; base không đổi | Pass |
| TC-EXP-004 | Cộng ngày âm / tràn tháng | base 01/06 | `addDays(base,-1)` | 31/05 | Pass |
| TC-EXP-005 | Trước hôm nay → expired | warning=3 | `getExpiryStatus(10/06)` | `expired` | Pass |
| TC-EXP-006 | Trong cửa sổ cảnh báo → expiring | warning=3 | `getExpiryStatus(11/06..14/06)` | `expiring` | Pass |
| TC-EXP-007 | Sau cửa sổ → safe | warning=3 | `getExpiryStatus(15/06)` | `safe` | Pass |
| TC-EXP-008 | Dùng cửa sổ mặc định (3) | không truyền warning | `getExpiryStatus(14/06 / 15/06)` | `expiring` / `safe` | Pass |
| TC-EXP-009 | `warningDays=0` chỉ hôm nay expiring | warning=0 | `getExpiryStatus(11/12/10 /06)` | `expiring/safe/expired` | Pass |
| TC-EXP-010 | Khoảng lọc theo trạng thái | warning=3 | `getExpiryStatusRange(...)` | đúng `{from,toExclusive}` | Pass |
| TC-EXP-011 | Không truyền trạng thái | — | `getExpiryStatusRange(undefined)` | `undefined` | Pass |

### 6.3. MissingIngredientsService — `meals/missing-ingredients.service.ts` (`TC-MISS-*`)
| Mã | Mục tiêu | Tiền điều kiện | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|---|
| TC-MISS-001 | Khớp theo `foodId` cùng đơn vị | pantry có 2 item | `findMatchingPantryItems` | Chỉ khớp đúng foodId | Pass |
| TC-MISS-002 | Khác đơn vị → không khớp | unit lệch | `findMatchingPantryItems` | 0 kết quả | Pass |
| TC-MISS-003 | Fallback khớp theo tên (chuẩn hóa) | không có foodId | `findMatchingPantryItems` | Khớp không phân biệt hoa/khoảng trắng | Pass |
| TC-MISS-004 | Scale theo khẩu phần, làm tròn 3 số | recipe servings=2 | `calculateMissingIngredients(...,3)` | required=1.5; missing=1.5 | Pass |
| TC-MISS-005 | Bỏ qua nguyên liệu optional | có 1 optional | `calculateMissingIngredients` | Chỉ tính nguyên liệu bắt buộc | Pass |
| TC-MISS-006 | Clamp ≥0 & không thiếu khi đủ kho | kho dư | `calculateMissingIngredients` | missing=0; `hasMissingIngredients=false` | Pass |
| TC-MISS-007 | Truy vấn đúng filter kho | — | `calculateMissingIngredients` | filter `{status:active, quantity:{$gt:0}, familyId}` | Pass |
| TC-MISS-008 | Recipe không tồn tại → NotFound | recipe=null | `getRecipeMissingIngredients` | `NotFoundException` | Pass |
| TC-MISS-009 | Recipe archived → NotFound | status archived | `getRecipeMissingIngredients` | `NotFoundException` | Pass |
| TC-MISS-010 | Trả summary cho recipe hợp lệ | family active | `getRecipeMissingIngredients` | đúng `recipeName`, cờ thiếu | Pass |

### 6.4. RecipesService (gồm ranking gợi ý) — `recipes/recipes.service.ts` (`TC-RCP-*`)
| Mã | Mục tiêu | Tiền điều kiện | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|---|
| TC-RCP-001 | Xếp hạng theo matchRatio & lọc `minMatch` | kho có Rice | `getSuggestions` | recipe đủ khớp xếp trước; lọc <0.6 | Pass |
| TC-RCP-002 | Tôn trọng `limit` | 2 recipe khớp | `getSuggestions({limit:1})` | trả 1 | Pass |
| TC-RCP-003 | `prioritizeExpiring` ưu tiên item sắp hết hạn | 1 item expiring | `getSuggestions({prioritizeExpiring})` | recipe dùng item expiring xếp trước | Pass |
| TC-RCP-004 | Filter mặc định `approved` + sort `createdAt` | — | `findAll({})` | filter/sort/limit đúng | Pass |
| TC-RCP-005 | Tìm kiếm `$text` + sort textScore | có `q` | `findAll({q})` | filter `$text`, sort textScore | Pass |
| TC-RCP-006 | Gắn cờ favorite | có favorite | `findAll` | `isFavorite=true` | Pass |
| TC-RCP-007 | `findOne` archived → NotFound | status archived | `findOne` | `NotFoundException` | Pass |
| TC-RCP-008 | `findOne` trả detail + cờ favorite | tồn tại | `findOne` | đúng id, `isFavorite` | Pass |
| TC-RCP-009 | addFavorite tăng count khi mới | upsertedCount=1 | `addFavorite` | count+1, `isFavorite=true` | Pass |
| TC-RCP-010 | addFavorite không tăng khi đã có | upsertedCount=0 | `addFavorite` | count giữ nguyên | Pass |
| TC-RCP-011 | removeFavorite giảm count | deletedCount=1 | `removeFavorite` | count−1, `isFavorite=false` | Pass |
| TC-RCP-012 | findFavorites theo thứ tự lưu | có favorite | `findFavorites` | trả list, cờ favorite | Pass |
| TC-RCP-013 | create của non‑admin → pending | role user | `create` | status `pending`, normalizedName đúng | Pass |
| TC-RCP-014 | create của admin → approved | role admin | `create` | status `approved` | Pass |
| TC-RCP-015 | generateShoppingList ủy quyền | — | `generateShoppingList` | gọi đúng service sinh list | Pass |
| TC-RCP-016 | addFavorite recipe archived → NotFound | archived | `addFavorite` | `NotFoundException` | Pass |
| TC-RCP-017 | non‑admin sửa recipe người khác → Forbidden | author khác | `update` | `ForbiddenException` | Pass |
| TC-RCP-018 | non‑admin đổi status → Forbidden | role user | `update({status})` | `ForbiddenException` | Pass |
| TC-RCP-019 | remove archive bởi tác giả | author = user | `remove` | status `archived`, `save` gọi | Pass |

### 6.5. ShoppingListGenerationService — `meals/shopping-list-generation.service.ts` (`TC-SLGEN-*`)
| Mã | Mục tiêu | Tiền điều kiện | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|---|
| TC-SLGEN-001 | Recipe không tồn tại/archived → NotFound | findOne=null | `generateFromRecipe` | `NotFoundException` | Pass |
| TC-SLGEN-002 | Không thiếu nguyên liệu → BadRequest | hasMissing=false | `generateFromRecipe` | `BadRequestException` | Pass |
| TC-SLGEN-003 | Tạo list từ nguyên liệu thiếu + phát realtime | có thiếu | `generateFromRecipe({servings:4})` | list đúng item; emit `shoppingList:updated` | Pass |
| TC-SLGEN-004 | Mặc định servings theo recipe | không truyền servings | `generateFromRecipe` | tính theo `recipe.servings` | Pass |

### 6.6. PantryService — `pantry/pantry.service.ts` (`TC-PAN-*`)
| Mã | Mục tiêu | Tiền điều kiện | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|---|
| TC-PAN-001 | buildFilter: mặc định active + regex tên | có `q` | `findAll` | status=active, regex `i`, sort đúng | Pass |
| TC-PAN-002 | findOne item ngoài family → NotFound | findOne=null | `findOne` | `NotFoundException` | Pass |
| TC-PAN-003 | consume item không active → BadRequest | status used_up | `consume` | `BadRequestException` | Pass |
| TC-PAN-004 | consume vượt tồn → BadRequest | quantity<dto | `consume` | `BadRequestException` | Pass |
| TC-PAN-005 | consume hết → used_up + event | qty=2,consume 2 | `consume` | qty=0, status used_up, event `consumed` | Pass |
| TC-PAN-006 | update used_up→active khi qty>0 | used_up | `update({quantity:3})` | active; event `adjusted` | Pass |
| TC-PAN-007 | update đổi field từ catalog khi đổi foodId | có food | `update({foodId})` | name/unit theo food | Pass |
| TC-PAN-008 | update kiểm tra categoryId | có category | `update({categoryId})` | gọi `categoryModel.exists` | Pass |
| TC-PAN-009 | update →wasted ghi event | active | `update({status:wasted})` | event `wasted` | Pass |
| TC-PAN-010 | markWasted + event | tồn tại | `markWasted` | status wasted, wastedAt, event | Pass |
| TC-PAN-011 | remove ghi event `deleted` + xóa | tồn tại | `remove` | event deleted, `deleteOne` | Pass |
| TC-PAN-012 | create từ foodId lấy field catalog | có food | `create({foodId})` | name/unit theo food | Pass |
| TC-PAN-013 | create foodId không tồn tại → NotFound | food=null | `create` | `NotFoundException` | Pass |
| TC-PAN-014 | create ad‑hoc, mặc định source/location + event | không foodId | `create` | source=manual, location=fridge, event added | Pass |

### 6.7. resolveActiveFamilyId — `families/family-access.util.ts` (`TC-FACC-*`)
| Mã | Mục tiêu | Tiền điều kiện | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|---|
| TC-FACC-001 | Không có activeFamilyId → Forbidden | user thiếu family | gọi util | `ForbiddenException`, không query | Pass |
| TC-FACC-002 | Family không tồn tại → Forbidden | findById=null | gọi util | `ForbiddenException` | Pass |
| TC-FACC-003 | Không phải member active → Forbidden | status removed | gọi util | `ForbiddenException` | Pass |
| TC-FACC-004 | Member active → trả ObjectId | active | gọi util | trả đúng `ObjectId` | Pass |

### 6.8. FamiliesService — `families/families.service.ts` (`TC-FAM-*`)
| Mã | Mục tiêu | Tiền điều kiện | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|---|
| TC-FAM-001 | create family owner + set active | — | `create` | tạo family, `updateOne` set activeFamilyId | Pass |
| TC-FAM-002 | getCurrentFamily không có family → NotFound | thiếu family | `getCurrentFamily` | `NotFoundException` | Pass |
| TC-FAM-003 | getCurrentFamily trả family cho member | active | `getCurrentFamily` | trả đúng id/members | Pass |
| TC-FAM-004 | join mã không khớp → NotFound | findOne=null | `join` | `NotFoundException` | Pass |
| TC-FAM-005 | join khi đã là member active → Conflict | member active | `join` | `ConflictException` | Pass |
| TC-FAM-006 | join thành công, dùng invite, set active | invite hợp lệ | `join` | thêm member, `usedAt` set, set activeFamily | Pass |
| TC-FAM-007 | createInvite lưu hash, trả code 1 lần | family hợp lệ | `createInvite` | chỉ lưu `codeHash`, trả plaintext | Pass |
| TC-FAM-008 | updatePermissions cho chính mình → BadRequest | memberId=self | `updateMemberPermissions` | `BadRequestException` | Pass |
| TC-FAM-009 | update owner → Forbidden | target owner | `updateMemberPermissions` | `ForbiddenException` | Pass |
| TC-FAM-010 | gán role owner → BadRequest | role=owner | `updateMemberPermissions` | `BadRequestException` | Pass |
| TC-FAM-011 | update member thường thành công | member | `updateMemberPermissions` | đổi permissions, `save` | Pass |
| TC-FAM-012 | removeMember chính mình → BadRequest | memberId=self | `removeMember` | `BadRequestException` | Pass |
| TC-FAM-013 | removeMember: set removed + bỏ activeFamily | member | `removeMember` | status removed, `updateOne` unset | Pass |

### 6.9. AuthService — `auth/auth.service.ts` (`TC-AUTH-*`)
| Mã | Mục tiêu | Tiền điều kiện | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|---|
| TC-AUTH-001 | register tạo user+family, phát token | — | `register` | hash mật khẩu, tạo family, trả tokens | Pass |
| TC-AUTH-002 | register trùng key → Conflict | create lỗi 11000 | `register` | `ConflictException` | Pass |
| TC-AUTH-003 | login identifier lạ → Unauthorized | user=null | `login` | `UnauthorizedException` | Pass |
| TC-AUTH-004 | login sai mật khẩu → Unauthorized | compare=false | `login` | `UnauthorizedException` | Pass |
| TC-AUTH-005 | login account không active → Unauthorized | status suspended | `login` | `UnauthorizedException` | Pass |
| TC-AUTH-006 | login hợp lệ trả token | đúng credential | `login` | trả tokens, `save` | Pass |
| TC-AUTH-007 | refresh token không verify được → Unauthorized | verify throw | `refresh` | `UnauthorizedException` | Pass |
| TC-AUTH-008 | refresh hash không khớp → Unauthorized | compare=false | `refresh` | `UnauthorizedException` | Pass |
| TC-AUTH-009 | refresh hợp lệ xoay token | hợp lệ | `refresh` | trả refreshToken mới | Pass |
| TC-AUTH-010 | resetPassword token sai/hết hạn → BadRequest | user=null | `resetPassword` | `BadRequestException` | Pass |
| TC-AUTH-011 | resetPassword hợp lệ đổi hash | hợp lệ | `resetPassword` | hash mật khẩu mới, success | Pass |
| TC-AUTH-012 | forgotPassword không lộ tồn tại tài khoản | user=null | `forgotPassword` | `{success:true}` | Pass |
| TC-AUTH-013 | forgotPassword trả devResetToken (non‑prod, mail off) | user tồn tại | `forgotPassword` | có `devResetToken` | Pass |
| TC-AUTH-014 | logout thu hồi refresh token | — | `logout` | `$unset refreshTokenHash` | Pass |
| TC-AUTH-015 | sendVerification user không active → Unauthorized | suspended | `sendVerification` | `UnauthorizedException` | Pass |
| TC-AUTH-016 | sendVerification không có email → BadRequest | email=null | `sendVerification` | `BadRequestException` | Pass |
| TC-AUTH-017 | sendVerification trả devVerificationToken | non‑prod, mail off | `sendVerification` | có `devVerificationToken` | Pass |
| TC-AUTH-018 | validateJwtPayload user lỗi/inactive → Unauthorized | user=null | `validateJwtPayload` | `UnauthorizedException` | Pass |
| TC-AUTH-019 | validateJwtPayload map user active | active | `validateJwtPayload` | trả `{userId,role,...}` | Pass |
| TC-AUTH-020 | verifyEmail token sai → BadRequest | user=null | `verifyEmail` | `BadRequestException` | Pass |
| TC-AUTH-021 | verifyEmail hợp lệ | tồn tại | `verifyEmail` | `{success:true}` | Pass |

### 6.10. ShoppingListsService — `shopping-lists/shopping-lists.service.ts` (`TC-SL-*`)
| Mã | Mục tiêu | Tiền điều kiện | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|---|
| TC-SL-001 | findOne ngoài family → NotFound | findOne=null | `findOne` | `NotFoundException` | Pass |
| TC-SL-002 | create + phát realtime | — | `create` | trả list, emit `shoppingList:updated` | Pass |
| TC-SL-003 | findAll lọc family + status, sort | có status | `findAll` | filter/sort đúng | Pass |
| TC-SL-004 | update →completed set completedAt | active | `update({status:completed})` | completedAt set, emit | Pass |
| TC-SL-005 | remove archive + emit removed | tồn tại | `remove` | status archived, emit `shoppingList:removed` | Pass |
| TC-SL-006 | updateItem checked đồng bộ status/boughtAt | item tồn tại | `updateItem({checked})` | status bought, boughtAt set | Pass |
| TC-SL-007 | updateItem item lạ → NotFound | items rỗng | `updateItem` | `NotFoundException` | Pass |
| TC-SL-008 | addItem ad‑hoc, validate category, save | có categoryId | `addItem` | gọi `exists`, push item, `save` | Pass |
| TC-SL-009 | removeItem theo id | có item | `removeItem` | items rỗng, `save` | Pass |
| TC-SL-010 | complete list đã completed → BadRequest | status completed | `complete` | `BadRequestException` | Pass |
| TC-SL-011 | complete không có item checked → BadRequest | không bought | `complete` | `BadRequestException` | Pass |
| TC-SL-012 | complete: nhập item đã mua vào kho + hoàn tất | có bought item | `complete` | `insertMany`, `createMany` event added, status completed | Pass |

### 6.11. MealsService — `meals/meals.service.ts` (`TC-MEAL-*`)
| Mã | Mục tiêu | Tiền điều kiện | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|---|
| TC-MEAL-001 | findAll lọc family + khoảng ngày, gắn tên recipe | có meal | `findAll` | filter date đúng, sort, recipeName | Pass |
| TC-MEAL-002 | create recipe không tồn tại → NotFound | recipe=null | `create` | `NotFoundException` | Pass |
| TC-MEAL-003 | create mặc định servings theo recipe | recipe servings=4 | `create` | servings=4 | Pass |
| TC-MEAL-004 | getMissingIngredients không có recipe → BadRequest | recipeId=null | `getMissingIngredients` | `BadRequestException` | Pass |
| TC-MEAL-005 | getMissingIngredients ủy quyền theo servings | có recipe | `getMissingIngredients` | gọi service đúng tham số | Pass |
| TC-MEAL-006 | generateShoppingList không recipe → BadRequest | recipeId=null | `generateShoppingList` | `BadRequestException` | Pass |
| TC-MEAL-007 | generateShoppingList dùng meal.date làm plannedFor | có recipe | `generateShoppingList` | ủy quyền đúng, plannedFor=meal.date | Pass |
| TC-MEAL-008 | findOne meal ngoài family → NotFound | findOne=null | `findOne` | `NotFoundException` | Pass |
| TC-MEAL-009 | findOne trả recipeName tra cứu | có recipe | `findOne` | recipeName đúng | Pass |
| TC-MEAL-010 | update field đơn giản + lưu | tồn tại | `update` | servings/isCompleted đổi, `save` | Pass |
| TC-MEAL-011 | remove xóa meal | tồn tại | `remove` | `deleteOne`, success | Pass |

### 6.12. ReportsService — `reports/reports.service.ts` (`TC-RPT-*`)
| Mã | Mục tiêu | Tiền điều kiện | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|---|
| TC-RPT-001 | getConsumptionTrends map theo ngày/loại + top tiêu thụ | aggregate trả group | `getConsumptionTrends` | `eventsByDay`/`topConsumed` đúng | Pass |
| TC-RPT-002 | getWasteReport gộp event lãng phí + item hết hạn còn active | aggregate + find | `getWasteReport` | `wastedItems`/`expiredActiveItems` đúng | Pass |
| TC-RPT-003 | getDashboard tổng hợp 4 summary | mock đủ | `getDashboard` | đủ key range/shopping/pantry/inventory/waste, completionRate=0.5 | Pass |

---

## 7. Controller Test — Backend (`TC-CTL-*`)

### 7.1. Mục tiêu
Chứng minh controller **ủy quyền đúng tham số** (`user`, dto, id) xuống service và trả thẳng kết quả; service được mock hoàn toàn.

| Mã | Controller | Phạm vi kiểm tra | Status |
|---|---|---|---|
| TC-CTL-PAN-001..004 | PantryController | findAll/create/findOne/update/remove/consume/markWasted ủy quyền đúng | Pass |
| TC-CTL-AUTH-001..004 | AuthController | register/login/refresh(unwrap token)/logout/forgot/reset/verify ủy quyền đúng | Pass |
| TC-CTL-RCP-001..004 | RecipesController | list/suggestions/favorites, unwrap `servings`, favorite, CRUD | Pass |
| TC-CTL-FAM-001..003 | FamiliesController | current/create, invite/join, update/remove member | Pass |

---

## 8. Unit Test — Frontend (`FE-*`)

### 8.1. utils/expiry — `frontend/src/utils/expiry.ts` (`FE-EXP-*`)
| Mã | Mục tiêu | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|
| FE-EXP-001 | Ngày tương lai → dương | `daysUntilExpiry(+3d)` | 3 | Pass |
| FE-EXP-002 | Đúng hiện tại → 0 | `daysUntilExpiry(now)` | 0 | Pass |
| FE-EXP-003 | Quá khứ → âm | `daysUntilExpiry(-2d)` | −2 | Pass |
| FE-EXP-004 | Làm tròn lên (ceil) | `daysUntilExpiry(+1.5d)` | 2 | Pass |
| FE-EXP-005 | daysLeft clamp 0 với quá hạn | `daysLeft(-4d)` | 0 | Pass |
| FE-EXP-006 | daysLeft khớp giá trị tương lai | `daysLeft(+5d)` | 5 | Pass |
| FE-EXP-007 | daysOverdue đếm ngày quá hạn | `daysOverdue(-3d)` | 3 | Pass |
| FE-EXP-008 | daysOverdue clamp 0 với tương lai | `daysOverdue(+6d)` | 0 | Pass |

### 8.2. DialogContext — `frontend/src/contexts/DialogContext.tsx` (`FE-DLG-*`)
| Mã | Mục tiêu | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|
| FE-DLG-001 | useDialog ngoài Provider → throw | render hook trần | ném lỗi `must be used within a DialogProvider` | Pass |
| FE-DLG-002 | showAlert hiển thị & đóng modal | showAlert + click Đóng | modal mở rồi đóng | Pass |
| FE-DLG-003 | showConfirm Đồng ý chạy callback + clear sau 200ms | showConfirm + Đồng ý | callback chạy 1 lần; clear sau timer | Pass |
| FE-DLG-004 | showConfirm Hủy không chạy callback | showConfirm + Hủy | callback không chạy | Pass |
| FE-DLG-005 | Modal confirm có tiêu đề chuẩn | trigger confirm | hiển thị "Xác nhận" | Pass |

### 8.3. AuthContext — `frontend/src/contexts/AuthContext.tsx` (`FE-AUTH-*`)
| Mã | Mục tiêu | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|
| FE-AUTH-001 | login lưu session, set user, connect socket | `login()` | storeTokens/storeUser, user set, connectSocket | Pass |
| FE-AUTH-002 | register lưu session, set user | `register()` | storeUser, user set | Pass |
| FE-AUTH-003 | logout xóa session dù API lỗi | logout với API reject | clearSession, disconnectSocket, user null | Pass |
| FE-AUTH-004 | refreshSession null khi không có refresh token | tokens=null | trả null, không gọi refresh | Pass |
| FE-AUTH-005 | refreshSession xoay token & cập nhật user | có token | gọi refresh, user cập nhật | Pass |
| FE-AUTH-006 | sự kiện `navimart:unauthorized` xóa user | dispatch event | user về null | Pass |

### 8.4. ProtectedRoute — `frontend/src/components/ProtectedRoute.tsx` (`FE-RT-*`)
| Mã | Mục tiêu | Thao tác | Kết quả mong đợi | Status |
|---|---|---|---|---|
| FE-RT-001 | Chưa đăng nhập → /login | render guard | hiển thị Login Page | Pass |
| FE-RT-002 | Đã đăng nhập → render outlet | user thường | hiển thị nội dung bảo vệ | Pass |
| FE-RT-003 | Non‑admin vào route admin → /home | requireAdmin | chuyển Home Page | Pass |
| FE-RT-004 | Admin vào route admin → cho phép | role admin | hiển thị nội dung | Pass |

> *Ghi chú:* `FoodAutocomplete.test.tsx` và `api/client.test.ts` (đã có sẵn) tiếp tục xanh; bao phủ debounce, chọn món, Enter, lưu/đọc token và luồng refresh 401.

---

## 9. Kết quả thực thi và coverage

### 9.1. Kết quả regression chính
| Bộ test | Suites | Tests | Kết quả |
|---|---|---|---|
| Backend unit/API (`npm test`) | 48 | **335** | ✅ tất cả Pass |
| Frontend unit (`npm test`) | 6 | **32** | ✅ tất cả Pass |

> Bộ backend hiện bao gồm service/util/controller unit test, guard/config/upload/realtime/mail unit test và API/controller spec.
> Khi chạy `cd backend && npm test -- --runInBand`: **48 suites / 335 tests — Pass**.

### 9.2. Tổng hợp testcase theo module
| Module | Số testcase | Loại |
|---|---|---|
| Expiry util (BE) | 11 | Util |
| MissingIngredients | 10 | Service |
| Recipes (ranking) | 19 | Service |
| ShoppingListGeneration | 4 | Service |
| Pantry | 14 | Service |
| FamilyAccess | 4 | Util |
| Families | 13 | Service |
| Auth | 21 | Service |
| ShoppingLists | 12 | Service |
| Meals | 11 | Service |
| Reports | 3 | Service |
| Controllers (Pantry/Auth/Recipes/Families) | 15 | Controller |
| App health (sẵn có) | 1 | Controller |
| **Frontend** (expiry/Dialog/Auth/ProtectedRoute + sẵn có) | 32 | FE |

### 9.3. Coverage backend (đo bằng Jest, phạm vi unit logic)
**Tổng: 88.33% statements · 71.27% branches · 84.17% functions · 89.20% lines.**

Phạm vi `npm run test:cov` hiện loại trừ `main.ts`, `*.module.ts` và `database/**` vì đây là bootstrap/module wiring/seed-migrate script, không phải đơn vị logic phù hợp cho unit test.

| Nhóm/File | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| `realtime/*` | 100 | 84.61 | 100 | 100 |
| `inventory-events/inventory-events.service.ts` | 100 | 87.50 | 100 | 100 |
| `config/*` | 100 | 66.66 | 100 | 100 |
| `uploads/uploads.service.ts` | 100 | 89.47 | 100 | 100 |
| `auth/guards/*` | 100 | 91.17 | 100 | 100 |
| `families/family-access.util.ts` | 100 | 100 | 100 | 100 |
| `meals/missing-ingredients.service.ts` | 100 | 86.95 | 100 | 100 |
| `pantry/utils/expiry-status.util.ts` | 100 | 93.33 | 100 | 100 |
| `reports/reports.service.ts` | 94.64 | 77.27 | 86.95 | 94.23 |
| `auth/auth.service.ts` | 92.72 | 82.19 | 95.23 | 92.59 |
| `pantry/pantry.service.ts` | 85.29 | 73.39 | 93.75 | 85.71 |
| `families/families.service.ts` | 80.35 | 72.13 | 84.61 | 80.73 |
| `recipes/recipes.service.ts` | 80.39 | 68.88 | 93.47 | 82.63 |
| `shopping-lists/shopping-lists.service.ts` | 71.01 | 57.04 | 78.37 | 71.64 |

Lệnh tái lập (scoped):
```bash
cd backend && npm run test:cov -- --runInBand
```

### 9.4. Class/khoảng trống coverage đáng chú ý
- `shopping-lists.service.ts` và `recipes.service.ts`: còn nhánh `buildShoppingListItem`/`buildIngredients` theo `foodId`, recurrence và một số nhánh `update` chưa phủ hết.
- `meals.service.ts` (branch 67%): nhánh `update` khi đổi `recipeId` chưa test.
- Các util/guard/config/realtime/upload service quan trọng đã phủ xấp xỉ hoặc đúng 100%.

---

## 10. Rủi ro, lỗi phát hiện và tiêu chí đóng

### 10.1. Rủi ro kiểm thử
| Rủi ro | Ghi chú |
|---|---|
| Mock model lệch hành vi Mongoose | Helper mô phỏng query chainable; subdoc `_id` được gán thủ công trong test. Hành vi transaction/index thật thuộc e2e. |
| Unit test không thay thế integration | Persistence/rollback/index vẫn cần e2e. |

### 10.2. Ghi nhận QA / vấn đề môi trường
- `npm test -- --runInBand` và `npm run test:cov -- --runInBand` đã chạy xanh trên môi trường hiện tại.
- E2E không nằm trong lần chạy bổ sung unit test này; tiếp tục dùng bộ e2e hiện có để kiểm chứng persistence/realtime xuyên module.

### 10.3. Tiêu chí đóng (exit) cho phần Unit Test
- [x] Toàn bộ backend unit/API test pass (335/335).
- [x] Toàn bộ frontend unit test pass (32/32).
- [x] Coverage unit backend ≥ 88% statements (đạt 88.33%).
- [x] Mỗi service có ≥ 1 testcase cho mỗi nhánh ném exception.
- [x] Không testcase nào chạm MongoDB thật.

---

## 11. Kết luận và kế hoạch cải tiến

### 11.1. Kết luận
Phần Unit Test đã phủ đầy đủ **logic nghiệp vụ cốt lõi** của NaviMart ở cả backend và frontend với độ phủ cao (88.33% statements theo phạm vi unit logic), tách bạch khỏi DB nên chạy nhanh và ổn định. Hạ tầng `test-utils` (mock-model + fixtures) cho phép mở rộng test mới với chi phí thấp.

### 11.2. Roadmap cải tiến
1. Nâng branch coverage cho `shopping-lists`, `recipes`, `meals` (các nhánh `foodId`/`recurrence`/`update`).
2. Bổ sung test frontend cho các trang nhiều logic (`ListDetail`, `PantryDashboard`, `MealPlanner`).
3. Cấu hình `coverageThreshold` trong Jest và thêm CI (GitHub Actions) chạy `npm test` cho cả hai package.
4. Cấu hình `coverageThreshold` trong Jest và thêm CI (GitHub Actions) chạy `npm test` cho cả hai package.
5. Bổ sung test FE cho các trang nhiều logic (`ListDetail`, `PantryDashboard`, `MealPlanner`).

---

*Phụ lục: mã nguồn test ở `backend/src/**/*.spec.ts`, `backend/test/utils/`, `frontend/src/**/*.test.{ts,tsx}`.*
