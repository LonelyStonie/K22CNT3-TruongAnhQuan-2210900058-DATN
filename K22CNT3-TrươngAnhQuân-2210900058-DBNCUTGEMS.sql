CREATE DATABASE uncut_gems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uncut_gems_db;
 
-- ============================================================
-- BẢNG 1: users (Người dùng)
-- Tính năng: Đăng ký, Đăng nhập, Phân quyền Admin/Khách hàng
-- ============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL COMMENT 'Họ và tên',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email đăng nhập',
    password VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã mã hóa (bcrypt)',
    phone VARCHAR(20) COMMENT 'Số điện thoại',
    avatar VARCHAR(500) COMMENT 'Ảnh đại diện',
    gender ENUM('male', 'female', 'other') COMMENT 'Giới tính',
    date_of_birth DATE COMMENT 'Ngày sinh',
    role ENUM('customer', 'admin') DEFAULT 'customer' COMMENT 'Vai trò: khách hàng / quản trị viên',
    is_active TINYINT(1) DEFAULT 1 COMMENT 'Trạng thái tài khoản (1=hoạt động, 0=bị khóa)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT = 'Bảng lưu trữ thông tin người dùng hệ thống';
 
-- ============================================================
-- BẢNG 2: categories (Danh mục sản phẩm)
-- Tính năng: Phân loại sản phẩm (Nhẫn, Dây chuyền, Vòng tay...)
-- ============================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên danh mục (VD: Nhẫn, Dây chuyền, Khuyên tai)',
    slug VARCHAR(120) NOT NULL UNIQUE COMMENT 'Đường dẫn URL thân thiện',
    description TEXT COMMENT 'Mô tả danh mục',
    image_url VARCHAR(500) COMMENT 'Hình ảnh đại diện danh mục',
    parent_id INT DEFAULT NULL COMMENT 'ID danh mục cha (hỗ trợ danh mục con)',
    is_active TINYINT(1) DEFAULT 1 COMMENT 'Trạng thái hiển thị',
    sort_order INT DEFAULT 0 COMMENT 'Thứ tự sắp xếp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) COMMENT = 'Bảng danh mục sản phẩm trang sức';
 
-- ============================================================
-- BẢNG 3: materials (Chất liệu)
-- Tính năng: Quản lý chất liệu trang sức (Vàng 18K, Bạc 925, Bạch kim...)
-- ============================================================
CREATE TABLE materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên chất liệu (VD: Vàng 18K, Bạc 925, Bạch kim)',
    code VARCHAR(20) UNIQUE COMMENT 'Mã chất liệu (VD: GOLD_18K, SILVER_925)',
    description TEXT COMMENT 'Mô tả chi tiết chất liệu',
    purity VARCHAR(50) COMMENT 'Độ tinh khiết / Hàm lượng (VD: 75%, 92.5%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT = 'Bảng quản lý chất liệu kim loại quý';
 
-- ============================================================
-- BẢNG 4: stone_types (Loại đá quý)
-- Tính năng: Quản lý các loại đá quý (Kim cương, Ruby, Sapphire...)
-- ============================================================
CREATE TABLE stone_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên loại đá (VD: Kim cương, Ruby, Sapphire, Ngọc trai)',
    code VARCHAR(20) UNIQUE COMMENT 'Mã loại đá (VD: DIAMOND, RUBY)',
    description TEXT COMMENT 'Mô tả đặc tính đá quý',
    hardness VARCHAR(20) COMMENT 'Độ cứng Mohs (VD: 10 cho kim cương)',
    origin VARCHAR(100) COMMENT 'Xuất xứ phổ biến',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT = 'Bảng quản lý các loại đá quý và bán quý';
 
