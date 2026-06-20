# ĐẶC TẢ USE CASE HỆ THỐNG NAVIMART (USE CASE SPECIFICATIONS)

*Lưu ý: Tài liệu này được biên soạn dưới định dạng Markdown để đảm bảo cấu trúc văn bản. Bạn có thể copy nội dung này dán sang Microsoft Word (hoặc dùng Export to Word) để lưu thành file `US.docx` như mong muốn.*

---

## PHÂN HỆ 1: XÁC THỰC VÀ QUẢN LÝ TÀI KHOẢN

### 1. UC001: Đăng ký tài khoản
- **Mã Use Case:** UC001
- **Tác nhân (Actor):** Khách (Guest)
- **Mô tả ngắn:** Cho phép người dùng chưa có tài khoản tạo mới tài khoản để sử dụng hệ thống.
- **Tiền điều kiện:** Thiết bị có kết nối mạng.
- **Luồng sự kiện chính (Basic Flow):**
  1. Người dùng truy cập ứng dụng và chọn "Đăng ký".
  2. Hệ thống hiển thị biểu mẫu đăng ký (Họ tên, Email/SĐT, Mật khẩu).
  3. Người dùng điền đầy đủ thông tin hợp lệ và nhấn "Đăng ký".
  4. Hệ thống kiểm tra dữ liệu, xác nhận Email/SĐT chưa từng được sử dụng.
  5. Hệ thống lưu thông tin, gửi mã OTP (hoặc link xác thực) tới Email/SĐT.
  6. Người dùng nhập mã xác thực thành công.
  7. Hệ thống thông báo đăng ký thành công và chuyển hướng đến trang Đăng nhập.
- **Luồng thay thế (Alternative Flow/Exceptions):**
  - *4a. Email/SĐT đã tồn tại:* Hệ thống báo lỗi "Tài khoản đã tồn tại" và yêu cầu nhập lại hoặc chuyển sang Đăng nhập.
  - *6a. Nhập sai OTP:* Hệ thống báo lỗi, cho phép nhập lại hoặc gửi lại mã (tối đa 3 lần).
- **Hậu điều kiện:** Một tài khoản người dùng mới được tạo trong cơ sở dữ liệu ở trạng thái hoạt động.

### 2. UC002: Đăng nhập hệ thống (Email/SĐT)
- **Mã Use Case:** UC002
- **Tác nhân (Actor):** Người dùng (User), Quản trị viên (Admin)
- **Mô tả ngắn:** Cho phép người dùng truy cập vào hệ thống.
- **Tiền điều kiện:** Người dùng đã có tài khoản.
- **Luồng sự kiện chính:**
  1. Người dùng mở ứng dụng, chọn "Đăng nhập".
  2. Người dùng nhập Email/SĐT và Mật khẩu.
  3. Nhấn "Đăng nhập".
  4. Hệ thống kiểm tra thông tin.
  5. Thông tin hợp lệ, hệ thống sinh ra Token và cấp quyền truy cập.
  6. Chuyển hướng người dùng vào Trang chủ.
- **Luồng thay thế:**
  - *4a. Sai thông tin:* Hệ thống báo lỗi "Tài khoản hoặc mật khẩu không chính xác".
  - *4b. Tài khoản bị khóa:* Hệ thống thông báo "Tài khoản của bạn đã bị khóa".
- **Hậu điều kiện:** Người dùng đăng nhập thành công.

### 3. UC003: Đăng nhập qua mạng xã hội (OAuth Google/Facebook)
- **Mã Use Case:** UC003
- **Tác nhân:** Khách
- **Mô tả ngắn:** Đăng nhập nhanh bằng tài khoản Google hoặc Facebook.
- **Tiền điều kiện:** Có tài khoản mạng xã hội.
- **Luồng sự kiện chính:**
  1. Người dùng chọn "Đăng nhập với Google/Facebook".
  2. Hệ thống gọi API của nhà cung cấp để xác thực.
  3. Người dùng đồng ý cấp quyền truy cập thông tin cơ bản (Email, Tên).
  4. Hệ thống nhận dữ liệu, kiểm tra Email đã tồn tại trong CSDL chưa.
  5. Nếu chưa, tự động tạo tài khoản mới. Nếu có, tiến hành đăng nhập.
  6. Chuyển hướng vào Trang chủ.
- **Luồng thay thế:**
  - *3a. Người dùng từ chối cấp quyền:* Hủy bỏ đăng nhập.
