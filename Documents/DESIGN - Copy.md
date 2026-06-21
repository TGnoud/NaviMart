# Design System cho NaviMart - Ứng dụng Quản lý đi chợ & Thực phẩm

## 1. Visual Theme & Atmosphere

Hệ thống NaviMart hướng tới đối tượng người nội trợ, mang đến một giao diện thân thiện, lịch sự và đáng tin cậy. Thiết kế mang tính hiện đại, rõ ràng thông qua việc sử dụng đồng nhất font chữ không chân (Sans-serif) **Be Vietnam Pro** cho toàn bộ hệ thống. Bảng màu tuân theo triết lý **Material Design 3 (MD3)** với tông màu xanh lá cây chủ đạo (`primary`, `tertiary`), gợi lên sự tươi mát của thực phẩm, kết hợp với các điểm nhấn phụ màu cam (`secondary-container`) để thu hút sự chú ý vào các tính năng quan trọng (như cảnh báo hạn dùng hoặc ưu đãi mua sắm). 

**Key Characteristics**

- Phong cách thiết kế thống nhất, hiện đại, mang hơi hướng Material Design.
- Sử dụng duy nhất font `Be Vietnam Pro` để đảm bảo sự rõ ràng, dễ đọc trên mọi thiết bị di động.
- Bảng màu MD3 hệ thống hóa rõ ràng các vai trò (Primary, Secondary, Tertiary, Surface, Error).
- Bố cục rõ ràng, rộng rãi, thao tác thân thiện với cảm ứng (touch-friendly).

## 2. Color Palette & Roles

Bảng màu được trích xuất từ cấu hình Tailwind CSS hiện tại của dự án, tuân thủ chặt chẽ hệ thống token của Material Design 3:

### Primary (Nhóm màu chính)
- **Primary:** `#0d631b` - Màu xanh lá chủ đạo, dùng cho các nút bấm chính, thành phần cần nhấn mạnh nhất.
- **On Primary:** `#ffffff` - Text hoặc icon hiển thị trên nền Primary.
- **Primary Container:** `#2e7d32` - Nền cho các khối nội dung mang tính chất nhấn mạnh chính.
- **On Primary Container:** `#cbffc2`

### Secondary & Tertiary (Nhóm màu phụ & Tương tác)
- **Secondary:** `#8b5000` 
- **Secondary Container:** `#ff9800` (Cam) - Dùng cho các điểm nhấn, cảnh báo mức độ vừa (ví dụ: Thực phẩm sắp hết hạn).
- **On Secondary Container:** `#653900`
- **Tertiary:** `#1f6223` - Xanh lá thẫm, dùng cho các trạng thái an toàn (ví dụ: Thực phẩm còn hạn xa).
- **Tertiary Container:** `#3a7b39`

### Surface & Background (Nền & Khung giao diện)
- **Background / Surface / Surface Bright:** `#f7fbf0` (Xanh lá cực nhạt) - Màu nền chính của toàn bộ trang web và ứng dụng.
- **Surface Variant:** `#e0e4da` - Màu nền cho các khối thẻ (card) hoặc container phụ.
- **On Surface:** `#181d17` - Màu chữ chính (Đen/Xám đậm) dùng trên nền sáng.
- **On Surface Variant:** `#40493d` - Màu chữ phụ (cho các đoạn mô tả, text hỗ trợ).
- **Outline:** `#73796d` - Màu đường viền chính (border).
- **Outline Variant:** `#bfcaba` - Màu đường viền nhạt hơn (subtle border).

### Semantic / Status (Trạng thái)
- **Error:** `#cf2e2e` (Đỏ) - Lỗi, cảnh báo nghiêm trọng (ví dụ: Thực phẩm đã hết hạn).
- **Error Container:** `#ffdad6` - Nền khối cảnh báo lỗi.
- **On Error:** `#ffffff` - Chữ trên nền báo lỗi.

## 3. Typography Rules

Hệ thống sử dụng duy nhất một font chữ cho cả tiêu đề lẫn nội dung để tạo sự đồng nhất và tối ưu hóa tốc độ tải trang.

**Font Family:** `Be Vietnam Pro`, sans-serif

**Hierarchy (Phân cấp Text)**

