# Hướng dẫn tra cứu và bảo trì dự án Guline

Tài liệu này giúp xác định chức năng nằm ở đâu và cần kiểm tra những lớp nào khi cập nhật website hoặc trang quản trị.

## 1. Cấu trúc tổng quan

| Đường dẫn | Vai trò |
|---|---|
| `server.js` | Express server, cấu hình mặc định, xác thực, API công khai và API admin. |
| `src/database/connection.js` | Cấu hình PostgreSQL, connection pool, truy vấn và transaction. |
| `src/database/schema.js` | Tạo bảng và khởi tạo tài khoản admin ban đầu. |
| `src/database/index.js` | Điểm vào gom API database để `server.js` sử dụng. |
| `public/site/index.html` | HTML của website chính. |
| `public/site/css/` | Stylesheet riêng cho website chính. |
| `public/site/js/` | JavaScript tải dữ liệu và điều khiển website chính. |
| `public/admin/index.html` | HTML, menu và template của trang quản trị. |
| `public/admin/css/` | Stylesheet riêng cho trang quản trị. |
| `public/admin/js/` | JavaScript đăng nhập, CRUD và tương tác trang quản trị. |
| `public/uploads/` | Ảnh được admin tải lên; dữ liệu ảnh thật nằm trên ổ đĩa. |
| `.env.example` | Mẫu biến môi trường để cấu hình cổng, PostgreSQL và JWT. |
| `package.json` | Lệnh chạy ứng dụng và các dependency Node.js. |

### Quy tắc phân chia thư mục

- `public/site/` chỉ chứa giao diện khách truy cập: HTML, CSS và JavaScript của trang chính.
- `public/admin/` chỉ chứa giao diện quản trị: HTML, CSS và JavaScript của admin.
- `src/database/` chỉ chứa kết nối/truy vấn và khởi tạo schema; `server.js` là điểm nối HTTP/API hiện tại.
- Tài nguyên trong `public/` được Express phục vụ tĩnh. Trang chính `/` được ánh xạ tới `public/site/index.html`; trang admin `/admin` được ánh xạ tới `public/admin/index.html`.
- URL mới cho tài nguyên là `/site/...` và `/admin/...`. Các URL CSS/JS cũ được giữ làm alias trong `server.js`; khi sửa HTML, dùng URL mới theo đúng khu vực.

## 2. Chức năng nằm ở đâu?

| Chức năng | Website / giao diện admin | JavaScript giao diện | API / database |
|---|---|---|---|
| Trang chủ, điều hướng và bố cục các khu vực | `public/site/index.html` | `public/site/js/main.js` | — |
| Banner / hero slides | Vùng `#heroSlider` trong `public/site/index.html`; template `tpl-hero-slides` trong admin | `main.js`: `loadHeroSlides`, `renderHeroSlides`; `admin.js`: `loadSlides`, `saveSlide`, `deleteSlide` | `/api/hero-slides`, `/api/admin/hero-slides`; bảng `hero_slides` |
| Danh mục và bộ lọc sản phẩm | Vùng danh mục/footer trong `public/site/index.html`; template `tpl-categories` trong admin | `main.js`: `loadCategories`, render danh mục/footer/filter; `admin.js`: `loadCategories`, `saveCategory`, `deleteCategory` | `/api/categories`, `/api/admin/categories`; bảng `categories` |
| Danh sách, lọc và chi tiết sản phẩm | Template `tpl-products`, modal trong `public/admin/index.html`; vùng sản phẩm trong `public/site/index.html` | `main.js`: tải/render/lọc/mở chi tiết; `admin.js`: `loadProducts`, `saveProduct`, `deleteProduct` | `/api/products`, `/api/admin/products`; bảng `products` |
| Liên hệ, Zalo, email và địa chỉ | Form/liên hệ/footer trong `public/site/index.html`; template `tpl-contacts` | `main.js`: `setupContactForm`, `applySettings`; `admin.js`: `loadContacts`, `viewContact`, `deleteContact` | `/api/contacts`; `/api/admin/contacts`; bảng `contacts`; thông tin công ty ở `settings` |
| Về chúng tôi | Section `#about` trong `public/site/index.html` | `main.js`: `applySettings`, render `aboutStats`, bộ đếm số liệu | `/api/settings`; các key `about*` trong bảng `settings` |
| Cam kết | Vùng cam kết trong `public/site/index.html`; form trong `tpl-settings` | `main.js`: render `features`; `admin.js`: `renderFeatureSettings`, `saveSettings` | `/api/settings`; keys `features`, `featuresTitle` |
| Tên công ty, logo, liên kết mạng xã hội và thông tin website | Header/footer website; form `tpl-settings` | `main.js`: `applySettings`; `admin.js`: `fillSettingsForm`, `saveSettings`, trình chọn social links | `/api/settings`; các key được lưu trong bảng `settings` |
| Lịch sử ảnh đã upload | Template `tpl-upload-history` trong admin | `admin.js`: `loadUploadHistory`, `deleteUploadedImage` | `/api/admin/uploads`, `/api/admin/uploads/:id`; bảng `uploaded_images`; file trong `public/uploads/` |
| Lịch sử hoạt động admin | Template `tpl-admin-history` trong admin | `admin.js`: `loadAdminHistory` | `/api/admin/audit-logs`; bảng `admin_audit_logs`; ghi nhận từ middleware trong `server.js` |
| Đăng nhập/đăng xuất | Login form và admin layout trong `public/admin/index.html` | `public/admin/js/admin.js`: `checkAuth`, `showLogin`, `showAdmin`, `handleLogout` | `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`; bảng `users` |