- **Hậu điều kiện:** Người dùng đăng nhập thành công.

### 4. UC004: Quên mật khẩu & Đặt lại mật khẩu
- **Mã Use Case:** UC004
- **Tác nhân:** Người dùng
- **Mô tả ngắn:** Hỗ trợ lấy lại quyền truy cập khi quên mật khẩu.
- **Luồng sự kiện chính:**
  1. Tại màn hình Đăng nhập, người dùng chọn "Quên mật khẩu".
  2. Hệ thống yêu cầu nhập Email/SĐT đã đăng ký.
  3. Người dùng nhập thông tin và nhấn "Gửi".
  4. Hệ thống kiểm tra và gửi mã OTP đặt lại mật khẩu.
  5. Người dùng nhập mã OTP và Mật khẩu mới.
  6. Hệ thống cập nhật mật khẩu mới.
- **Luồng thay thế:**
  - *4a. Email/SĐT không tồn tại:* Báo lỗi "Tài khoản không tồn tại".
- **Hậu điều kiện:** Mật khẩu được thay đổi thành công.

### 5. UC005: Xem và Cập nhật thông tin cá nhân
- **Mã Use Case:** UC005
- **Tác nhân:** Người dùng
- **Mô tả ngắn:** Xem và thay đổi thông tin Profile (Avatar, Tên, SĐT).
- **Tiền điều kiện:** Đã đăng nhập.
- **Luồng sự kiện chính:**
  1. Người dùng vào mục "Tài khoản/Profile".
  2. Hệ thống hiển thị thông tin hiện tại.
  3. Người dùng nhấn "Chỉnh sửa".
  4. Người dùng thay đổi thông tin (đổi ảnh đại diện, đổi tên) và nhấn "Lưu".
  5. Hệ thống kiểm tra tính hợp lệ và cập nhật CSDL.
  6. Hệ thống hiển thị thông báo "Cập nhật thành công".
- **Hậu điều kiện:** Thông tin cá nhân được cập nhật.

### 6. UC006: Đổi mật khẩu
- **Mã Use Case:** UC006
- **Tác nhân:** Người dùng
- **Mô tả ngắn:** Thay đổi mật khẩu khi đang đăng nhập.
- **Luồng sự kiện chính:**
  1. Tại mục "Tài khoản", chọn "Đổi mật khẩu".
  2. Nhập Mật khẩu cũ, Mật khẩu mới và Xác nhận mật khẩu mới.
  3. Nhấn "Lưu".
  4. Hệ thống kiểm tra Mật khẩu cũ chính xác và cập nhật Mật khẩu mới.
- **Luồng thay thế:**
  - *4a. Mật khẩu cũ sai:* Hệ thống báo lỗi yêu cầu nhập lại.
- **Hậu điều kiện:** Mật khẩu được cập nhật.

### 7. UC007: Đăng xuất
- **Mã Use Case:** UC007
- **Tác nhân:** Người dùng
- **Mô tả ngắn:** Thoát khỏi tài khoản hiện tại.
- **Luồng sự kiện chính:**
  1. Người dùng chọn "Đăng xuất" tại menu cài đặt.
  2. Hệ thống hiển thị popup xác nhận.
  3. Người dùng nhấn "Đồng ý".
  4. Hệ thống hủy token hiện tại và chuyển về màn hình Đăng nhập.
- **Hậu điều kiện:** Kết thúc phiên làm việc của người dùng.

---

## PHÂN HỆ 2: QUẢN LÝ NHÓM GIA ĐÌNH

### 8. UC008: Tạo nhóm gia đình
- **Mã Use Case:** UC008
- **Tác nhân:** Người dùng (Owner)
- **Mô tả ngắn:** Tạo một không gian dùng chung để chia sẻ tủ lạnh và danh sách đi chợ.
- **Tiền điều kiện:** Chưa thuộc nhóm gia đình nào.
- **Luồng sự kiện chính:**
  1. Người dùng chọn chức năng "Tạo gia đình mới".
  2. Nhập Tên gia đình (vd: "Nhà của Cún").
  3. Nhấn "Tạo".
  4. Hệ thống tạo bản ghi gia đình mới, gán quyền "Owner" (Chủ nhóm) cho người dùng này.
  5. Chuyển đến màn hình Quản lý nhóm.
- **Hậu điều kiện:** Một nhóm gia đình mới được tạo.

