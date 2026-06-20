# Sơ đồ chuyển màn hình (Screen Flow / User Flow)

Sơ đồ dưới đây thể hiện luồng di chuyển giữa các màn hình trong ứng dụng NaviMart (Hệ thống đi chợ tiện lợi). Các mũi tên có dán nhãn (label) để giải thích thao tác hoặc điều kiện kích hoạt việc chuyển màn hình.

```mermaid
flowchart TD
    %% ===== KHỞI ĐỘNG & XÁC THỰC =====
    Start([Khởi động Ứng dụng]) --> Splash[Màn hình Splash]
    
    subgraph Auth [Phân hệ Xác thực]
        Login[Màn hình Đăng nhập]
        Register[Màn hình Đăng ký]
        ForgotPass[Màn hình Quên/Đổi mật khẩu]
    end
    
    Splash -- "Chưa đăng nhập" --> Login
    Splash -- "Đã lưu phiên" --> Home
    
    Login -- "Chọn Đăng ký" --> Register
    Register -- "Tạo TK thành công" --> Login
    Login -- "Chọn Quên mật khẩu" --> ForgotPass
    ForgotPass -- "Lấy lại MK thành công" --> Login
    
    %% ===== ĐIỀU HƯỚNG CHÍNH =====
    Login -- "Nhập đúng thông tin<br>(hoặc OAuth)" --> Home
    
    subgraph MainNav [Điều hướng chính - Bottom Tabs]
        Home[Trang chủ / Bảng tin]
        ShoppingTab[Tab Mua sắm]
        PantryTab[Tab Tủ lạnh]
        MealTab[Tab Kế hoạch]
        ProfileTab[Tab Cá nhân]
    end
    
    Home --- ShoppingTab
    Home --- PantryTab
    Home --- MealTab
    Home --- ProfileTab
    
    %% ===== MUA SẮM (SHOPPING LIST) =====
    subgraph Shopping [Quản lý Mua sắm]
        ListDetail[Chi tiết Danh sách]
        ItemForm[Thêm/Sửa mặt hàng]
    end
    
    ShoppingTab -- "Tạo mới/Chọn danh sách" --> ListDetail
    ListDetail -- "Thêm/Bấm vào mặt hàng" --> ItemForm
    ItemForm -- "Lưu" --> ListDetail
    ListDetail -- "Hoàn tất đi chợ" --> PantryTab
    
    %% ===== TỦ LẠNH (PANTRY) =====
    subgraph Pantry [Quản lý Tủ lạnh]
        FoodDetail[Chi tiết Thực phẩm]
    end
    
    PantryTab -- "Bấm + hoặc Chọn thực phẩm" --> FoodDetail
    FoodDetail -- "Cập nhật/Xóa" --> PantryTab
    
    %% ===== KẾ HOẠCH & CÔNG THỨC =====
    subgraph PlanRecipe [Kế hoạch & Công thức]
        RecipeList[Danh sách Công thức]
        RecipeDetail[Chi tiết Công thức]
        AIChef[Chat với AI Chef]
    end
    
    MealTab -- "Thêm món vào lịch" --> RecipeList
    Home -- "Gợi ý món ăn / Khám phá" --> RecipeList
    Home -- "Hỏi AI Chef" --> AIChef
    
    RecipeList -- "Bấm vào công thức" --> RecipeDetail
    RecipeDetail -- "Thiếu nguyên liệu" --> ShoppingTab
    RecipeDetail -- "Nấu xong" --> PantryTab
    
    %% ===== CÁ NHÂN & GIA ĐÌNH =====
    subgraph ProfileGroup [Cá nhân & Gia đình]
        EditProfile[Sửa thông tin]
        Stats[Thống kê chi tiêu]
        FamilyManager[Quản lý Nhóm Gia đình]
        InviteScreen[Mã QR / Link mời]
    end
    
    ProfileTab -- "Chỉnh sửa" --> EditProfile
    ProfileTab -- "Xem thống kê" --> Stats
    ProfileTab -- "Gia đình của tôi" --> FamilyManager
    ProfileTab -- "Đăng xuất" --> Login
    
    FamilyManager -- "Mời thành viên" --> InviteScreen
    FamilyManager -- "Nhập mã tham gia" --> FamilyManager

    %% ===== ADMIN PORTAL =====
    subgraph Admin [Admin Web Portal]
        AdminLogin[Đăng nhập Admin]
        AdminDash[Admin Dashboard]
        AdminUsers[Quản lý Users]
        AdminMaster[Cấu hình Danh mục]
    end
    
    Start -- "Web Access" --> AdminLogin
    AdminLogin -- "Đăng nhập" --> AdminDash
    AdminDash -- "Chọn menu" --> AdminUsers
    AdminDash -- "Chọn menu" --> AdminMaster
```

### Chú thích các luồng quan trọng:
1. **Luồng Hoàn tất đi chợ (Finish Shopping):** Khi người dùng mua xong, hàng hóa từ `Chi tiết Danh sách` sẽ được kích hoạt chạy thẳng vào hệ thống `Tab Tủ lạnh` và tự động tăng số lượng.
2. **Luồng Nấu ăn (Cook):** Khi đánh dấu "Nấu xong" từ một `Chi tiết Công thức`, hệ thống sẽ tự động trừ nguyên liệu tương ứng trong `Tab Tủ lạnh`.
3. **Luồng Bổ sung nguyên liệu:** Nếu xem `Chi tiết Công thức` mà hệ thống phát hiện Tủ lạnh không đủ đồ, sẽ có luồng điều hướng thẳng sang `Tab Mua sắm` để thêm các món còn thiếu vào danh sách đi chợ.
4. **Luồng Gia đình:** Các thành viên trong cùng một gia đình (khi dùng chung mã từ `Quản lý Nhóm Gia đình`) sẽ dùng chung trạng thái của cả 4 tab: Tủ lạnh, Mua sắm, Kế hoạch và Công thức.