## 3. Luồng dữ liệu cần nhớ

### Website

1. Sửa bố cục/section tại `public/site/index.html`; các `id` ở đây được `main.js` sử dụng.
2. Sửa tương tác, tải API và render nội dung tại `public/site/js/main.js`.
3. Sửa giao diện tại `public/site/css/style.css`.
4. Endpoint công khai nằm trong `server.js`; truy vấn DB đi qua `src/database/index.js` và `src/database/connection.js`.

### Admin

1. Sửa menu, form và template `tpl-*` tại `public/admin/index.html`.
2. Sửa đăng nhập, điều hướng hash, CRUD và xử lý dữ liệu tại `public/admin/js/admin.js`.
3. Sửa giao diện tại `public/admin/css/admin.css`.
4. Endpoint admin và xác thực cookie nằm trong `server.js`; ảnh upload được ghi vào `public/uploads/`.

Khi sửa một chức năng có cả website và admin, kiểm tra cả hai thư mục `public/site/` và `public/admin/`, cùng endpoint liên quan trong `server.js`. Không chuyển file giao diện dùng chung sang thư mục của khu vực còn lại nếu trang kia cũng cần sử dụng.

### Ảnh

- Luồng chuẩn là chọn file → gọi `/api/upload` → nhận URL `/uploads/...` → lưu URL vào sản phẩm, danh mục, slide hoặc setting.
- Không gửi trực tiếp `FormData` vào API CRUD JSON.
- Khi tải lịch sử, API đồng bộ các file đang có trong `public/uploads/` vào danh sách quản lý ảnh.
- Ảnh đang được sản phẩm, gallery, danh mục, slide hoặc setting sử dụng sẽ không được xóa.
- Tệp không sử dụng chỉ được xóa qua API admin; không xóa thủ công khi chưa kiểm tra tham chiếu.

### Lịch sử admin

- Middleware của router admin ghi nhận thao tác ghi/xóa sau khi API hoàn tất thành công.
- Lịch sử bắt đầu từ lúc chức năng được triển khai; các thao tác cũ không được tạo lại.
- Endpoint lịch sử yêu cầu admin đăng nhập, không được thêm vào API công khai.

## 4. Danh sách API tra cứu nhanh

### API công khai

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/categories` | Danh mục và số lượng sản phẩm |
| GET | `/api/products` | Danh sách sản phẩm; hỗ trợ lọc query |
| GET | `/api/products/:id` | Chi tiết sản phẩm |
| GET | `/api/hero-slides` | Các slide đang hoạt động |
| GET | `/api/settings` | Cài đặt website để render trang chính |
| POST | `/api/contacts` | Gửi form liên hệ |

### API admin

Các API admin cần cookie xác thực. Nhiều route cũ cũng được mount dưới `/api/...`; các trang lịch sử dùng đường dẫn chuẩn `/api/admin/...`.

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/admin/dashboard` | Thống kê admin |
| POST | `/api/admin/upload` | Upload một ảnh |
| POST | `/api/admin/upload-multiple` | Upload gallery |
| GET / DELETE | `/api/admin/uploads`, `/api/admin/uploads/:id` | Xem lịch sử ảnh / xóa ảnh không còn được dùng |
| GET | `/api/admin/audit-logs` | Xem tối đa 500 thao tác admin gần nhất |
| GET / POST / PUT / DELETE | `/api/admin/products...` | CRUD sản phẩm |
| GET / POST / PUT / DELETE | `/api/admin/categories...` | CRUD danh mục |
| GET / POST / PUT / DELETE | `/api/admin/hero-slides...` | CRUD slide |
| GET | `/api/settings` | Đọc cài đặt website; được dùng bởi website và form admin |
| PUT | `/api/admin/settings` | Lưu cài đặt website |
| GET / PUT / DELETE | `/api/admin/contacts...` | Quản lý tin nhắn liên hệ |