### 9. UC009: Xem thông tin nhóm gia đình & Danh sách thành viên
- **Mã Use Case:** UC009
- **Tác nhân:** Người dùng trong nhóm
- **Mô tả ngắn:** Xem các thành viên đang có mặt trong nhóm.
- **Luồng sự kiện chính:**
  1. Chọn "Gia đình của tôi".
  2. Hệ thống truy vấn và hiển thị Tên gia đình, danh sách thành viên kèm vai trò (Owner, Editor, Viewer).

### 10. UC010: Tạo mã mời/Link mời thành viên mới
- **Mã Use Case:** UC010
- **Tác nhân:** Người dùng (Owner)
- **Mô tả ngắn:** Chủ nhóm tạo ra mã để mời người thân.
- **Tiền điều kiện:** Là Owner của nhóm.
- **Luồng sự kiện chính:**
  1. Owner chọn "Mời thành viên".
  2. Hệ thống sinh ra một Mã Code (hoặc QR) có hiệu lực 24h.
  3. Owner copy mã hoặc gửi trực tiếp qua ứng dụng khác.

### 11. UC011: Tham gia nhóm gia đình
- **Mã Use Case:** UC011
- **Tác nhân:** Người dùng
- **Mô tả ngắn:** Người dùng gia nhập nhóm bằng mã mời.
- **Tiền điều kiện:** Có mã mời hợp lệ.
- **Luồng sự kiện chính:**
  1. Người dùng chọn "Tham gia gia đình".
  2. Nhập Mã mời hoặc quét QR.
  3. Nhấn "Xác nhận".
  4. Hệ thống kiểm tra mã. Nếu hợp lệ, thêm người dùng vào nhóm với quyền mặc định.
  5. Hiển thị thông báo tham gia thành công.
- **Luồng thay thế:**
  - *4a. Mã hết hạn hoặc không hợp lệ:* Báo lỗi "Mã mời không tồn tại hoặc đã hết hạn".
- **Hậu điều kiện:** Người dùng trở thành thành viên của nhóm.

### 12. UC012: Cập nhật phân quyền cho thành viên
- **Mã Use Case:** UC012
- **Tác nhân:** Người dùng (Owner)
- **Mô tả ngắn:** Owner thay đổi quyền của thành viên (Edit list, Edit pantry, View only).
- **Luồng sự kiện chính:**
  1. Tại danh sách thành viên, Owner nhấn vào biểu tượng sửa quyền của 1 thành viên.
  2. Chọn quyền mới từ danh sách dropdown.
  3. Hệ thống lưu lại cài đặt quyền và áp dụng ngay lập tức.

### 13. UC013: Xóa thành viên khỏi nhóm (Kick)
- **Mã Use Case:** UC013
- **Tác nhân:** Người dùng (Owner)
- **Mô tả ngắn:** Đuổi một người dùng ra khỏi nhóm.
- **Luồng sự kiện chính:**
  1. Owner chọn "Xóa" cạnh tên thành viên.
  2. Xác nhận "Bạn có chắc chắn muốn xóa?".
  3. Nhấn Đồng ý, hệ thống gỡ thành viên khỏi nhóm.
- **Hậu điều kiện:** Người bị xóa không còn quyền truy cập dữ liệu nhóm.

### 14. UC014: Rời khỏi nhóm gia đình
- **Mã Use Case:** UC014
- **Tác nhân:** Thành viên nhóm (Không phải Owner)
- **Mô tả ngắn:** Tự động rời khỏi nhóm hiện tại.
- **Luồng sự kiện chính:**
  1. Chọn "Rời nhóm".
  2. Xác nhận thao tác.
  3. Hệ thống gỡ user khỏi gia đình.

---

## PHÂN HỆ 3: QUẢN LÝ DANH SÁCH MUA SẮM

### 15. UC015: Tạo mới danh sách mua sắm
- **Mã Use Case:** UC015
- **Tác nhân:** Người dùng (Quyền Edit List)
- **Luồng sự kiện chính:**
  1. Chọn tab "Mua sắm", nhấn "Tạo danh sách mới".
  2. Nhập Tên danh sách (vd: Chợ cuối tuần).
  3. Nhấn Lưu, hệ thống tạo một danh sách trống.

