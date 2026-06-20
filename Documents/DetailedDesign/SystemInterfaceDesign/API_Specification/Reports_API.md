# Đặc tả Giao diện Hệ thống (API Specification) - Reports

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ Báo cáo và Thống kê (Reports).

---

## 1. Bảng điều khiển thống kê (Get Dashboard)
- **Method**: `GET`
- **URL**: `/api/reports/dashboard`
- **Description**: Lấy các số liệu tổng quan của gia đình (như tổng chi phí, tổng số món ăn nấu trong tuần, lượng hao phí).
- **Yêu cầu quyền**: Quản trị viên hoặc thành viên gia đình (Family Member).

**Request Parameters (Query)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `start_date` | String (ISO) | Không | Ngày bắt đầu thống kê |
| `end_date` | String (ISO) | Không | Ngày kết thúc thống kê |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "total_spent": 1500000, "meals_cooked": 14, "waste_ratio": 5.2 }` |
| **403 Forbidden** | Chưa vào gia đình | `{ "error": "Forbidden", "message": "Require family membership" }` |

---

## 2. Xu hướng tiêu thụ (Get Consumption Trends)
- **Method**: `GET`
- **URL**: `/api/reports/consumption-trends`
- **Description**: Báo cáo chi tiết biểu đồ xu hướng tiêu thụ thực phẩm theo thời gian.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Query)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `period` | String | Không | Nhóm theo ngày/tuần/tháng (Mặc định: `week`) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "trends": [{ "date": "2026-06-01", "consumed": 5.2, "unit": "kg" }] }` |

---

## 3. Báo cáo hao phí thực phẩm (Get Waste Report)
- **Method**: `GET`
- **URL**: `/api/reports/waste`
- **Description**: Báo cáo các thực phẩm bị bỏ đi, hết hạn sử dụng.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Query)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `start_date` | String (ISO) | Không | Ngày bắt đầu thống kê |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "wasted_items": [{ "food_id": 1, "name": "Cà chua", "wasted_qty": 0.5 }] }` |
