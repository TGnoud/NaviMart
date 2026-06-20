# Đặc tả Giao diện Hệ thống (API Specification) - Shopping Lists

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ Danh sách đi chợ (Shopping Lists).

---

## 1. Lấy tất cả danh sách (Find All)
- **Method**: `GET`
- **URL**: `/api/shopping-lists`
- **Description**: Lấy toàn bộ các danh sách đi chợ của gia đình.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters**
Không yêu cầu tham số.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `[{ "list_id": 1, "name": "Đi siêu thị cuối tuần", "status": "pending" }]` |

---

## 2. Tạo danh sách mới (Create)
- **Method**: `POST`
- **URL**: `/api/shopping-lists`
- **Description**: Tạo mới một danh sách đi chợ (List rỗng hoặc chưa có items).
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `name` | String | Có | Tên danh sách (Ví dụ: Chợ sáng thứ 2) |
| `assigned_to` | Integer | Không | ID thành viên được giao việc đi chợ |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "list_id": 2, "name": "Chợ sáng thứ 2", "status": "pending" }` |

---

## 3. Xem chi tiết danh sách (Find One)
- **Method**: `GET`
- **URL**: `/api/shopping-lists/:listId`
- **Description**: Lấy thông tin và toàn bộ các mặt hàng cần mua trong danh sách.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `listId` | Integer | Có | ID của danh sách |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "list_id": 1, "items": [{ "item_id": 10, "food_name": "Rau cải", "is_checked": false }] }` |

---

## 4. Cập nhật thông tin danh sách (Update)
- **Method**: `PATCH`
- **URL**: `/api/shopping-lists/:listId`
- **Description**: Sửa đổi tên danh sách hoặc người được phân công đi chợ.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `listId` | Integer | Có | ID của danh sách |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `name` | String | Không | Tên mới |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Shopping list updated" }` |

---

## 5. Xóa danh sách (Remove)
- **Method**: `DELETE`
- **URL**: `/api/shopping-lists/:listId`
- **Description**: Xóa bỏ hoàn toàn danh sách đi chợ.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `listId` | Integer | Có | ID của danh sách |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Shopping list deleted" }` |

---

## 6. Hoàn tất đi chợ (Complete)
- **Method**: `POST`
- **URL**: `/api/shopping-lists/:listId/complete`
- **Description**: Kết thúc chuyến đi chợ. Tất cả những mặt hàng đã đánh dấu (checked) sẽ tự động được thêm vào Tủ lạnh (Pantry).
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `listId` | Integer | Có | ID của danh sách |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "List completed, 5 items added to pantry" }` |

---

## 7. Thêm mặt hàng cần mua (Add Item)
- **Method**: `POST`
- **URL**: `/api/shopping-lists/:listId/items`
- **Description**: Thêm một món đồ cần mua vào danh sách.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `listId` | Integer | Có | ID của danh sách |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `food_id` | Integer | Có | ID mặt hàng từ Catalog |
| `quantity` | Decimal | Có | Số lượng cần mua |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "item_id": 10, "message": "Item added to list" }` |

---

## 8. Sửa mặt hàng / Đánh dấu đã mua (Update Item)
- **Method**: `PATCH`
- **URL**: `/api/shopping-lists/:listId/items/:itemId`
- **Description**: Sửa số lượng hoặc đánh dấu checkbox là món hàng đã được nhặt vào giỏ (`is_checked`).
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `listId` | Integer | Có | ID của danh sách |
| `itemId` | Integer | Có | ID của mặt hàng trong danh sách |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `quantity` | Decimal | Không | Số lượng thực tế mua |
| `is_checked`| Boolean | Không | Trạng thái đã nhặt hàng (Tick) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Item status updated" }` |

---

## 9. Xóa mặt hàng (Remove Item)
- **Method**: `DELETE`
- **URL**: `/api/shopping-lists/:listId/items/:itemId`
- **Description**: Loại bỏ một mặt hàng khỏi danh sách đi chợ vì không cần mua nữa.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `listId` | Integer | Có | ID của danh sách |
| `itemId` | Integer | Có | ID của mặt hàng trong danh sách |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Item removed from list" }` |
