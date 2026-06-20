# Đặc tả Giao diện Hệ thống (API Specification) - Recipes

Tài liệu này mô tả chi tiết giao diện giao tiếp (API) cho phân hệ Công thức nấu ăn (Recipes).

---

## 1. Tìm kiếm công thức (Find All)
- **Method**: `GET`
- **URL**: `/api/recipes`
- **Description**: Lấy danh sách công thức nấu ăn, hỗ trợ tìm kiếm và phân trang.
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Parameters (Query)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `search` | String | Không | Từ khóa tên món ăn |
| `page` | Integer | Không | Trang hiện tại (Mặc định: 1) |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "data": [{ "id": 1, "name": "Sườn xào chua ngọt" }], "total": 1 }` |

---

## 2. Gợi ý công thức (Get Suggestions)
- **Method**: `GET`
- **URL**: `/api/recipes/suggestions`
- **Description**: Thuật toán gợi ý các món ăn dựa trên nguyên liệu hiện đang có sẵn trong Tủ lạnh (Pantry) của gia đình.
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters**
Không yêu cầu tham số.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `[{ "id": 1, "name": "Trứng rán", "match_percentage": 100 }, { "id": 2, "name": "Thịt kho", "match_percentage": 80 }]` |

---

## 3. Danh sách yêu thích (Find Favorites)
- **Method**: `GET`
- **URL**: `/api/recipes/favorites`
- **Description**: Lấy danh sách các món ăn người dùng đã lưu vào mục yêu thích.
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Parameters**
Không yêu cầu tham số.

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `[{ "recipe_id": 5, "name": "Cơm rang" }]` |

---

## 4. Xem chi tiết công thức (Find One)
- **Method**: `GET`
- **URL**: `/api/recipes/:recipeId`
- **Description**: Xem toàn bộ hướng dẫn nấu ăn và danh sách nguyên liệu của một món.
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `recipeId` | Integer | Có | ID của công thức |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "id": 5, "name": "Cơm rang", "instructions": "...", "ingredients": [...] }` |

---

## 5. Thêm vào yêu thích (Add Favorite)
- **Method**: `POST`
- **URL**: `/api/recipes/:recipeId/favorite`
- **Description**: Thêm món ăn vào danh sách yêu thích.
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `recipeId` | Integer | Có | ID của công thức |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Added to favorites" }` |

---

## 6. Bỏ yêu thích (Remove Favorite)
- **Method**: `DELETE`
- **URL**: `/api/recipes/:recipeId/favorite`
- **Description**: Xóa món ăn khỏi danh sách yêu thích.
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `recipeId` | Integer | Có | ID của công thức |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Removed from favorites" }` |

---

## 7. Tính toán nguyên liệu thiếu (Get Missing Ingredients)
- **Method**: `GET`
- **URL**: `/api/recipes/:recipeId/missing-ingredients`
- **Description**: Tính toán nguyên liệu cần mua để nấu món này (so với tủ lạnh hiện tại).
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `recipeId` | Integer | Có | ID của công thức |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `[{ "food_id": 3, "name": "Cà chua", "needed": 2, "unit": "quả" }]` |

---

## 8. Tạo danh sách mua sắm (Generate Shopping List)
- **Method**: `POST`
- **URL**: `/api/recipes/:recipeId/generate-shopping-list`
- **Description**: Chuyển đổi các nguyên liệu thiếu thành một phiếu đi chợ (Shopping List).
- **Yêu cầu quyền**: Thành viên gia đình (Family Member).

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `recipeId` | Integer | Có | ID của công thức |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "list_id": 5, "items_added": 3 }` |

---

## 9. Đóng góp công thức mới (Create)
- **Method**: `POST`
- **URL**: `/api/recipes`
- **Description**: Người dùng tự thêm công thức nấu ăn mới vào hệ thống (Chờ Admin duyệt).
- **Yêu cầu quyền**: Người dùng đã đăng nhập (User).

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `name` | String | Có | Tên món ăn |
| `instructions`| String | Có | Cách làm chi tiết |
| `ingredients` | Array | Có | Danh sách `food_id`, `quantity`, `unit` |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **201 Created** | Thành công | `{ "id": 15, "status": "pending_approval" }` |

---

## 10. Chỉnh sửa công thức (Update)
- **Method**: `PATCH`
- **URL**: `/api/recipes/:recipeId`
- **Description**: Sửa công thức cá nhân đã đóng góp.
- **Yêu cầu quyền**: Tác giả (Tạo ra công thức đó) hoặc Admin.

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `recipeId` | Integer | Có | ID của công thức |

**Request Body (JSON)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `instructions`| String | Không | Hướng dẫn mới |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Recipe updated" }` |

---

## 11. Xóa công thức (Remove)
- **Method**: `DELETE`
- **URL**: `/api/recipes/:recipeId`
- **Description**: Xóa bỏ công thức khỏi hệ thống.
- **Yêu cầu quyền**: Tác giả hoặc Admin.

**Request Parameters (Path)**
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `recipeId` | Integer | Có | ID của công thức |

**Responses**
| HTTP Status | Trường hợp | Cấu trúc dữ liệu trả về (JSON) |
| :--- | :--- | :--- |
| **200 OK** | Thành công | `{ "message": "Recipe deleted" }` |