### 16. UC016: Xem, Sửa tên, Xóa danh sách mua sắm
- **Mã Use Case:** UC016
- **Tác nhân:** Người dùng (Quyền Edit List)
- **Luồng sự kiện chính:**
  1. Chọn biểu tượng Tùy chọn (3 chấm) trên một danh sách.
  2. Chọn "Đổi tên", nhập tên mới và lưu. Hoặc chọn "Xóa".
  3. Nếu chọn Xóa, hệ thống yêu cầu xác nhận. Sau khi xác nhận, toàn bộ danh sách và mặt hàng bên trong bị xóa khỏi view nhưng có thể được lưu trữ mềm (soft-delete).

### 17. UC017: Thêm mặt hàng vào danh sách
- **Mã Use Case:** UC017
- **Tác nhân:** Người dùng (Quyền Edit List)
- **Luồng sự kiện chính:**
  1. Mở một danh sách mua sắm.
  2. Nhập tên mặt hàng. Hệ thống gợi ý từ Master Data.
  3. Điền số lượng và đơn vị tính (vd: 2 kg).
  4. Nhấn "Thêm". Hệ thống lưu mặt hàng với trạng thái "Chưa mua".

### 18. UC018: Cập nhật và Xóa mặt hàng
- **Mã Use Case:** UC018
- **Tác nhân:** Người dùng (Quyền Edit List)
- **Luồng sự kiện chính:**
  1. Bấm vào một mặt hàng trong danh sách.
  2. Thay đổi số lượng hoặc ghi chú rồi nhấn "Lưu".
  3. Hoặc vuốt sang trái/nhấn biểu tượng thùng rác để Xóa mặt hàng đó.

### 19. UC019: Đánh dấu đã mua và Tự động chuyển vào Tủ lạnh
- **Mã Use Case:** UC019
- **Tác nhân:** Người dùng
- **Mô tả ngắn:** Khi hoàn tất đi siêu thị, hàng đã mua sẽ tự động chạy vào Pantry.
- **Tiền điều kiện:** Có mặt hàng trạng thái "Chưa mua".
- **Luồng sự kiện chính:**
  1. Bấm vào checkbox cạnh mặt hàng để đổi thành "Đã mua" (Gạch ngang).
  2. Nhấn nút "Hoàn tất đi chợ" (Finish Shopping).
  3. Hệ thống gom các mặt hàng "Đã mua", tự động tạo các bản ghi mới trong Kho thực phẩm (Pantry) tương ứng.
  4. Các mặt hàng này biến mất khỏi danh sách hiện tại.
- **Hậu điều kiện:** Tủ lạnh được cập nhật số lượng đồ ăn thực tế.

---

## PHÂN HỆ 4: QUẢN LÝ TỦ LẠNH & KHO THỰC PHẨM (PANTRY)

### 20. UC020: Xem và Tìm kiếm thực phẩm trong kho
- **Mã Use Case:** UC020
- **Tác nhân:** Người dùng
- **Luồng sự kiện chính:**
  1. Vào tab "Tủ lạnh".
  2. Hệ thống hiển thị danh sách toàn bộ thực phẩm đang có, chia theo danh mục vị trí (Tủ mát, Tủ đông, Tủ khô).
  3. Người dùng có thể nhập từ khóa vào ô tìm kiếm để lọc nhanh thực phẩm cần tìm.

### 21. UC021: Thêm mới thực phẩm vào tủ lạnh (Thủ công)
- **Mã Use Case:** UC021
- **Tác nhân:** Người dùng (Quyền Edit Pantry)
- **Luồng sự kiện chính:**
  1. Nhấn nút (+) tại tab Tủ lạnh.
  2. Nhập Tên, Số lượng, Đơn vị, Ngày hết hạn, Vị trí bảo quản.
  3. Nhấn "Lưu", hệ thống ghi nhận thực phẩm vào CSDL Pantry.

### 22. UC022: Cập nhật thông tin thực phẩm
- **Mã Use Case:** UC022
- **Tác nhân:** Người dùng (Quyền Edit Pantry)
- **Luồng sự kiện chính:**
  1. Bấm vào một thực phẩm trong tủ lạnh.
  2. Sửa thông tin (Giảm số lượng sau khi ăn 1 phần, hoặc đổi vị trí).
  3. Nhấn "Cập nhật". Hệ thống lưu trữ thay đổi.

### 23. UC023: Xóa/Thanh lý thực phẩm
- **Mã Use Case:** UC023
- **Tác nhân:** Người dùng (Quyền Edit Pantry)
- **Mô tả ngắn:** Khi ăn hết hoặc đồ bị hỏng phải vứt đi.
- **Luồng sự kiện chính:**
  1. Chọn thực phẩm cần xóa.
  2. Nhấn "Xóa".
  3. Hệ thống hỏi lý do: "Đã ăn hết" hay "Vứt bỏ do hỏng" (để phục vụ báo cáo thống kê).
  4. Hệ thống gỡ bỏ thực phẩm khỏi Pantry và cập nhật vào báo cáo.

