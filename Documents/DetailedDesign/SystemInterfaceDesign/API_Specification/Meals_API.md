# Đặc tả Giao diện Hệ thống (API Specification) - Meals

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ Lên thực đơn (Meals).

---

## 1. Lấy danh sách thực đơn (Find All)
- **Method**: `GET`
- **URL**: `/api/meals`
- **Description**: Lấy danh sách kế hoạch nấu ăn (thực đơn) trong một khoảng thời gian nhất định của gia đình.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Query)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `start_date` | String (ISO) | Có | Ngày bắt đầu |
| `end_date` | String (ISO) | Có | Ngày kết thúc |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `[{ "id": 1, "recipe_id": 5, "planned_date": "2026-06-12", "meal_type": "dinner" }]` |

---

## 2. Tạo thực đơn mới (Create)
- **Method**: `POST`
- **URL**: `/api/meals`
- **Description**: Thêm một món ăn vào lịch nấu ăn của gia đình.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `recipe_id` | Integer | Có | ID của công thức nấu ăn |
| `planned_date`| String (ISO)| Có | Ngày dự kiến nấu |
| `meal_type` | String | Có | Buổi nấu (Sáng, trưa, tối) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "id": 10, "recipe_id": 5, "planned_date": "...", "meal_type": "dinner" }` |

---

## 3. Lấy chi tiết một thực đơn (Find One)
- **Method**: `GET`
- **URL**: `/api/meals/:mealId`
- **Description**: Xem chi tiết thông tin của một kế hoạch nấu ăn.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `mealId` | Integer | Có | ID của thực đơn |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "id": 10, "recipe": {...}, "missing_ingredients": [...] }` |

---

## 4. Kiểm tra nguyên liệu thiếu (Get Missing Ingredients)
- **Method**: `GET`
- **URL**: `/api/meals/:mealId/missing-ingredients`
- **Description**: So sánh công thức của thực đơn với tủ lạnh (Pantry) để tìm nguyên liệu còn thiếu.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `mealId` | Integer | Có | ID của thực đơn |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `[{ "food_id": 3, "name": "Cà chua", "needed": 2, "unit": "quả" }]` |

---

## 5. Tạo danh sách mua sắm (Generate Shopping List)
- **Method**: `POST`
- **URL**: `/api/meals/:mealId/generate-shopping-list`
- **Description**: Tự động tạo danh sách đi chợ từ những nguyên liệu còn thiếu của thực đơn này.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `mealId` | Integer | Có | ID của thực đơn |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "list_id": 5, "items_added": 3 }` |

---

## 6. Cập nhật thực đơn (Update)
- **Method**: `PATCH`
- **URL**: `/api/meals/:mealId`
- **Description**: Thay đổi ngày nấu hoặc buổi nấu của thực đơn.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `mealId` | Integer | Có | ID của thực đơn |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `planned_date`| String (ISO)| Không | Ngày dự kiến nấu mới |
| `meal_type` | String | Không | Buổi nấu mới |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Meal updated" }` |

---

## 7. Xóa thực đơn (Remove)
- **Method**: `DELETE`
- **URL**: `/api/meals/:mealId`
- **Description**: Hủy bỏ kế hoạch nấu ăn khỏi lịch.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `mealId` | Integer | Có | ID của thực đơn |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Meal removed successfully" }` |