-- ============================================================
-- BẢNG 5: products (Sản phẩm trang sức)
-- Tính năng: Hiển thị sản phẩm, Tìm kiếm, Lọc theo thuộc tính
-- ============================================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL COMMENT 'Tên sản phẩm',
    slug VARCHAR(220) NOT NULL UNIQUE COMMENT 'Đường dẫn URL thân thiện SEO',
    sku VARCHAR(50) UNIQUE COMMENT 'Mã sản phẩm duy nhất (Stock Keeping Unit)',
    description TEXT COMMENT 'Mô tả chi tiết sản phẩm',
    short_description VARCHAR(500) COMMENT 'Mô tả ngắn hiển thị ở danh sách',
    price DECIMAL(15, 0) NOT NULL COMMENT 'Giá bán (VNĐ)',
    original_price DECIMAL(15, 0) COMMENT 'Giá gốc trước giảm giá (VNĐ)',
    category_id INT COMMENT 'Thuộc danh mục nào',
    material_id INT COMMENT 'Chất liệu kim loại',
    stone_type_id INT COMMENT 'Loại đá quý',
    size VARCHAR(50) COMMENT 'Kích thước (VD: size nhẫn 6-7-8, dài dây chuyền 45cm)',
    weight DECIMAL(10, 2) COMMENT 'Trọng lượng (gram)',
    stock_quantity INT DEFAULT 0 COMMENT 'Số lượng tồn kho',
    image_url VARCHAR(500) COMMENT 'Hình ảnh chính sản phẩm',
    is_featured TINYINT(1) DEFAULT 0 COMMENT 'Sản phẩm nổi bật (hiện trang chủ)',
    is_new TINYINT(1) DEFAULT 0 COMMENT 'Sản phẩm mới',
    is_active TINYINT(1) DEFAULT 1 COMMENT 'Trạng thái hiển thị',
    view_count INT DEFAULT 0 COMMENT 'Số lượt xem',
    sold_count INT DEFAULT 0 COMMENT 'Số lượng đã bán',
    certification VARCHAR(200) COMMENT 'Giấy chứng nhận kiểm định',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL,
    FOREIGN KEY (stone_type_id) REFERENCES stone_types(id) ON DELETE SET NULL
) COMMENT = 'Bảng sản phẩm trang sức chính';
 
-- ============================================================
-- BẢNG 6: product_images (Hình ảnh sản phẩm)
-- Tính năng: Gallery ảnh nhiều góc cho mỗi sản phẩm
-- ============================================================
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL COMMENT 'Sản phẩm liên kết',
    image_url VARCHAR(500) NOT NULL COMMENT 'Đường dẫn hình ảnh',
    alt_text VARCHAR(200) COMMENT 'Mô tả ảnh (hỗ trợ SEO)',
    is_primary TINYINT(1) DEFAULT 0 COMMENT 'Ảnh chính hiển thị đầu tiên',
    sort_order INT DEFAULT 0 COMMENT 'Thứ tự hiển thị trong gallery',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) COMMENT = 'Bảng lưu trữ nhiều hình ảnh cho mỗi sản phẩm';
 
-- ============================================================
-- BẢNG 7: product_reviews (Đánh giá sản phẩm)
-- Tính năng: Khách hàng đánh giá sao và bình luận sản phẩm
-- ============================================================
CREATE TABLE product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL COMMENT 'Sản phẩm được đánh giá',
    user_id INT NOT NULL COMMENT 'Người đánh giá',
    rating TINYINT NOT NULL COMMENT 'Số sao (1-5)',
    comment TEXT COMMENT 'Nội dung bình luận',
    is_approved TINYINT(1) DEFAULT 0 COMMENT 'Admin đã duyệt chưa (0=chờ, 1=đã duyệt)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (rating >= 1 AND rating <= 5)
) COMMENT = 'Bảng đánh giá và bình luận sản phẩm';
 
-- ============================================================
-- BẢNG 8: shipping_addresses (Địa chỉ giao hàng)
-- Tính năng: Lưu nhiều địa chỉ giao hàng cho mỗi khách hàng
-- ============================================================
CREATE TABLE shipping_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Thuộc khách hàng nào',
    receiver_name VARCHAR(100) NOT NULL COMMENT 'Tên người nhận',
    phone VARCHAR(20) NOT NULL COMMENT 'SĐT người nhận',
    province VARCHAR(100) NOT NULL COMMENT 'Tỉnh/Thành phố',
    district VARCHAR(100) NOT NULL COMMENT 'Quận/Huyện',
    ward VARCHAR(100) COMMENT 'Phường/Xã',
    address_detail TEXT NOT NULL COMMENT 'Địa chỉ chi tiết (số nhà, đường)',
    is_default TINYINT(1) DEFAULT 0 COMMENT 'Địa chỉ mặc định',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT = 'Bảng địa chỉ giao hàng của khách hàng';
 