| **Role (Tailwind Class)** | **Size** | **Weight** | **Line Height** | **Sử dụng cho** |
| --- | --- | --- | --- | --- |
| `text-display-lg` | 36px | 700 (Bold) | 44px | Tiêu đề chính trang web rất lớn |
| `text-display-sm` | 32px | 700 (Bold) | 40px | Tiêu đề lớn (Ví dụ: Banner, Hero section) |
| `text-headline-md`| 28px | 700 (Bold) | 36px | Tiêu đề trang (Page headers) |
| `text-headline-sm`| 22px | 600 (Semibold)| 30px | Tiêu đề phân mục lớn (Section headers) |
| `text-body-lg` | 18px | 400 (Regular)| 26px | Đoạn văn bản lớn, câu chữ nổi bật |
| `text-body-md` | 16px | 500 (Medium) | 24px | Nội dung văn bản chính, nhãn của nút bấm chuẩn |
| `text-label-sm` | 14px | 400 (Regular)| 20px | Nhãn nhỏ, chú thích phụ, HSD, thông tin ngày tháng |

## 4. Component Stylings & Layout

### Border Radius (Độ bo góc)
Tuân theo chuẩn cấu hình hệ thống hiện tại:
- **DEFAULT (4px):** `rounded` - Độ bo góc mặc định cho các thành phần nhỏ (input, nhãn, tag).
- **lg (8px):** `rounded-lg` - Độ bo góc chuẩn cho nút bấm (Button), thẻ chứa nội dung (Card).
- **xl (12px):** `rounded-xl` - Cho các khối container lớn hoặc cửa sổ modal.
- **full (9999px):** `rounded-full` - Avatar người dùng, nút icon tròn, pill badges.

### Spacing System (Hệ thống khoảng cách)
Các giá trị cố định (Custom Spacing) được khai báo cho bố cục hệ thống:
- **`stack-sm` (8px):** Khoảng cách nhỏ giữa các thành phần liên quan chặt chẽ.
- **`gutter-mobile` (12px):** Khoảng cách lề (gutter) chuẩn giữa các phần tử trên thiết bị di động.
- **`stack-md` (16px):** Khoảng cách dọc chuẩn giữa các khối nội dung, padding bên trong của các thẻ (card).
- **`margin-mobile` (16px):** Căn lề ngoài (margin) trái/phải chuẩn cho màn hình điện thoại.
- **`nav-height` (69px):** Chiều cao cố định của thanh điều hướng (Navigation Bar) trên cùng.

### Trạng thái hạn sử dụng trong Kho (Pantry Safelist)
Hệ thống sử dụng các class Tailwind động (đã được cấu hình safelist) để thể hiện trực quan trạng thái của thực phẩm:
- **Tertiary (`text-tertiary`, `bg-tertiary`):** Dùng cho trạng thái an toàn (Còn hạn sử dụng xa).
- **Secondary (`text-secondary`, `bg-secondary`):** Dùng cho trạng thái cảnh báo (Sắp hết hạn - màu Cam).
- **Error (`text-error`, `bg-error`):** Dùng cho trạng thái khẩn cấp (Đã hết hạn - màu Đỏ).

## 5. Do's and Don'ts (Quy tắc thiết kế)

### Do
- **Sử dụng duy nhất font `Be Vietnam Pro`** cho toàn bộ hệ thống từ tiêu đề đến nội dung để giữ tính hiện đại và đồng bộ.
- **Sử dụng đúng palette màu Material Design 3** qua các class của Tailwind (như `text-primary`, `bg-surface-variant`, `text-on-surface`).
- **Dùng `text-body-md` (16px)** làm font chữ tiêu chuẩn cho các nội dung văn bản dài và thân nút bấm để đảm bảo độ đọc hiểu.
- **Dùng bo góc `rounded-lg` (8px)** cho các Button và Card để thống nhất trải nghiệm UI.
- **Tận dụng các biến khoảng cách** như `gap-stack-md` hay `m-margin-mobile` thay vì viết thông số cứng.

### Don't
- **Không sử dụng font có chân (Serif) như Lora** (NaviMart hiện tại đã loại bỏ font này khỏi hệ thống thiết kế).
- **Không tự ý thêm mã màu HEX cứng** vào trong file giao diện React (ngoại trừ cấu hình Tailwind). Hãy tham chiếu đến các tên biến màu đã định nghĩa.
- **Không dùng kích thước font chữ nhỏ hơn 14px (`text-label-sm`)**. Đối tượng sử dụng chính là người nội trợ, họ cần thông tin to, rõ ràng và dễ quét (scannable) trên màn hình điện thoại.
- **Không lạm dụng bóng đổ (shadow)** quá dày, hãy sử dụng bóng đổ nhẹ (`shadow-sm`, `shadow-md`) theo tinh thần thiết kế phẳng, hiện đại của MD3.