Khi thêm route mới, kiểm tra route được khai báo **trước** fallback 404 API ở cuối `server.js`.

## 5. Cơ sở dữ liệu

Các bảng được khởi tạo bằng `initializeDatabase()` trong `src/database/schema.js`:

| Bảng | Dữ liệu |
|---|---|
| `users` | Tài khoản admin và mật khẩu đã băm |
| `products` | Sản phẩm, ảnh chính, gallery, danh mục |
| `categories` | Danh mục |
| `hero_slides` | Nội dung banner |
| `settings` | Các thiết lập dạng key/value; danh sách như `features`, `aboutStats`, `socialLinks` được lưu JSON string |
| `contacts` | Tin nhắn khách gửi từ website |
| `uploaded_images` | Thông tin tệp ảnh upload và người upload |
| `admin_audit_logs` | Nhật ký thao tác admin |

Khi thêm bảng/cột, cập nhật schema trong `src/database/schema.js` và kiểm tra khởi động với PostgreSQL. Không chỉ sửa giao diện nếu dữ liệu cần lưu lâu dài.

## 6. CSS và responsive

- `public/site/`: giao diện website chính; server phục vụ trang tại `/`.
- `public/admin/`: giao diện quản trị; server phục vụ trang tại `/admin`.
- HTML mới phải tham chiếu đúng stylesheet và script trong khu vực tương ứng: `/site/css/style.css`, `/site/js/main.js`, `/admin/css/admin.css`, `/admin/js/admin.js`.
- Các URL tài nguyên cũ `/css/style.css`, `/css/admin.css`, `/js/main.js` và `/js/admin.js` vẫn được ánh xạ trong `server.js` để tránh làm hỏng client/bookmark cũ; không dùng các URL alias này cho HTML mới.
- `public/site/css/style.css`: giao diện công khai. Tìm các khối theo selector của section, ví dụ `.hero`, `.about__*`, `.categories__*`, `.products__*`, `.features__*`, `.contact__*`, `.footer__*`, `.modal`.
- `public/admin/css/admin.css`: đăng nhập, sidebar/topbar, dashboard, bảng, form, upload ảnh, modal và các thẻ lịch sử.
- Các media query responsive nằm ở cuối hai file CSS. Sau khi sửa một thành phần, kiểm tra cả màn hình desktop và các breakpoint mobile hiện có để tránh rule cũ ghi đè.
- Nếu thêm lớp HTML mới, đặt tên nhất quán với component/section đang sửa và thêm style responsive tương ứng.

## 7. Quy trình cập nhật an toàn

1. Xác định khu vực trước: website ở `public/site/`, admin ở `public/admin/`.
2. Tìm HTML/template, lần theo `id`/class đến JavaScript của cùng khu vực.
3. Kiểm tra API và middleware trong `server.js`; kiểm tra bảng trong `src/database/schema.js` và truy vấn trong `src/database/connection.js`.
4. Với nội dung cần đồng bộ, cập nhật cả: form admin → payload lưu → API/database → API đọc → render website.
5. Với ảnh, dùng endpoint upload; xác minh URL đã được lưu và lịch sử nhận được tệp.
6. Sửa CSS trong stylesheet tương ứng; kiểm tra desktop/mobile.
7. Chạy lệnh kiểm tra:

   ```powershell
   node --check .\server.js
   node --check .\src\database\connection.js
   node --check .\src\database\schema.js
   node --check .\src\database\index.js
   node --check .\public\site\js\main.js
   node --check .\public\admin\js\admin.js
   ```