-- ============================================================
-- BẢNG 9: carts (Giỏ hàng)
-- Tính năng: Mỗi khách hàng có 1 giỏ hàng
-- ============================================================
CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE COMMENT 'Mỗi user chỉ có 1 giỏ hàng',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT = 'Bảng giỏ hàng';
 
-- ============================================================
-- BẢNG 10: cart_items (Chi tiết giỏ hàng)
-- Tính năng: Thêm/Xóa/Cập nhật số lượng sản phẩm trong giỏ
-- ============================================================
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL COMMENT 'Thuộc giỏ hàng nào',
    product_id INT NOT NULL COMMENT 'Sản phẩm nào',
    quantity INT NOT NULL DEFAULT 1 COMMENT 'Số lượng',
    size VARCHAR(50) COMMENT 'Kích thước đã chọn (VD: size nhẫn)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (cart_id, product_id, size)
) COMMENT = 'Bảng chi tiết các sản phẩm trong giỏ hàng';
 
-- ============================================================
-- BẢNG 11: coupons (Mã giảm giá)
-- Tính năng: Tạo & quản lý mã khuyến mãi, giảm giá theo % hoặc số tiền
-- ============================================================
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã giảm giá (VD: SALE20, WELCOME10)',
    description VARCHAR(255) COMMENT 'Mô tả chương trình khuyến mãi',
    discount_type ENUM('percentage', 'fixed') NOT NULL COMMENT 'Loại: giảm theo % hoặc số tiền cố định',
    discount_value DECIMAL(15, 0) NOT NULL COMMENT 'Giá trị giảm (VD: 20 = 20% hoặc 200000 VNĐ)',
    min_order_amount DECIMAL(15, 0) DEFAULT 0 COMMENT 'Giá trị đơn hàng tối thiểu để áp dụng',
    max_discount DECIMAL(15, 0) COMMENT 'Số tiền giảm tối đa (cho loại %)',
    usage_limit INT COMMENT 'Số lần sử dụng tối đa',
    used_count INT DEFAULT 0 COMMENT 'Số lần đã sử dụng',
    start_date DATETIME NOT NULL COMMENT 'Ngày bắt đầu hiệu lực',
    end_date DATETIME NOT NULL COMMENT 'Ngày hết hạn',
    is_active TINYINT(1) DEFAULT 1 COMMENT 'Trạng thái hoạt động',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT = 'Bảng mã giảm giá / khuyến mãi';
 
-- ============================================================
-- BẢNG 12: orders (Đơn hàng)
-- Tính năng: Đặt hàng, Theo dõi trạng thái đơn hàng
-- ============================================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(30) NOT NULL UNIQUE COMMENT 'Mã đơn hàng (VD: UG-20250328-001)',
    user_id INT NOT NULL COMMENT 'Khách hàng đặt hàng',
    receiver_name VARCHAR(100) NOT NULL COMMENT 'Tên người nhận',
    receiver_phone VARCHAR(20) NOT NULL COMMENT 'SĐT người nhận',
    shipping_address TEXT NOT NULL COMMENT 'Địa chỉ giao hàng đầy đủ',
    subtotal DECIMAL(15, 0) NOT NULL COMMENT 'Tổng tiền sản phẩm (chưa giảm giá)',
    discount_amount DECIMAL(15, 0) DEFAULT 0 COMMENT 'Số tiền được giảm',
    shipping_fee DECIMAL(15, 0) DEFAULT 0 COMMENT 'Phí vận chuyển',
    total_amount DECIMAL(15, 0) NOT NULL COMMENT 'Tổng thanh toán cuối cùng',
    coupon_id INT COMMENT 'Mã giảm giá đã áp dụng',
    payment_method ENUM('cod', 'bank_transfer', 'e_wallet') DEFAULT 'cod' COMMENT 'Phương thức thanh toán',
    status ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned') DEFAULT 'pending' 
        COMMENT 'Trạng thái: Chờ xác nhận → Đã xác nhận → Đang xử lý → Đang giao → Đã giao → Đã hủy → Trả hàng',
    note TEXT COMMENT 'Ghi chú của khách hàng',
    admin_note TEXT COMMENT 'Ghi chú nội bộ của Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
) COMMENT = 'Bảng đơn hàng chính';
 