### 24. UC024: Tự động trừ số lượng thực phẩm khi nấu ăn
- **Mã Use Case:** UC024
- **Tác nhân:** Hệ thống
- **Luồng sự kiện chính:**
  1. Người dùng xác nhận "Đã nấu xong" một công thức hoặc một món trong Lịch trình bữa ăn.
  2. Hệ thống quét các nguyên liệu trong công thức.
  3. Trừ đi số lượng tương ứng trong Pantry (nếu có).
- **Hậu điều kiện:** Số lượng thực phẩm được đồng bộ tự động.

### 25. UC025: Gửi thông báo nhắc nhở thực phẩm sắp hết hạn
- **Mã Use Case:** UC025
- **Tác nhân:** Hệ thống (CRON Job)
- **Luồng sự kiện chính:**
  1. Định kỳ quét dữ liệu Pantry mỗi ngày.
  2. Lọc các thực phẩm có (Ngày hết hạn - Ngày hiện tại) <= 2 ngày.
  3. Gửi Push Notification cảnh báo tới điện thoại của các thành viên.

---

## PHÂN HỆ 5: LÊN KẾ HOẠCH BỮA ĂN (MEAL PLANNER)

### 26. UC026: Xem lịch trình và Tạo phiên ăn
- **Mã Use Case:** UC026
- **Tác nhân:** Người dùng
- **Luồng sự kiện chính:**
  1. Người dùng vào tab "Kế hoạch nấu ăn". Hiển thị lịch theo tuần/ngày.
  2. Mặc định có 3 phiên: Sáng, Trưa, Tối.
  3. Người dùng có thể nhấn "Thêm bữa phụ" để tạo một session mới.

### 27. UC027: Thêm và Sửa món ăn trong lịch trình
- **Mã Use Case:** UC027
- **Tác nhân:** Người dùng
- **Luồng sự kiện chính:**
  1. Tại một ngày và phiên ăn cụ thể, nhấn "Thêm món".
  2. Tìm kiếm món ăn hoặc chọn từ mục Công thức yêu thích.
  3. Nhấn "Thêm". Hệ thống lưu món ăn vào lịch.
  4. Nếu muốn đổi món, nhấn vào món đó và chọn "Đổi món khác".

### 28. UC028: Xóa món ăn khỏi lịch trình
- **Mã Use Case:** UC028
- **Tác nhân:** Người dùng
- **Luồng sự kiện chính:**
  1. Nhấn giữ hoặc vuốt để xóa một món ăn khỏi một bữa ăn đã lên lịch.
  2. Hệ thống cập nhật lại giao diện lịch trình.

---

## PHÂN HỆ 6: GỢI Ý THÔNG MINH & CÔNG THỨC NẤU ĂN

### 29. UC029: Gợi ý món ăn dựa trên thực phẩm hiện có
- **Mã Use Case:** UC029
- **Tác nhân:** Hệ thống AI
- **Luồng sự kiện chính:**
  1. Nhấn nút "Gợi ý món ăn hôm nay".
  2. Hệ thống đọc danh sách Pantry.
  3. Lọc các Công thức có chứa nguyên liệu khớp với Pantry (Ưu tiên nguyên liệu sắp hết hạn).
  4. Trả về Top 5-10 món ăn.

### 30. UC030: Tìm kiếm và Xem chi tiết công thức
- **Mã Use Case:** UC030
- **Tác nhân:** Người dùng
- **Luồng sự kiện chính:**
  1. Vào kho Công thức, nhập tên (vd: "Thịt kho").
  2. Chọn một kết quả để mở chi tiết.
  3. Hệ thống hiển thị: Nguyên liệu cần chuẩn bị, Các bước thực hiện, Giá trị dinh dưỡng (nếu có).

### 31. UC031: Lưu/Bỏ lưu công thức yêu thích
- **Mã Use Case:** UC031
- **Tác nhân:** Người dùng
- **Luồng sự kiện chính:**
  1. Tại trang chi tiết công thức, nhấn biểu tượng "Trái tim" để lưu.
  2. Món ăn được đưa vào danh sách "Yêu thích".
  3. Bấm lần nữa để gỡ khỏi danh sách Yêu thích.

