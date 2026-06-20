# Đặc tả Lớp (Class Specification) - Module Shared

Tài liệu mô tả chi tiết các phương thức và thuộc tính của các lớp trong Module Shared.

## 1. Views
### 1.1. Lớp `Home`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React hiển thị trang chủ chung của ứng dụng.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | render | JSX.Element | Render giao diện HTML/CSS |

**Parameter:**
Không

**Exception:**
Không

**Method:**
- Tích hợp các widget và thông báo tổng quan.

**State:**
Không

### 1.2. Lớp `AIChef`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React hỗ trợ tính năng AI gợi ý món ăn qua Chat.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | render | JSX.Element | Render giao diện HTML/CSS |

**Parameter:**
Không

**Exception:**
Không

**Method:**
- Giao tiếp với DialogFlow/OpenAI để gợi ý đồ ăn.

**State:**
Không

### 1.3. Lớp `Notifications`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React hiển thị danh sách thông báo.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | render | JSX.Element | Render giao diện HTML/CSS |

**Parameter:**
Không

**Exception:**
Không

**Method:**
- Hiển thị push notification hoặc in-app alert.

**State:**
Không

## 2. API Clients
### 2.1. Lớp `SharedApiClient`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Lớp gọi API chung cho hệ thống bằng Axios.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | baseUrl | String | `""` | URL gốc của backend |

**Operation**
Không có (Hoặc chứa các hàm upload image, push notification tùy dự án).

**Parameter:**
Không

**Exception:**
Không

**Method:**
Không

**State:**
Không

## 3. Controllers
### 3.1. Lớp `SharedController`
- **Stereotype**: `<<Control>>`
- **Mô tả**: NestJS Controller xử lý các request cấu hình chung.

**Attribute**
Không

**Operation**
Không có

**Parameter:**
Không

**Exception:**
Không

**Method:**
Không

**State:**
Không

## 4. Services
### 4.1. Lớp `SharedService`
- **Stereotype**: `<<Control>>`
- **Mô tả**: Lớp logic nghiệp vụ hỗ trợ đa phân hệ (như tính năng Cronjob, Socket.io...).

**Attribute**
Không

**Operation**
Không có

**Parameter:**
Không

**Exception:**
Không

**Method:**
Không

**State:**
Không
