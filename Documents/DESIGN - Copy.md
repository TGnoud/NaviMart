# Design System cho NaviMart - Ứng dụng Quản lý đi chợ & Thực phẩm

## 1. Visual Theme & Atmosphere

Hệ thống NaviMart hướng tới đối tượng người nội trợ, mang đến một giao diện thân thiện, lịch sự và đáng tin cậy. Thiết kế cân bằng giữa sự trang nhã của font chữ có chân (Serif) và tính hiện đại, rõ ràng của font chữ không chân (Sans-serif). Màu xanh lá cây (Green) chủ đạo gợi lên sự tươi mát của thực phẩm, kết hợp với các điểm nhấn màu cam (Orange) ấm cúng cho các ưu đãi mua sắm. Cấu trúc UI được thiết kế to, rõ ràng, giúp người nội trợ dễ dàng đọc thông tin quan trọng như giá cả, hạn sử dụng và thao tác một cách thuận tiện trên thiết bị di động.

**Key Characteristics**

- Phong cách thiết kế lịch sự, thân thiện và đáng tin cậy dành cho người nội trợ và gia đình.
- Sử dụng màu xanh lá cây chủ đạo kết hợp với các điểm nhấn màu cam ấm áp.
- Bố cục rõ ràng, rộng rãi, các nút bấm to để thao tác dễ dàng trên điện thoại di động.
- Chữ số (giá tiền, số lượng) và hạn sử dụng (HSD) được in đậm, tương phản cao để dễ nhìn.
- Sự kết hợp tinh tế giữa font Lora (trang nhã, lịch sự) và Be Vietnam Pro (rõ ràng, dễ đọc).

## 2. Color Palette & Roles

### Primary

- **Green Primary( `#2E7D32`):** Main brand color used for primary CTAs, key highlights, and brand identity elements
- **Green Accent( `#43A047`):** Secondary blue for emphasis and supporting interactive states
### Interactive

- **Green Deep( `#1B5E20`):** Hover and active states for interactive elements
- **Orange Accent( `#FF9800`):** Warm complementary accent for secondary actions, high-urgency deals (Flash Sale), and highlights
### Neutral Scale

- **Dark Heading( `#111827`):** Primary heading text and high-contrast elements
- **Body Text( `#374151`):** Main body text and secondary headings
- **Secondary Text( `#4B5563`):** Tertiary text, descriptions, and supporting copy
- **Muted Text( `#333333`):** Labels and secondary UI text
- **Light Gray( `#E2E8F0`):** Backgrounds, dividers, and subtle UI elements
- **Border Gray( `#D1D5DB`):** Border strokes and subtle separators
- **Light Neutral( `#E5E7EB`):** Soft background fills
- **Very Light( `#F9FAFB`):** Minimal background tints
- **White( `#FFFFFF`):** Primary background and card surfaces
- **Black( `#000000`):** Maximum contrast text and critical elements
### Surface & Borders

