# Đặc tả Lớp (Class Specification) - Module Recipes

Tài liệu mô tả chi tiết các phương thức và thuộc tính của các lớp trong Module Recipes.

## 1. Views
### 1.1. Lớp `RecipeEditor`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện tạo/chỉnh sửa công thức.

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
- Form nhập liệu các bước nấu và nguyên liệu.

**State:**
Không

### 1.2. Lớp `RecipeDetail`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện chi tiết công thức nấu ăn.

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
- Đọc nội dung công thức và hiển thị.

**State:**
Không

### 1.3. Lớp `RecipeSuggestion`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Component React quản lý giao diện gợi ý công thức.

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
- Hiển thị danh sách món được gợi ý.

**State:**
Không

## 2. API Clients
### 2.1. Lớp `RecipesApiClient`
- **Stereotype**: `<<Boundary>>`
- **Mô tả**: Lớp gọi API bằng Axios để tương tác với Backend.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | baseUrl | String | `""` | URL gốc của backend |

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | Promise\<any\> | Lấy danh sách công thức |
| 2 | getSuggestions | Promise\<any\> | Nhận gợi ý công thức |
| 3 | findFavorites | Promise\<any\> | Lấy danh sách món yêu thích |
| 4 | findOne | Promise\<any\> | Lấy chi tiết công thức |
| 5 | addFavorite | Promise\<any\> | Thêm món vào yêu thích |
| 6 | removeFavorite | Promise\<any\> | Bỏ món khỏi yêu thích |
| 7 | getMissingIngredients | Promise\<any\> | Kiểm tra nguyên liệu thiếu |
| 8 | generateShoppingList | Promise\<any\> | Tạo danh sách mua sắm từ món ăn |
| 9 | create | Promise\<any\> | Tạo công thức |
| 10 | update | Promise\<any\> | Cập nhật công thức |
| 11 | remove | Promise\<any\> | Xóa công thức |

**Parameter:**
- `data` – Đối tượng chứa tham số cho request.

**Exception:**
- Lỗi mạng.

**Method:**
- Gọi Axios request đến API.

**State:**
Không

## 3. Controllers
### 3.1. Lớp `RecipesController`
- **Stereotype**: `<<Control>>`
- **Mô tả**: NestJS Controller nhận request từ Frontend.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | Response | Gọi Service danh sách công thức |
| 2 | getSuggestions | Response | Gọi Service lấy gợi ý |
| 3 | findFavorites | Response | Gọi Service tìm món yêu thích |
| 4 | findOne | Response | Gọi Service lấy chi tiết |
| 5 | addFavorite | Response | Gọi Service thêm yêu thích |
| 6 | removeFavorite | Response | Gọi Service xóa yêu thích |
| 7 | getMissingIngredients | Response | Gọi Service tính nguyên liệu |
| 8 | generateShoppingList | Response | Gọi Service tạo danh sách |
| 9 | create | Response | Gọi Service tạo công thức |
| 10 | update | Response | Gọi Service cập nhật |
| 11 | remove | Response | Gọi Service xóa công thức |

**Parameter:**
- `dto` – Tham số body hoặc params.

**Exception:**
- Các exception HTTP chuẩn.

**Method:**
- Điều hướng xử lý sang Service.

**State:**
Không

## 4. Services
### 4.1. Lớp `RecipesService`
- **Stereotype**: `<<Control>>`
- **Mô tả**: Lớp chứa Business Logic xử lý công thức nấu ăn.

**Attribute**
Không

**Operation**
| # | Tên | Kiểu dữ liệu trả về | Mô tả (mục đích) |
|---|---|---|---|
| 1 | findAll | any | Đọc database `recipes` |
| 2 | getSuggestions | any | Thuật toán gợi ý dựa trên nguyên liệu |
| 3 | findFavorites | any | Lọc món ăn theo bảng trung gian |
| 4 | findOne | any | Tìm chi tiết một món |
| 5 | addFavorite | any | Ghi database yêu thích |
| 6 | removeFavorite | any | Xóa database yêu thích |
| 7 | getMissingIngredients | any | So sánh `recipe_ingredients` với `inventory` |
| 8 | generateShoppingList | any | Chuyển đổi nguyên liệu thiếu thành shopping item |
| 9 | create | any | Thêm mới `recipes` |
| 10 | update | any | Sửa `recipes` |
| 11 | remove | any | Xóa `recipes` |

**Parameter:**
- `data` – Dữ liệu cấu trúc từ Controller.

**Exception:**
- Lỗi logic nghiệp vụ.

**Method:**
- CRUD Entity và thực hiện các thuật toán phức tạp như Suggestion.

**State:**
Không

## 5. Entities
### 5.1. Lớp `RecipesEntity`
- **Stereotype**: `<<Entity>>`
- **Mô tả**: Bảng lưu trữ công thức `recipes`.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | recipe_id | INT | `null` | Khóa chính |
| 2 | name | VARCHAR | `""` | Tên món ăn |
| 3 | instructions | TEXT | `""` | Hướng dẫn cách làm |
| 4 | image_url | VARCHAR | `""` | Link ảnh |
| 5 | author_id | INT | `null` | Người đóng góp |
| 6 | status | VARCHAR | `""` | Trạng thái phê duyệt |

**Operation**
Không

**Parameter:**
Không

**Exception:**
Không

**Method:**
Không

**State:**
Không

### 5.2. Lớp `RecipeIngredientsEntity`
- **Stereotype**: `<<Entity>>`
- **Mô tả**: Bảng lưu nguyên liệu từng món `recipe_ingredients`.

**Attribute**
| # | Tên | Kiểu dữ liệu | Giá trị mặc định | Mô tả |
|---|---|---|---|---|
| 1 | recipe_id | INT | `null` | Khóa món ăn |
| 2 | food_id | INT | `null` | Khóa thực phẩm |
| 3 | quantity_required | DECIMAL | `0` | Số lượng yêu cầu |

**Operation**
Không

**Parameter:**
Không

**Exception:**
Không

**Method:**
Không

**State:**
Không