### 32. UC032: Tự động thêm nguyên liệu còn thiếu vào Danh sách mua sắm
- **Mã Use Case:** UC032
- **Tác nhân:** Người dùng
- **Luồng sự kiện chính:**
  1. Tại trang chi tiết công thức, hệ thống đối chiếu Nguyên liệu cần thiết với Pantry hiện tại.
  2. Hiển thị thông báo: "Bạn còn thiếu: Hành tây, Cà chua".
  3. Người dùng nhấn nút "Thêm vào danh sách đi chợ".
  4. Hệ thống tự tạo các item này trong Danh sách mua sắm đang active.

### 33. UC033: Chat tương tác với AI Chef
- **Mã Use Case:** UC033
- **Tác nhân:** Người dùng, AI
- **Luồng sự kiện chính:**
  1. Mở khung chat "Hỏi AI Chef".
  2. Nhập câu hỏi (vd: "Tối nay nấu gì ngon với 50k?").
  3. Hệ thống gọi API LLM (kết hợp prompt chứa dữ liệu Pantry hiện tại).
  4. AI phản hồi lại bằng văn bản gợi ý món kèm link công thức.

---

## PHÂN HỆ 7: BÁO CÁO & THỐNG KÊ

### 34. UC034: Xem thống kê tiêu dùng và lãng phí
- **Mã Use Case:** UC034
- **Tác nhân:** Người dùng
- **Luồng sự kiện chính:**
  1. Vào tab "Thống kê".
  2. Hệ thống tổng hợp dữ liệu từ Pantry và Danh sách đi chợ trong 30 ngày qua.
  3. Hiển thị Biểu đồ chi tiêu/số lượng hàng đã mua.
  4. Hiển thị Biểu đồ/Tỷ lệ thực phẩm vứt bỏ (dựa trên thao tác Xóa với lý do "Hỏng/Hết hạn" ở UC4.4).
- **Hậu điều kiện:** Người dùng nắm được tình hình chi tiêu thực phẩm.

---

## PHÂN HỆ 8: QUẢN TRỊ VIÊN (ADMIN)

### 35. UC035: Đăng nhập và Xem danh sách User
- **Mã Use Case:** UC035
- **Tác nhân:** Quản trị viên (Admin)
- **Luồng sự kiện chính:**
  1. Đăng nhập vào Admin Portal.
  2. Chọn "Quản lý người dùng". Hệ thống hiển thị bảng danh sách toàn bộ User đã đăng ký.

### 36. UC036: Khóa/Mở khóa tài khoản
- **Mã Use Case:** UC036
- **Tác nhân:** Admin
- **Luồng sự kiện chính:**
  1. Admin tìm kiếm một User vi phạm quy định.
  2. Nhấn nút "Block/Khóa". Nhập lý do khóa.
  3. Hệ thống cập nhật trạng thái User thành "Blocked".
  4. Lần tới User đăng nhập sẽ bị từ chối.

### 37. UC037: Quản lý Master Data (Thực phẩm, Đơn vị tính)
- **Mã Use Case:** UC037
- **Tác nhân:** Admin
- **Luồng sự kiện chính:**
  1. Vào mục Cấu hình Danh mục.
  2. Admin thêm mới các Đơn vị tính chuẩn (kg, gr, bó, quả...) và Phân loại thực phẩm (Rau củ, Thịt cá...).
  3. Hệ thống lưu lại. Dữ liệu này sẽ làm cơ sở gợi ý cho App của người dùng (tại UC3.4 và UC4.2).

### 38. UC038: Kiểm duyệt công thức nấu ăn
- **Mã Use Case:** UC038
- **Tác nhân:** Admin
- **Luồng sự kiện chính:**
  1. Nếu có tính năng User đóng góp công thức, Admin vào mục "Công thức chờ duyệt".
  2. Xem chi tiết công thức.
  3. Nhấn "Duyệt" (Publish) hoặc "Từ chối" (Reject).

### 39. UC039: Xem Dashboard tổng quan
- **Mã Use Case:** UC039
- **Tác nhân:** Admin
- **Luồng sự kiện chính:**
  1. Truy cập Trang chủ Admin.
  2. Hiển thị các chỉ số thống kê tổng quan: Tổng số User, User hoạt động trong tháng (MAU), Tổng số Gia đình đang hoạt động, Tổng số Công thức.
- **Hậu điều kiện:** Admin theo dõi được hiệu suất hoạt động của hệ thống.