8. Khởi động lại server sau khi sửa `server.js` hoặc `src/database/`; hard refresh trình duyệt sau khi sửa JavaScript/CSS.
9. Kiểm tra API đã đăng nhập khi thử endpoint admin. `401` nghĩa là route yêu cầu đăng nhập; `404` nghĩa là sai route, server cũ hoặc route chưa được khai báo trước fallback.

## 8. Cấu hình và dữ liệu nhạy cảm

- Kết nối PostgreSQL, cổng và JWT đọc từ biến môi trường; xem tên biến trong `.env.example`.
- Không đưa `.env`, mật khẩu database, JWT secret hoặc thông tin đăng nhập vào tài liệu, mã nguồn công khai hay commit.
- Đặt `JWT_SECRET` riêng dài ít nhất 32 ký tự trong môi trường chạy; không ghi giá trị thật vào `.env.example`.
- Cài đặt mặc định cho website nằm ở `DEFAULT_SETTINGS` trong `server.js`; cài đặt đã lưu trong bảng `settings` được ưu tiên.
- Server hiện phục vụ tệp trong `public/` trực tiếp; ảnh người dùng tải lên vì vậy có URL công khai. Không lưu tài liệu bí mật trong `public/uploads/`.

## 9. Ghi chú vận hành

- `npm start` và `npm run dev` chạy Express ở foreground. Đây là web server nên terminal giữ lệnh hoạt động liên tục để website/API tiếp tục truy cập được; bình thường lệnh này không tự kết thúc.
- Khi chạy trong terminal Windows, dừng server bằng `Ctrl+C` trong chính terminal đang chạy lệnh. Để khởi động lại, nhấn `Ctrl+C`, rồi chạy lại `npm start`.
- Nếu terminal đã đóng hoặc không tìm được terminal đang chạy, xác định PID đang nghe cổng `3000` trước khi dừng. Chỉ dừng đúng PID của ứng dụng này:

  ```powershell
  Get-NetTCPConnection -LocalPort 3000 -State Listen
  Stop-Process -Id <PID>
  ```

  Không dừng mọi tiến trình `node` theo tên vì có thể có ứng dụng Node khác đang chạy.
- `docker-compose.yml` chỉ khởi động PostgreSQL, không chạy ứng dụng Node. Cấu hình `restart: unless-stopped` có nghĩa PostgreSQL tự khởi động lại cùng Docker cho đến khi được dừng. Để dừng riêng database mà vẫn giữ dữ liệu:

  ```powershell
  docker compose stop postgres
  ```

  Khởi động lại database bằng `docker compose start postgres`. Không dùng `docker compose down -v` nếu cần giữ dữ liệu database.
- `docker compose` lấy `PGPASSWORD` từ `.env` và không còn mật khẩu mặc định trong file cấu hình. Điền mật khẩu local trong `.env` trước khi tạo mới database; không commit file này.
- PostgreSQL phải hoạt động và biến môi trường phải trỏ đúng database trước khi khởi động server.
- Sau khi cập nhật API hoặc schema, bảo đảm tiến trình Node đang chạy đúng bản `server.js` của dự án; chỉ sửa file mà không restart có thể khiến trình duyệt tiếp tục nhận API 404.
- Dự án hiện khai báo `start` và `dev` trong `package.json`; chưa khai báo script test/build riêng.

## 10. Phạm vi tài liệu

Đây là bản đồ tra cứu các file, luồng dữ liệu, API và quy trình vận hành chính; không thay thế việc đọc implementation trước khi sửa. Khi chức năng mới được thêm hoặc file/route được đổi tên, cập nhật các mục tương ứng trong tài liệu để giữ hướng dẫn khớp với mã nguồn.

## 11. Đưa website lên mạng (phương án đề xuất: Railway)

Ứng dụng là Node.js/Express kết nối PostgreSQL. `docker-compose.yml` hiện chỉ chạy PostgreSQL; nó chưa đóng gói/chạy website Node. Với người mới triển khai, có thể dùng dịch vụ Node và PostgreSQL quản lý riêng trên Railway. Một VPS có Docker phù hợp nếu muốn tự quản lý máy chủ, HTTPS, cập nhật và sao lưu.

### Việc cần làm trước khi public