-- ============================================================
-- BẢNG 13: order_items (Chi tiết đơn hàng)
-- Tính năng: Lưu từng sản phẩm trong mỗi đơn hàng
-- ============================================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL COMMENT 'Thuộc đơn hàng nào',
    product_id INT NOT NULL COMMENT 'Sản phẩm nào',
    product_name VARCHAR(200) NOT NULL COMMENT 'Tên SP tại thời điểm mua (lưu lại phòng SP bị đổi tên)',
    product_image VARCHAR(500) COMMENT 'Ảnh SP tại thời điểm mua',
    price DECIMAL(15, 0) NOT NULL COMMENT 'Giá SP tại thời điểm mua',
    quantity INT NOT NULL COMMENT 'Số lượng mua',
    size VARCHAR(50) COMMENT 'Kích thước đã chọn',
    total DECIMAL(15, 0) NOT NULL COMMENT 'Thành tiền (price x quantity)',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
) COMMENT = 'Bảng chi tiết sản phẩm trong đơn hàng';
 
-- ============================================================
-- BẢNG 14: payments (Thanh toán)
-- Tính năng: Ghi nhận lịch sử thanh toán, xác nhận chuyển khoản
-- ============================================================
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL COMMENT 'Đơn hàng liên kết',
    amount DECIMAL(15, 0) NOT NULL COMMENT 'Số tiền thanh toán',
    method ENUM('cod', 'bank_transfer', 'e_wallet') NOT NULL COMMENT 'Phương thức',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending' COMMENT 'Trạng thái thanh toán',
    transaction_id VARCHAR(100) COMMENT 'Mã giao dịch ngân hàng / ví điện tử',
    bank_name VARCHAR(100) COMMENT 'Tên ngân hàng (nếu chuyển khoản)',
    payment_proof VARCHAR(500) COMMENT 'Ảnh chụp biên lai chuyển khoản',
    paid_at DATETIME COMMENT 'Thời gian thanh toán thực tế',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT = 'Bảng lịch sử thanh toán';
 
-- ============================================================
-- BẢNG 15: wishlists (Danh sách yêu thích)
-- Tính năng: Khách hàng lưu sản phẩm yêu thích để mua sau
-- ============================================================
CREATE TABLE wishlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Khách hàng',
    product_id INT NOT NULL COMMENT 'Sản phẩm yêu thích',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (user_id, product_id)
) COMMENT = 'Bảng danh sách sản phẩm yêu thích';
 
-- ============================================================
-- BẢNG 16: banners (Banner quảng cáo / Slideshow)
-- Tính năng: Quản lý hình ảnh banner trang chủ, khuyến mãi
-- ============================================================
CREATE TABLE banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT 'Tiêu đề banner',
    subtitle VARCHAR(300) COMMENT 'Phụ đề / slogan',
    image_url VARCHAR(500) NOT NULL COMMENT 'Hình ảnh banner',
    link_url VARCHAR(500) COMMENT 'Liên kết khi click vào banner',
    position ENUM('home_slider', 'home_middle', 'category_top', 'popup') DEFAULT 'home_slider' 
        COMMENT 'Vị trí hiển thị',
    sort_order INT DEFAULT 0 COMMENT 'Thứ tự hiển thị',
    is_active TINYINT(1) DEFAULT 1 COMMENT 'Trạng thái hiển thị',
    start_date DATETIME COMMENT 'Ngày bắt đầu hiển thị',
    end_date DATETIME COMMENT 'Ngày kết thúc hiển thị',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT = 'Bảng quản lý banner quảng cáo / slideshow';
 