- **Light Green( `#E8F5E9`):** Soft background tint for green-accented sections
- **Subtle Border( `#E2E8F0`):** Default border color for inputs and containers
- **Transparent Black(#0000):** Overlay and transparency base
### Semantic / Status

- **Warning( `#E3BB42`, `#FCB900`):** Alert states and cautionary information (e.g., product expiring soon)
- **Error/Danger( `#CF2E2E`, `#E60A32`):** Error states, validation failures, and destructive actions
## 3. Typography Rules

### Font Family

**Primary (Heading):** Lora
**Secondary (Body):** Be Vietnam Pro
**Fallback Stack:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif

**Hierarchy**

| **Role** | **Font** | **Size** | **Weight** | **Line Height** | **Letter Spacing** | **Notes** |
| --- | --- | --- | --- | --- | --- | --- |
| Display / H1 | Lora | 32px | 700 | 40px | 0px | Tiêu đề chính trang web |
| Heading / H2 | Lora | 24px | 700 | 32px | 0px | Tiêu đề phân mục lớn |
| Heading / H3 | Lora | 20px | 600 | 28px | 0px | Tiêu đề phụ và thẻ (card) |
| Heading / H4 | Lora | 18px | 600 | 26px | 0px | Tiêu đề nhóm nhỏ |
| Body Large | Be Vietnam Pro | 16px | 400 | 24px | 0px | Nội dung văn bản chính |
| Body Regular | Be Vietnam Pro | 16px | 500 | 24px | 0px | Nội dung phụ và text nhấn mạnh |
| Body Medium | Be Vietnam Pro | 14px | 500 | 20px | 0px | Text cho nút bấm (Button) |
| Body Small | Be Vietnam Pro | 14px | 400 | 20px | 0px | Nhãn (Labels) và form text |
| Caption | Be Vietnam Pro | 12px | 400 | 16px | 0px | Chú thích, thời gian, HSD |
| Code | Be Vietnam Pro | 12px | 500 | 16px | 0px | Monospace-style elements |

### Principles

- **Hierarchy through weight:** Use font weight (400–700) to create clear visual priority before sizing
- **Generous line height:** Always maintain at least 150% of font size for readability and breathing room
- **Sự kết hợp Lora & Be Vietnam Pro:** Tạo sự cân bằng giữa nét trang nhã, lịch sự cho tiêu đề và sự rõ ràng, dễ đọc cho nội dung chi tiết.
- **Semantic sizing:** Every role has a purpose; avoid arbitrary sizes
- **Mobile consideration:** Maintain minimum 14px for body text on all devices
## 4. Component Stylings

### Buttons

#### Primary Button

- **Background:** `#2E7D32`
- **Text Color:** `#FFFFFF`
- **Font Size:** 14px
- **Font Weight:** 500
- **Line Height:** 20px
- **Padding:** 0px 8px
- **Height:** 36px
- **Border Radius:** 8px
- **Border:** 0px solid transparent
- **Box Shadow:** none
- **Hover State:** Background `#43A047`, shadow rgba(0, 0, 0, 0.14) 0px 4px 8px 0px
- **Active State:** Background `#1B5E20`
- **Disabled State:** Background `#D1D5DB`, Text Color `#4B5563`
#### Secondary Button

- **Background:** transparent
- **Text Color:** `#2E7D32`
- **Font Size:** 14px
- **Font Weight:** 500
- **Line Height:** 20px
- **Padding:** 0px 8px
- **Height:** 36px
- **Border Radius:** 8px
- **Border:** 2px solid `#2E7D32`
- **Box Shadow:** none
- **Hover State:** Background `#E8F5E9`, border `#43A047`
- **Active State:** Background `#D9F0F1`, border `#1B5E20`
#### Ghost Button

- **Background:** transparent
- **Text Color:** `#374151`
- **Font Size:** 14px
- **Font Weight:** 500
- **Line Height:** 20px
- **Padding:** 0px 8px
- **Height:** 36px
- **Border Radius:** 0px
- **Border:** 0px solid transparent
- **Box Shadow:** none
- **Hover State:** Text Color `#2E7D32`, underline on
- **Active State:** Text Color `#43A047`
#### Icon Button

- **Background:** transparent
- **Text Color:** `#FFFFFF`
- **Size:** 20px × 20px
- **Border Radius:** 0px
- **Border:** 0px solid transparent
- **Box Shadow:** none
- **Hover State:** Opacity 0.8
- **Active State:** Opacity 0.6
### Cards & Containers

#### Card Surface

- **Background:** `#FFFFFF`
- **Border:** 1px solid `#E2E8F0`
- **Border Radius:** 8px
- **Padding:** 24px
- **Box Shadow:** rgba(0, 0, 0, 0.14) 0px 8px 16px 0px, rgba(0, 0, 0, 0.12) 0px 0px 2px 0px
- **Hover State:** Box Shadow rgba(0, 0, 0, 0.14) 0px 12px 24px 0px
#### Subtle Container

- **Background:** `#F9FAFB`
- **Border:** 1px solid `#E5E7EB`
- **Border Radius:** 8px
- **Padding:** 16px
- **Box Shadow:** none
#### Tinted Container

- **Background:** `#E8F5E9`
- **Border:** 1px solid `#2E7D32`
- **Border Radius:** 8px
- **Padding:** 16px
- **Box Shadow:** none
### Inputs & Forms

#### Text Input

- **Background:** `#FFFFFF`
- **Text Color:** `#333333`
- **Font Size:** 16px
- **Font Weight:** 400
- **Line Height:** 24px
- **Padding:** 8px 12px
- **Height:** 40px
- **Border Radius:** 0px
- **Border:** 1px solid `#C1C1C1`
- **Box Shadow:** none
- **Focus State:** Border 2px solid `#2E7D32`, box shadow rgba(46, 125, 50, 0.2) 0px 0px 0px 3px
- **Error State:** Border 2px solid `#E60A32`, text color `#E60A32`
- **Disabled State:** Background `#F9FAFB`, border `#E5E7EB`, text color `#4B5563`
#### Label

- **Font Size:** 14px
- **Font Weight:** 600
- **Line Height:** 20px
- **Color:** `#374151`
- **Margin Bottom:** 8px
- **Display:** block
#### Helper Text

- **Font Size:** 12px
- **Font Weight:** 400
- **Line Height:** 16px
- **Color:** `#4B5563`
- **Margin Top:** 4px
#### Error Text

- **Font Size:** 12px
- **Font Weight:** 400
- **Line Height:** 16px
- **Color:** `#E60A32`
- **Margin Top:** 4px
### Navigation

#### Navigation Bar

- **Background:** `#FFFFFF`
- **Height:** 69px
- **Border Bottom:** 1px solid `#E5E7EB`
- **Padding:** 0px 24px
- **Display:** flex
- **Align Items:** center
- **Box Shadow:** rgba(0, 0, 0, 0.05) 0px 1px 2px 0px
#### Navigation Link

- **Font Size:** 16px
- **Font Weight:** 600
- **Line Height:** 24px
- **Color:** `#374151`
- **Padding:** 8px 12px
- **Border Radius:** 4px
- **Text Decoration:** none
- **Hover State:** Background `#F9FAFB`, color `#2E7D32`
- **Active State:** Color `#2E7D32`, border bottom 3px solid `#2E7D32`
#### Dropdown Menu

- **Background:** `#FFFFFF`
- **Border:** 1px solid `#E2E8F0`
- **Border Radius:** 8px
- **Box Shadow:** rgba(0, 0, 0, 0.14) 0px 8px 16px 0px, rgba(0, 0, 0, 0.12) 0px 0px 2px 0px
- **Padding:** 8px 0px
- **Min Width:** 200px
#### Dropdown Item

- **Font Size:** 14px
- **Font Weight:** 500
- **Line Height:** 20px
- **Color:** `#374151`
- **Padding:** 12px 16px
- **Hover State:** Background `#F9FAFB`, color `#2E7D32`
### Badges

#### Default Badge (Information/HSD Status)

- **Background:** `#E8F5E9`
- **Text Color:** `#43A047`
- **Font Size:** 12px
- **Font Weight:** 600
- **Line Height:** 16px
- **Padding:** 4px 8px
- **Border Radius:** 2px
- **Border:** 1px solid `#2E7D32`
#### Warning Badge

- **Background:** `#FFF3E0`
- **Text Color:** `#E3BB42`
- **Font Size:** 12px
- **Font Weight:** 600
- **Line Height:** 16px
- **Padding:** 4px 8px
- **Border Radius:** 2px
- **Border:** 1px solid `#FCB900`
#### Error Badge

- **Background:** `#FFEBEE`
- **Text Color:** `#E60A32`
- **Font Size:** 12px
- **Font Weight:** 600
- **Line Height:** 16px
- **Padding:** 4px 8px
- **Border Radius:** 2px
- **Border:** 1px solid `#CF2E2E`
## 5. Layout Principles

### Spacing System

**Base Unit:**8px

**Spacing Scale:**

- **2xs:** 4px – Micro gaps between inline elements
- **xs:** 8px – Tight spacing, button padding
- **sm:** 12px – Comfortable input padding, small gaps
- **md:** 16px – Standard padding, section margins
- **lg:** 20px – Larger gaps between elements
- **xl:** 24px – Card padding, generous spacing
- **2xl:** 32px – Section separation
- **3xl:** 40px – Large section margins
- **4xl:** 48px – Major content blocks
- **5xl:** 68px – Full-width page section separation
- **6xl:** 72px – Very large spacing
- **7xl:** 80px – Maximum padding for major containers
**Usage Context:**
- **Buttons:** 8px horizontal, 0px vertical padding
- **Cards:** 24px padding
- **Form Fields:** 8px vertical, 12px horizontal padding
- **Section Gaps:** 32px to 72px depending on content hierarchy
- **Container Margins:** 24px to 80px for page-level spacing
Grid & Container

**Max Width:**1440px **Gutter:**24px **Column Strategy:**12-column responsive grid

- **Desktop (1440px):** Full 12 columns, 24px gutters
- **Tablet (768px):** 8 effective columns, 16px gutters
- **Mobile (375px):** 4 effective columns, 12px gutters
**Container Patterns:**
- Hero sections span full width with max-width content area
- Card grids use responsive layouts (3 columns desktop, 2 tablet, 1 mobile)
- Sidebars occupy 25% width on desktop, collapse to stack on tablet/mobile
Whitespace Philosophy

NaviMart ưu tiên sự rõ ràng và tốc độ đọc hiểu thông qua việc sử dụng khoảng trắng chiến lược, đảm bảo các thông tin quan trọng (như mặt hàng cần mua, HSD, giá cả) có thể nhìn thấy ngay lập tức. Khoảng cách lớn (40px–80px) ngăn cách các phần nội dung chính, tạo nhịp điệu trực quan và khuyến khích sự tập trung. Padding bên trong các component (16px–24px) đảm bảo văn bản và các yếu tố tương tác (như nút Thêm vào giỏ) không bao giờ có cảm giác chật chội. Không gian trống (negative space) làm giảm tải trọng nhận thức, nâng cao nhận thức về sự minh bạch và độ tin cậy. Giao diện tránh các cụm thông tin dày đặc, ưu tiên các hệ thống phân cấp dễ quét (scannable) hỗ trợ ra quyết định nhanh chóng cho người nội trợ. Border Radius Scale

- **0px:** Form inputs, navigation bars, and full-bleed backgrounds
- **2px:** Badges and very small interactive elements
- **4px:** Minor UI details and subtle emphasis
- **8px:** Buttons, cards, containers, and standard components
- **10px:** Larger cards and containers
- **16px:** Hero sections and display components
- **50%:** Circular avatars and badges (pill-shaped for badges)
## 6. Depth & Elevation

| **Level** | **Treatment** | **Use** |
| --- | --- | --- |
| Flat (None) | No shadow, box-shadow: none | Form inputs, navigation, subtle backgrounds |
| Raised (1) | box-shadow: rgba(0, 0, 0, 0.12) 0px 0px 2px 0px | Minimal elevation for borders |
| Elevated (2) | box-shadow: rgba(0, 0, 0, 0.14) 0px 4px 8px 0px, rgba(0, 0, 0, 0.12) 0px 0px 2px 0px | Cards, dropdowns, default hover states |
| High (3) | box-shadow: rgba(0, 0, 0, 0.14) 0px 8px 16px 0px, rgba(0, 0, 0, 0.12) 0px 0px 2px 0px | Floating panels, modals, card hover states (for deal urgency) |
| Maximum (4) | box-shadow: rgba(0, 0, 0, 0.14) 0px 12px 24px 0px, rgba(0, 0, 0, 0.12) 0px 0px 2px 0px | Top-level modals, important overlays (e.g., checkout/payment) |

**Shadow Philosophy:** NaviMart sử dụng đổ bóng tinh tế, phân lớp để gợi ý chiều sâu của material mà không gây phân tâm. Shadows luôn sử dụng cách tiếp cận hai lớp—lớp mờ nhẹ tạo chiều sâu không gian và lớp đổ bóng rõ để định hình. Điều này tạo ra hệ thống phân cấp trực quan mà không tạo ra các độ tương phản gay gắt hay làm rối mắt. Bóng đổ được giữ ở mức tối thiểu ở các khu vực nội dung chính, dành elevation mạnh hơn cho các lớp phủ (overlays) và trạng thái tương tác, đảm bảo thông tin sản phẩm và giá cả luôn giữ vị trí ưu tiên trong phân cấp trực quan.

## 7. Do's and Don'ts

### Do

- **Use green (****#****0077B6) for all primary CTAs**to ensure consistent brand recognition and tap target clarity
- **Maintain 16px minimum font size for body text**across all devices for accessibility and readability
- **Apply 8px border radius consistently**to buttons, cards, and inputs for cohesive modern aesthetic
- **Provide generous padding (24px) inside cards**to ensure product details never feel cramped
- **Stack spacing in multiples of 8px**to maintain visual alignment and rhythm
- **Sử dụng Lora cho tiêu đề và Be Vietnam Pro cho nội dung** để đảm bảo tính lịch sự và dễ đọc
- **Pair blue with white or****#****F9FAFB backgrounds**for optimal contrast and professional appearance
- **Include hover states on all interactive elements**with color shifts or shadow elevation
- **Use****#****E6F6FF background for green-accented sections**to reinforce brand color without overwhelming
- **Keep focus indicators (2px colored borders) visible**on form inputs for keyboard navigation accessibility
### Don't

- **Don't use colors outside the defined palette**without explicit design review
- **Don't apply shadows heavier than Level 3**on primary content or standard cards
- **Don't set font sizes below 12pxfor body text (use line-height:** 16px minimum)
- **Don't create buttons without clear hover states**—interactive elements must respond visibly
- **Don't mix other font families**—Chỉ sử dụng Lora (Serif) cho Heading và Be Vietnam Pro (Sans-serif) cho Body
- **Don't use the orange accent (****#****FF6900) for primary actions**—reserve it for secondary emphasis or high-urgency flash deals
- **Don't compress padding below 8px on interactive elements**as it compromises touch targets
- **Don't apply border radius above 10px to standard components**unless explicitly designing display elements
- **Don't mix green color values**—use `#2E7D32` for primary, `#43A047` for secondary, `#1B5E20` for active
- **Don't omit error states**on form fields; always communicate validation failures clearly using `#E60A32`
## 8. Responsive Behavior

### Breakpoints

| **Name** | **Width** | **Key Changes** |
| --- | --- | --- |
| Mobile | 375px | 1 column, 12px gutters, stacked navigation, 14px body text |
| Small Tablet | 576px | 2 columns, 16px gutters, collapsible menus, 14px body text |
| Tablet | 768px | 3–4 columns, 16px gutters, horizontal navigation, 16px body text |
| Desktop | 1024px | 8–12 columns, 24px gutters, full navigation, 16px body text |
| Large Desktop | 1440px+ | Full width, max-width container, 24px gutters, 16px body text |

### Touch Targets

- **Minimum interactive element size:** 44px × 44px (buttons, links)
- **Button padding:** Maintain at least 8px horizontal to exceed 44px target
- **Input height:** 40px minimum
- **Spacing between touch targets:** 8px minimum gap to prevent accidental overlap
- **Icon-only buttons:** 36px × 36px minimum with 8px internal padding
Collapsing Strategy

- **Desktop (1440px):** Full horizontal navigation, side-by-side cards (3 per row), unrestricted spacing
- **Tablet (768px):** Navigation collapses to hamburger menu, cards shift to 2 per row, padding reduces to 16px
- **Mobile (375px):** Stack-first layout, full-width cards (1 per row), navigation hidden behind menu, padding reduces to 12px, font sizes remain at 14px minimum
- **Font scaling:** Never reduce below 14px on any breakpoint
- **Image scaling:** Use responsive images with max-width: 100% and maintain aspect ratio
- **Container margins:** Reduce from 80px (desktop) to 48px (tablet) to 24px (mobile)
- **Hero section height:** 400px on desktop, 300px on tablet, 250px on mobile
## 9. Agent Prompt Guide

### Quick Color Reference

**Primary CTA Background:**Green Primary ( `#2E7D32`) **Primary CTA Text:**White ( `#FFFFFF`) **Primary CTA Hover:**Green Accent ( `#43A047`) **Secondary Text:**Body Text ( `#374151`) **Heading Text:**Dark Heading ( `#111827`) **Background (default):**White ( `#FFFFFF`) **Background (subtle):**Very Light ( `#F9FAFB`) **Background (tinted):**Light Green ( `#E8F5E9`) **Border:**Light Gray ( `#E2E8F0`) **Error State:**Danger ( `#E60A32`) **Warning State:**Warning ( `#E3BB42`) **Input Border:**Border Gray ( `#C1C1C1`) **Disabled Text:**Secondary Text ( `#4B5563`)Iteration Guide

- **Every button follows the primary style by default:** Green background ( `#2E7D32`), white text, 14px font, 500 weight, 36px height, 8px radius, 0px 8px padding unless explicitly secondary or ghost.
- **Typography hierarchy is strict:** Use Lora Display (32px, 700) for major titles, Lora Heading (24px, 700) for sections, Be Vietnam Pro Body Large (16px, 400) for content, Be Vietnam Pro Body Medium (14px, 500) for buttons/emphasis, Be Vietnam Pro Caption (12px, 400) for metadata. Never improvise sizes.
- **Spacing in 8px multiples only:** All margins, padding, and gaps must be 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 68px, 72px, or 80px.No arbitrary values.
- **Cards always have white background and subtle shadow:** Base shadow is rgba(0, 0, 0, 0.14) 0px 8px 16px 0px, rgba(0, 0, 0, 0.12) 0px 0px 2px 0px.Hover state elevates to rgba(0, 0, 0, 0.14) 0px 12px 24px 0px.
- **Form inputs default to white background with 1px border:** Use `#C1C1C1` for default border, focus state shifts to 2px solid `#2E7D32` with subtle shadow.Error state uses `#E60A32` border and text color.
- **Navigation bar is always white with bottom border:** 69px height, 24px horizontal padding, 1px solid `#E5E7EB` bottom border.Navigation links are 16px, 600 weight, with active state showing green color ( `#2E7D32`).
- **Every interactive element must have a visible hover state:** Buttons shift color or shadow, links underline or change color, inputs gain focus ring.No silent hovers.
- **Font:** Use Lora for Headings and Be Vietnam Pro for Body text. Never introduce other typefaces.
- **Border radius follows the scale:** 0px for inputs/full-bleed, 2px for badges, 8px for buttons/cards/containers, 10px for larger cards, 16px for hero elements.No other radius values unless approved.
- **Mobile-first responsive:** Desktop max-width 1440px, tablet breakpoint 768px (shift to 2 columns, 16px gutters), mobile 375px (full-width, 12px gutters).Font sizes never below 14px.Maintain 44px × 44px minimum touch targets everywhere.