- Thư mục dự án hiện chưa được khởi tạo Git. Tạo repository riêng trên GitHub để Railway có thể lấy mã nguồn.
- Tạo `.gitignore` để loại `node_modules/`, `.env`, file backup database và log; tuyệt đối không push `.env`.
- Sao lưu PostgreSQL hiện tại và thư mục `public/uploads/`. Nếu phục hồi dữ liệu database mà không chép ảnh cũ lên nơi lưu trữ của server, các URL ảnh đã lưu sẽ không tải được.
- **Không dùng tài khoản hoặc secret mặc định:** ứng dụng không còn tự tạo thông tin đăng nhập mặc định và không còn JWT secret dự phòng. `server.js` yêu cầu `JWT_SECRET` riêng, tối thiểu 32 ký tự; không khởi động nếu thiếu hoặc quá ngắn. Chỉ đặt cả `ADMIN_USERNAME` và `ADMIN_PASSWORD` (tối thiểu 12 ký tự) để tạo tài khoản lần đầu trong database chưa có tên đăng nhập đó. Sau khi tạo xong có thể gỡ hai biến này; tài khoản đã tồn tại không tự đổi mật khẩu khi biến môi trường thay đổi. Nếu database cũ đã được khởi tạo bằng thông tin đăng nhập mặc định, hãy đổi/xóa tài khoản đó trực tiếp trong database trước khi public. Không commit `.env`.

### Các bước triển khai

1. Tạo GitHub repository riêng, thêm mã nguồn và push các thay đổi đã kiểm tra. Không đưa `.env`, `node_modules/` hoặc file backup database lên GitHub.
2. Trên Railway, tạo project/service từ GitHub repository; chọn thư mục gốc chứa `package.json`. Lệnh start của dự án là `npm start`; service phải build/chạy `node server.js`.
3. Thêm PostgreSQL service cho project. Đặt biến `DATABASE_URL` của ứng dụng trỏ đến connection URL riêng tư của PostgreSQL service trong Railway. Không dùng URL database trên máy cá nhân.
4. Thêm `NODE_ENV=production` và một `JWT_SECRET` ngẫu nhiên, duy nhất, tối thiểu 32 ký tự vào phần Variables/Environment Variables của service. Nếu database chưa có tài khoản admin, đặt cả `ADMIN_USERNAME` và `ADMIN_PASSWORD` (ít nhất 12 ký tự), deploy để tạo tài khoản, rồi gỡ hai biến bootstrap. Không ghi các giá trị bí mật vào GitHub hoặc tài liệu.
5. Tạo persistent volume cho thư mục upload. Đường dẫn mount phải trùng thư mục upload mà ứng dụng đang dùng (`public/uploads` bên trong thư mục dự án; trong `server.js`, đường dẫn hiện được tạo từ `__dirname`). Xác minh mount path thực tế của Node service trước khi dùng. Nếu không có persistent volume, ảnh mới có thể mất khi service được redeploy.
6. Deploy và xem log khởi động. `src/database/schema.js` sẽ tạo các bảng còn thiếu khi ứng dụng kết nối database thành công.
7. Mở URL Railway cấp để kiểm tra trang chính, đăng nhập admin, CRUD, upload ảnh. Restart/redeploy thử để xác minh database và ảnh vẫn tồn tại.
8. Nếu cần dùng dữ liệu local hiện tại, restore bản backup vào PostgreSQL production và chép các file tương ứng từ `public/uploads/` vào persistent volume. Cần làm cả hai việc để dữ liệu tham chiếu ảnh không bị hỏng.
9. Sau khi kiểm tra, cấu hình custom domain trong Railway và cập nhật DNS theo hướng dẫn của nhà cung cấp. Kiểm tra website qua HTTPS trước khi gửi khách.

### Lưu ý khi vận hành trên cloud

- Sau khi deploy, Railway giữ service chạy trên cloud; không cần mở terminal máy cá nhân. `npm start` trong cloud cũng chạy liên tục theo đúng vai trò web server.
- Sau mỗi lần push lên nhánh được kết nối, platform có thể tự build/deploy lại. Kiểm tra deployment logs nếu API lỗi hoặc service không khởi động.
- Không xóa volume PostgreSQL khi muốn giữ dữ liệu. Không xóa/đổi persistent volume uploads nếu chưa sao lưu ảnh.
- Trước ngày triển khai thật, kiểm tra tài khoản admin mặc định đã được loại bỏ, JWT secret không dùng giá trị mẫu, form liên hệ hoạt động và có backup database.