-- ============================================================
-- BẢNG 17: blogs (Tin tức / Bài viết)
-- Tính năng: Đăng bài về xu hướng trang sức, kiến thức đá quý, SEO
-- ============================================================
CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL COMMENT 'Tiêu đề bài viết',
    slug VARCHAR(320) NOT NULL UNIQUE COMMENT 'Đường dẫn URL SEO',
    content LONGTEXT NOT NULL COMMENT 'Nội dung bài viết (HTML)',
    thumbnail VARCHAR(500) COMMENT 'Ảnh đại diện bài viết',
    excerpt VARCHAR(500) COMMENT 'Tóm tắt ngắn',
    author_id INT COMMENT 'Admin viết bài',
    tags VARCHAR(300) COMMENT 'Tags phân loại (VD: kim-cuong, vang-18k, xu-huong)',
    view_count INT DEFAULT 0 COMMENT 'Số lượt xem',
    is_published TINYINT(1) DEFAULT 0 COMMENT 'Trạng thái (0=nháp, 1=đã xuất bản)',
    published_at DATETIME COMMENT 'Ngày xuất bản',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT = 'Bảng tin tức và bài viết blog';
 
-- ============================================================
-- BẢNG 18: contacts (Liên hệ / Hỗ trợ khách hàng)
-- Tính năng: Form liên hệ, yêu cầu hỗ trợ, phản hồi khách hàng
-- ============================================================
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên người gửi',
    email VARCHAR(100) NOT NULL COMMENT 'Email liên hệ',
    phone VARCHAR(20) COMMENT 'SĐT liên hệ',
    subject VARCHAR(200) NOT NULL COMMENT 'Tiêu đề yêu cầu',
    message TEXT NOT NULL COMMENT 'Nội dung tin nhắn',
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new' COMMENT 'Trạng thái xử lý',
    admin_reply TEXT COMMENT 'Phản hồi từ Admin',
    replied_at DATETIME COMMENT 'Thời gian phản hồi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT = 'Bảng liên hệ và yêu cầu hỗ trợ từ khách hàng';
 
-- ============================================================
-- BẢNG 19: inventory_logs (Lịch sử nhập/xuất kho)
-- Tính năng: Theo dõi biến động tồn kho, nhập hàng, xuất hàng
-- ============================================================
CREATE TABLE inventory_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL COMMENT 'Sản phẩm liên quan',
    type ENUM('import', 'export', 'adjustment', 'return') NOT NULL 
        COMMENT 'Loại: Nhập kho / Xuất kho / Điều chỉnh / Trả hàng',
    quantity INT NOT NULL COMMENT 'Số lượng thay đổi (dương=nhập, âm=xuất)',
    stock_before INT NOT NULL COMMENT 'Tồn kho trước khi thay đổi',
    stock_after INT NOT NULL COMMENT 'Tồn kho sau khi thay đổi',
    reference_id INT COMMENT 'ID tham chiếu (VD: order_id nếu xuất kho theo đơn)',
    note TEXT COMMENT 'Ghi chú (VD: Nhập lô hàng mới, Trả hàng từ đơn #123)',
    created_by INT COMMENT 'Admin thực hiện',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) COMMENT = 'Bảng lịch sử nhập xuất và biến động tồn kho';
 
-- ============================================================
-- BẢNG 20: system_settings (Cài đặt hệ thống)
-- Tính năng: Cấu hình thông tin website, chính sách, liên lạc
-- ============================================================
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Khóa cài đặt (VD: site_name, phone, email)',
    setting_value TEXT COMMENT 'Giá trị cài đặt',
    setting_group VARCHAR(50) DEFAULT 'general' COMMENT 'Nhóm: general, contact, payment, shipping, policy',
    description VARCHAR(255) COMMENT 'Mô tả cài đặt',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT = 'Bảng cài đặt và cấu hình hệ thống';