# Đặc tả Giao diện Hệ thống (API Specification) - Pantry

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ Quản lý Tủ lạnh (Pantry).

---

## 1. Lấy danh sách thực phẩm trong tủ (Find All)
- **Method**: `GET`
- **URL**: `/api/pantry`
- **Description**: Lấy danh sách tất cả nguyên liệu, thực phẩm đang có trong tủ lạnh của gia đình.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Query)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `category_id` | Integer | Không | Lọc thực phẩm theo danh mục |
| `expiring_soon`| Boolean | Không | Chỉ hiển thị các món sắp hết hạn |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `[{ "item_id": 1, "food_id": 10, "quantity": 2, "unit": "kg", "expiry_date": "2026-06-20" }]` |

---

## 2. Thêm thực phẩm vào tủ lạnh (Create)
- **Method**: `POST`
- **URL**: `/api/pantry`
- **Description**: Nhập mới thực phẩm vào tủ lạnh.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `food_id` | Integer | Có | ID của thực phẩm từ Catalog |
| `quantity` | Decimal | Có | Số lượng nhập |
| `unit` | String | Có | Đơn vị tính |
| `expiry_date` | String (ISO)| Không | Ngày hết hạn |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "message": "Item added to pantry", "item_id": 1 }` |

---

## 3. Xem chi tiết thực phẩm (Find One)
- **Method**: `GET`
- **URL**: `/api/pantry/:itemId`
- **Description**: Lấy thông tin chi tiết của một mã sản phẩm cụ thể trong tủ lạnh.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `itemId` | Integer | Có | ID của bản ghi tủ lạnh |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "item_id": 1, "food_name": "Thịt lợn", "quantity": 2, "expiry_date": "..." }` |

---

## 4. Cập nhật thực phẩm (Update)
- **Method**: `PATCH`
- **URL**: `/api/pantry/:itemId`
- **Description**: Sửa số lượng hoặc ngày hết hạn của một mặt hàng.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `itemId` | Integer | Có | ID của bản ghi tủ lạnh |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `quantity` | Decimal | Không | Số lượng thực tế mới |
| `expiry_date` | String (ISO)| Không | Ngày hết hạn mới |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Pantry item updated" }` |

---

## 5. Xóa hoàn toàn thực phẩm (Remove)
- **Method**: `DELETE`
- **URL**: `/api/pantry/:itemId`
- **Description**: Xóa nhầm hoặc dọn dẹp bản ghi khỏi tủ lạnh.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `itemId` | Integer | Có | ID của bản ghi tủ lạnh |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Item deleted from pantry" }` |

---

## 6. Tiêu thụ thực phẩm (Consume)
- **Method**: `POST`
- **URL**: `/api/pantry/:itemId/consume`
- **Description**: Trừ số lượng thực phẩm khi sử dụng để nấu ăn. Hệ thống sẽ ghi log để báo cáo tiêu thụ.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `itemId` | Integer | Có | ID của bản ghi tủ lạnh |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `consume_qty` | Decimal | Có | Số lượng đã sử dụng |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Item consumed", "remaining_qty": 1.5 }` |

---

## 7. Báo cáo vứt bỏ (Mark Wasted)
- **Method**: `POST`
- **URL**: `/api/pantry/:itemId/waste`
- **Description**: Đánh dấu số lượng thực phẩm bị hỏng, hết hạn phải bỏ đi. Dữ liệu này dùng để thống kê lãng phí.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `itemId` | Integer | Có | ID của bản ghi tủ lạnh |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `waste_qty` | Decimal | Có | Số lượng bị vứt bỏ |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Item marked as wasted", "remaining_qty": 0 }` |
