/* ================================================
   JAVASCRIPT TRANG QUẢN TRỊ - Phào Chỉ Trang Trí
   SPA điều hướng bằng hash, quản lý dữ liệu và xác thực
   ================================================ */

(function () {
    'use strict';

    // ========== TRẠNG THÁI ==========
    const state = {
        user: null,
        products: [],
        categories: [],
        slides: [],
        contacts: [],
        uploadHistory: [],
        adminHistory: [],
        settings: {},
        sortConfig: {},
    };

    const API = '/api';
    const pageTitles = {
        dashboard: 'Dashboard',
        products: 'Quản Lý Sản Phẩm',
        categories: 'Quản Lý Danh Mục',
        'hero-slides': 'Quản Lý Hero Slides',
        contacts: 'Tin Nhắn Liên Hệ',
        'upload-history': 'Lịch Sử Ảnh',
        'admin-history': 'Lịch Sử Thay Đổi Admin',
        settings: 'Cài Đặt Website',
    };
    const defaultFeatures = [
        {
            icon: 'fas fa-award',
            title: 'Chất Lượng Cao',
            description: 'Sản phẩm được sản xuất từ nguyên liệu cao cấp, quy trình kiểm soát chất lượng nghiêm ngặt, đảm bảo độ bền và tính thẩm mỹ vượt trội.',
        },
        {
            icon: 'fas fa-tags',
            title: 'Giá Cả Hợp Lý',
            description: 'Là nhà sản xuất trực tiếp, chúng tôi cam kết mang đến mức giá tốt nhất mà không qua trung gian, tiết kiệm chi phí cho khách hàng.',
        },
        {
            icon: 'fas fa-shipping-fast',
            title: 'Giao Hàng Nhanh',
            description: 'Hệ thống kho hàng rộng khắp, đội ngũ vận chuyển chuyên nghiệp, đảm bảo giao hàng nhanh chóng và an toàn trên toàn quốc.',
        },
        {
            icon: 'fas fa-shield-alt',
            title: 'Bảo Hành Dài Hạn',
            description: 'Chính sách bảo hành lên đến 10 năm, đội ngũ kỹ thuật hỗ trợ tận tình, mang đến sự yên tâm tuyệt đối cho khách hàng.',
        },
    ];
    const defaultAboutStats = [
        { icon: 'fas fa-calendar-alt', value: 15, suffix: '+', label: 'Năm Kinh Nghiệm' },
        { icon: 'fas fa-boxes-stacked', value: 500, suffix: '+', label: 'Sản Phẩm' },
        { icon: 'fas fa-smile', value: 2000, suffix: '+', label: 'Khách Hàng Hài Lòng' },
        { icon: 'fas fa-building', value: 350, suffix: '+', label: 'Dự Án Hoàn Thành' },
    ];
    const aboutStatIconOptions = [
        { icon: 'fas fa-calendar-alt', label: 'Kinh nghiệm' },
        { icon: 'fas fa-boxes-stacked', label: 'Sản phẩm' },
        { icon: 'fas fa-smile', label: 'Khách hàng' },
        { icon: 'fas fa-building', label: 'Dự án' },
        { icon: 'fas fa-award', label: 'Chất lượng' },
        { icon: 'fas fa-truck-fast', label: 'Giao hàng' },
        { icon: 'fas fa-store', label: 'Cửa hàng' },
        { icon: 'fas fa-users', label: 'Đội ngũ' },
    ];
    const defaultSocialLinks = [
        { label: 'Facebook', icon: 'fab fa-facebook-f', url: '' },
        { label: 'Instagram', icon: 'fab fa-instagram', url: '' },
        { label: 'YouTube', icon: 'fab fa-youtube', url: '' },
        { label: 'Zalo', icon: 'fas fa-comment-dots', url: '' },
    ];
    const socialIconOptions = [
        { icon: 'fab fa-facebook-f', label: 'Facebook' },
        { icon: 'fab fa-instagram', label: 'Instagram' },
        { icon: 'fab fa-youtube', label: 'YouTube' },
        { icon: 'fas fa-comment-dots', label: 'Zalo' },
        { icon: 'fab fa-tiktok', label: 'TikTok' },
        { icon: 'fab fa-x-twitter', label: 'X (Twitter)' },
        { icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
        { icon: 'fas fa-globe', label: 'Website' },
    ];
    const featureIconOptions = [
        { className: 'fas fa-award', label: 'Chất lượng' },
        { className: 'fas fa-star', label: 'Nổi bật' },
        { className: 'fas fa-gem', label: 'Cao cấp' },
        { className: 'fas fa-tags', label: 'Giá tốt' },
        { className: 'fas fa-coins', label: 'Tiết kiệm' },
        { className: 'fas fa-truck-fast', label: 'Giao hàng' },
        { className: 'fas fa-box', label: 'Sản phẩm' },
        { className: 'fas fa-shield-halved', label: 'Bảo vệ' },
        { className: 'fas fa-certificate', label: 'Chứng nhận' },
        { className: 'fas fa-headset', label: 'Hỗ trợ' },
        { className: 'fas fa-thumbs-up', label: 'Hài lòng' },
        { className: 'fas fa-screwdriver-wrench', label: 'Thi công' },
        { className: 'fas fa-house', label: 'Nhà ở' },
        { className: 'fas fa-clock', label: 'Nhanh chóng' },
        { className: 'fas fa-check', label: 'Cam kết' },
        { className: 'fas fa-heart', label: 'Tận tâm' },
    ];

    // ========== HÀM TIỆN ÍCH ==========

    // Định dạng giá theo quy ước tiền tệ Việt Nam.
    function formatPrice(price) {
        if (!price && price !== 0) return '—';
        return Number(price).toLocaleString('vi-VN') + ' ₫';
    }

    // Chuyển ngày từ API thành chuỗi ngày giờ dễ đọc.
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    // Rút gọn văn bản dài để giữ bảng và thẻ nội dung gọn.
    function truncateText(text, len = 60) {
        if (!text) return '';
        return text.length > len ? text.substring(0, len) + '...' : text;
    }

    // Chuẩn hóa các kiểu giá trị bật/tắt thường gặp từ API.
    function isEnabled(value, defaultValue = true) {
        if (value === undefined || value === null) return defaultValue;
        return value === true || value === 1 || value === '1' || value === 'true';
    }

    // Mã hóa dữ liệu trước khi chèn vào HTML được render động.
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ========== HÀM GỌI API ==========

    // Gọi API admin kèm cookie, chuẩn hóa JSON và xử lý phiên hết hạn.
    async function apiFetch(url, options = {}) {
        const defaultOpts = {
            credentials: 'include',
            headers: {},
        };
        if (options.body && !(options.body instanceof FormData)) {
            defaultOpts.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(options.body);
        }
        const merged = {
            ...defaultOpts,
            ...options,
            headers: { ...defaultOpts.headers, ...options.headers },
        };

        try {
            const res = await fetch(API + url, merged);
            if (res.status === 401) {
                showLogin();
                throw new Error('Phiên đăng nhập hết hạn');
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || data.error || `Lỗi ${res.status}`);
            }
            return data;
        } catch (err) {
            if (err.message !== 'Phiên đăng nhập hết hạn') {
                console.error('API Error:', err);
            }
            throw err;
        }
    }

    // Gửi một ảnh lên server và trả về URL ảnh đã lưu.
    async function uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        const result = await apiFetch('/upload', { method: 'POST', body: formData });
        if (!result.url) {
            throw new Error('Máy chủ không trả về đường dẫn ảnh.');
        }
        return result.url;
    }

    // ========== THÔNG BÁO NHANH ==========

    // Hiển thị thông báo tạm thời cho các thao tác trong trang quản trị.
    window.showToast = function (message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
        };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info} toast-icon"></i>
            <span class="toast-message">${escapeHtml(message)}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // ========== HỘP THOẠI XÁC NHẬN ==========

    // Mở hộp thoại xác nhận và trả về true nếu người dùng đồng ý.
    function showConfirm(title, message) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('confirm-overlay');
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-message').textContent = message;
            overlay.style.display = 'flex';

            const okBtn = document.getElementById('confirm-ok');
            const cancelBtn = document.getElementById('confirm-cancel');

            // Gỡ listener và phần tử dialog sau khi người dùng chọn.
            function cleanup() {
                overlay.style.display = 'none';
                okBtn.replaceWith(okBtn.cloneNode(true));
                cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            }

            document.getElementById('confirm-ok').onclick = () => {
                cleanup();
                resolve(true);
            };
            document.getElementById('confirm-cancel').onclick = () => {
                cleanup();
                resolve(false);
            };
        });
    }

    // ========== TRẠNG THÁI ĐANG TẢI ==========

    // Hiện lớp phủ báo đang xử lý tác vụ.
    function showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    // Ẩn lớp phủ báo đang xử lý tác vụ.
    function hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    // ========== HỘP THOẠI ==========

    // Đóng modal nếu thao tác phát sinh từ overlay hoặc nút đóng.
    window.closeModal = function (event) {
        if (event && event.target !== event.currentTarget) return;
        document.getElementById('modal-overlay').style.display = 'none';
        document.getElementById('modal-body').innerHTML = '';
    };

    // Hiển thị modal với tiêu đề và nội dung HTML đã dựng.
    function openModal(title, contentHtml) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = contentHtml;
        document.getElementById('modal-overlay').style.display = 'flex';
    }

    // ========== XÁC THỰC ==========

    // Xác minh cookie hiện tại trước khi cho phép mở khu vực quản trị.
    async function checkAuth() {
        try {
            const data = await apiFetch('/auth/me');
            state.user = data.user || data;
            showAdmin();
        } catch {
            showLogin();
        }
    }

    // Chuyển giao diện về màn hình đăng nhập và xóa người dùng hiện tại.
    function showLogin() {
        state.user = null;
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('admin-layout').style.display = 'none';
    }

    // Hiện giao diện quản trị, cập nhật tên admin và mở route hiện tại.
    function showAdmin() {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('admin-layout').style.display = 'flex';
        const name = state.user?.username || state.user?.name || 'Admin';
        document.getElementById('admin-name').innerHTML = `<i class="fas fa-user-circle"></i> ${escapeHtml(name)}`;
        handleRoute();
    }

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('login-error');
        errEl.style.display = 'none';
        const btn = document.getElementById('login-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';

        try {
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: { username, password },
            });
            state.user = data.user || data;
            showAdmin();
            showToast('Đăng nhập thành công!', 'success');
        } catch (err) {
            errEl.textContent = err.message || 'Đăng nhập thất bại';
            errEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';
        }
    });

    // Gửi yêu cầu đăng xuất rồi trở về màn hình đăng nhập.
    window.handleLogout = async function (e) {
        e.preventDefault();
        try {
            await apiFetch('/auth/logout', { method: 'POST' });
        } catch { /* Bỏ qua lỗi trong thao tác không bắt buộc */ }
        state.user = null;
        showLogin();
        showToast('Đã đăng xuất', 'info');
    };

    // Chuyển trường mật khẩu giữa kiểu ẩn và hiện.
    window.togglePasswordVisibility = function () {
        const input = document.getElementById('login-password');
        const icon = input.nextElementSibling?.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            if (icon) icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            if (icon) icon.className = 'fas fa-eye';
        }
    };

    // ========== THANH ĐIỀU HƯỚNG BÊN ==========

    // Đóng/mở sidebar theo chế độ mobile hoặc desktop.
    window.toggleSidebar = function () {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 992) {
            sidebar.classList.toggle('mobile-open');
            // Quản lý lớp phủ
            let overlay = document.querySelector('.mobile-overlay');
            if (sidebar.classList.contains('mobile-open')) {
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'mobile-overlay';
                    overlay.onclick = () => {
                        sidebar.classList.remove('mobile-open');
                        overlay.remove();
                    };
                    document.body.appendChild(overlay);
                }
            } else if (overlay) {
                overlay.remove();
            }
        } else {
            sidebar.classList.toggle('collapsed');
        }
    };

    // ========== ĐIỀU HƯỚNG TRANG ==========

    // Đọc tên trang admin từ hash URL, mặc định là dashboard.
    function getCurrentPage() {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        return hash;
    }

    // Render template của route đang chọn và tải dữ liệu tương ứng.
    function handleRoute() {
        const page = getCurrentPage();
        const content = document.getElementById('main-content');
        const tpl = document.getElementById(`tpl-${page}`);

        // Cập nhật trạng thái mục đang chọn
        document.querySelectorAll('.nav-link[data-page]').forEach((link) => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Cập nhật tiêu đề thanh trên cùng
        document.getElementById('topbar-title').textContent = pageTitles[page] || 'Dashboard';

        // Đóng thanh điều hướng trên điện thoại
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('mobile-open');
        const overlay = document.querySelector('.mobile-overlay');
        if (overlay) overlay.remove();

        if (tpl) {
            content.innerHTML = '';
            content.appendChild(tpl.content.cloneNode(true));
            loadPageData(page);
        } else {
            content.innerHTML = `<div class="page-header"><h1>Trang không tìm thấy</h1></div>`;
        }
    }

    window.addEventListener('hashchange', () => {
        if (state.user) handleRoute();
    });

    // Chọn hàm tải dữ liệu theo tên trang quản trị.
    async function loadPageData(page) {
        switch (page) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'products':
                await loadProducts();
                break;
            case 'categories':
                await loadCategories();
                break;
            case 'hero-slides':
                await loadSlides();
                break;
            case 'contacts':
                await loadContacts();
                break;
            case 'upload-history':
                await loadUploadHistory();
                break;
            case 'admin-history':
                await loadAdminHistory();
                break;
            case 'settings':
                await loadSettings();
                break;
        }
    }

    // ========== LỊCH SỬ THAO TÁC QUẢN TRỊ ==========

    // Định dạng kích thước ảnh thành B, KB hoặc MB.
    function formatFileSize(bytes) {
        const size = Number(bytes) || 0;
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }

    // Tải lịch sử ảnh, tổng dung lượng và trạng thái sử dụng của ảnh.
    async function loadUploadHistory() {
        const list = document.getElementById('upload-history-list');
        if (!list) return;
        const summary = document.getElementById('upload-history-summary');
        list.innerHTML = '<p class="text-muted">Đang tải lịch sử ảnh...</p>';
        try {
            const data = await apiFetch('/admin/uploads');
            state.uploadHistory = Array.isArray(data) ? data : [];
            const totalBytes = state.uploadHistory.reduce((total, image) => total + (Number(image.size_bytes) || 0), 0);
            if (summary) {
                summary.textContent = `${state.uploadHistory.length} ảnh · Tổng dung lượng: ${formatFileSize(totalBytes)}`;
            }
            if (!state.uploadHistory.length) {
                list.innerHTML = '<p class="text-muted">Chưa có ảnh tải lên.</p>';
                return;
            }
            list.innerHTML = state.uploadHistory.map((image) => `
                <article class="upload-history-card">
                    <a href="${escapeHtml(image.url)}" target="_blank" rel="noopener noreferrer" class="upload-history-preview">
                        <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.original_name || image.filename)}" loading="lazy">
                    </a>
                    <div class="upload-history-info">
                        <strong title="${escapeHtml(image.original_name || image.filename)}">${escapeHtml(image.original_name || image.filename)}</strong>
                        <span>${formatFileSize(image.size_bytes)} · ${formatDate(image.uploaded_at)}</span>
                        <span>Tải lên bởi: ${escapeHtml(image.uploaded_by || '—')}</span>
                        ${image.in_use
                            ? '<span class="badge badge-warning">Đang được sử dụng</span>'
                            : '<span class="badge badge-success">Có thể xóa</span>'}
                    </div>
                    <button type="button" class="btn btn-danger btn-sm" onclick="deleteUploadedImage(${Number(image.id)})" ${image.in_use ? 'disabled title="Ảnh đang được sử dụng"' : ''}>
                        <i class="fas fa-trash"></i> Xóa ảnh
                    </button>
                </article>
            `).join('');
        } catch (err) {
            list.innerHTML = `<p class="text-danger">Không thể tải lịch sử ảnh: ${escapeHtml(err.message)}</p>`;
        }
    }

    window.loadUploadHistory = loadUploadHistory;

    // Xác nhận rồi yêu cầu server xóa ảnh không còn được nội dung sử dụng.
    window.deleteUploadedImage = async function (id) {
        const image = state.uploadHistory.find((item) => Number(item.id) === Number(id));
        if (!image || image.in_use) return;
        const confirmed = await showConfirm(
            'Xóa ảnh khỏi máy chủ',
            `Bạn có chắc muốn xóa "${image.original_name || image.filename}"? Tệp sẽ bị xóa vĩnh viễn.`
        );
        if (!confirmed) return;

        showLoading();
        try {
            await apiFetch(`/admin/uploads/${id}`, { method: 'DELETE' });
            showToast('Đã xóa ảnh khỏi máy chủ.', 'success');
            await loadUploadHistory();
        } catch (err) {
            showToast('Không thể xóa ảnh: ' + err.message, 'error');
            await loadUploadHistory();
        } finally {
            hideLoading();
        }
    };

    // Tải và render các thao tác quản trị được ghi trong audit log.
    async function loadAdminHistory() {
        const tbody = document.getElementById('admin-history-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Đang tải lịch sử...</td></tr>';
        try {
            const data = await apiFetch('/admin/audit-logs');
            state.adminHistory = Array.isArray(data) ? data : [];
            if (!state.adminHistory.length) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Chưa có hoạt động admin được ghi nhận.</td></tr>';
                return;
            }
            tbody.innerHTML = state.adminHistory.map((entry) => `
                <tr>
                    <td>${formatDate(entry.created_at)}</td>
                    <td>${escapeHtml(entry.actor || '—')}</td>
                    <td>${escapeHtml(entry.action || '—')}</td>
                    <td class="audit-route">${escapeHtml(entry.route || '—')}</td>
                    <td>${escapeHtml(entry.summary || '—')}</td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Không thể tải lịch sử: ${escapeHtml(err.message)}</td></tr>`;
        }
    }

    window.loadAdminHistory = loadAdminHistory;

    // ========== TRANG TỔNG QUAN ==========

    // Tải số liệu tổng quan và các tin nhắn liên hệ mới nhất.
    async function loadDashboard() {
        try {
            const [products, categories, contacts, slides] = await Promise.all([
                apiFetch('/products').catch(() => ({ data: [], products: [] })),
                apiFetch('/categories').catch(() => ({ data: [], categories: [] })),
                apiFetch('/contacts').catch(() => ({ data: [], contacts: [] })),
                apiFetch('/hero-slides').catch(() => ({ data: [], slides: [] })),
            ]);

            const productsList = products.data || products.products || products || [];
            const categoriesList = categories.data || categories.categories || categories || [];
            const contactsList = contacts.data || contacts.contacts || contacts || [];
            const slidesList = slides.data || slides.slides || slides || [];

            const arr = Array.isArray(productsList) ? productsList : [];
            const catArr = Array.isArray(categoriesList) ? categoriesList : [];
            const conArr = Array.isArray(contactsList) ? contactsList : [];
            const sldArr = Array.isArray(slidesList) ? slidesList : [];

            document.getElementById('stat-products-count').textContent = arr.length;
            document.getElementById('stat-categories-count').textContent = catArr.length;
            const unread = conArr.filter((c) => !c.read && !c.isRead).length;
            document.getElementById('stat-unread-count').textContent = unread;
            document.getElementById('stat-slides-count').textContent = sldArr.length;

            updateUnreadBadge(unread);

            // Các tin nhắn liên hệ gần đây
            const recentEl = document.getElementById('recent-contacts');
            const recent = conArr.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

            if (recent.length === 0) {
                recentEl.innerHTML = '<p class="text-muted">Chưa có tin nhắn nào.</p>';
            } else {
                recentEl.innerHTML = recent
                    .map(
                        (c) => `
                    <div class="recent-contact-item ${!c.read && !c.isRead ? 'unread' : ''}" onclick="window.location.hash='contacts'">
                        <div class="recent-contact-avatar">${(c.name || 'K')[0].toUpperCase()}</div>
                        <div class="recent-contact-info">
                            <h4>${escapeHtml(c.name)}</h4>
                            <p>${escapeHtml(truncateText(c.message || c.content, 80))}</p>
                        </div>
                        <span class="recent-contact-date">${formatDate(c.createdAt)}</span>
                    </div>
                `
                    )
                    .join('');
            }
        } catch (err) {
            showToast('Không thể tải dữ liệu dashboard: ' + err.message, 'error');
        }
    }

    // Cập nhật số tin nhắn chưa đọc trên menu điều hướng.
    function updateUnreadBadge(count) {
        const badge = document.getElementById('unread-badge');
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // ========== SẢN PHẨM ==========

    // Tải danh sách sản phẩm và danh mục cần cho bộ lọc/form.
    async function loadProducts() {
        try {
            const data = await apiFetch('/products');
            state.products = data.data || data.products || data || [];
            if (!Array.isArray(state.products)) state.products = [];
            // Tải thêm danh mục để hiển thị trong danh sách chọn
            const catData = await apiFetch('/categories').catch(() => ({ data: [] }));
            state.categories = catData.data || catData.categories || catData || [];
            if (!Array.isArray(state.categories)) state.categories = [];
            renderProducts();
        } catch (err) {
            showToast('Không thể tải sản phẩm: ' + err.message, 'error');
        }
    }

    // Render bảng sản phẩm từ danh sách truyền vào hoặc state hiện tại.
    function renderProducts(list) {
        const items = list || state.products;
        const tbody = document.getElementById('products-tbody');
        const info = document.getElementById('product-count-info');
        if (!tbody) return;

        info.textContent = `${items.length} sản phẩm`;

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Không có sản phẩm nào.</td></tr>';
            return;
        }

        tbody.innerHTML = items
            .map(
                (p) => `
            <tr>
                <td>
                    ${
                        p.image || p.imageUrl
                            ? `<img src="${escapeHtml(p.image || p.imageUrl)}" class="thumb" alt="${escapeHtml(p.name)}" loading="lazy">`
                            : `<div class="no-image"><i class="fas fa-image"></i></div>`
                    }
                </td>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td>${escapeHtml(p.category_name || getCategoryName(p.category_id ?? p.category ?? p.categoryId))}</td>
                <td>${formatPrice(p.price)}</td>
                <td>
                    ${
                        p.featured || p.isFeatured
                            ? '<span class="badge badge-success"><i class="fas fa-star"></i> Có</span>'
                            : '<span class="badge badge-muted">Không</span>'
                    }
                </td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary btn-icon" onclick="openProductForm('${p._id || p.id}')" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-icon" onclick="deleteProduct('${p._id || p.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
            )
            .join('');
    }

    // Tìm tên danh mục từ ID hoặc đối tượng danh mục của sản phẩm.
    function getCategoryName(catIdOrObj) {
        if (!catIdOrObj) return '—';
        if (typeof catIdOrObj === 'object') return catIdOrObj.name || '—';
        const cat = state.categories.find((c) => String(c._id || c.id) === String(catIdOrObj));
        return cat ? cat.name : catIdOrObj;
    }

    // Lọc danh sách sản phẩm theo từ khóa nhập trong ô tìm kiếm.
    window.filterProducts = function () {
        const q = document.getElementById('product-search')?.value.toLowerCase() || '';
        if (!q) {
            renderProducts();
            return;
        }
        const filtered = state.products.filter(
            (p) =>
                (p.name || '').toLowerCase().includes(q) ||
                (p.category_name || getCategoryName(p.category_id ?? p.category ?? p.categoryId)).toLowerCase().includes(q)
        );
        renderProducts(filtered);
    };

    // Tạo form thêm/sửa sản phẩm và nạp dữ liệu nếu đang chỉnh sửa.
    window.openProductForm = function (id) {
        const product = id ? state.products.find((p) => String(p._id || p.id) === String(id)) : null;
        const isEdit = !!product;
        const title = isEdit ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới';

        const categoryOptions = state.categories
            .map(
                (c) =>
                    `<option value="${c._id || c.id}" ${
                        (String(product?.category_id ?? product?.categoryId ?? product?.category?.id ?? product?.category ?? '') === String(c._id || c.id))
                            ? 'selected'
                            : ''
                    }>${escapeHtml(c.name)}</option>`
            )
            .join('');

        const html = `
            <form id="product-form" onsubmit="saveProduct(event, '${id || ''}')">
                <div class="form-group">
                    <label>Tên sản phẩm *</label>
                    <input type="text" name="name" required value="${escapeHtml(product?.name || '')}">
                </div>
                <div class="form-row two-col">
                    <div class="form-group">
                        <label>Danh mục</label>
                        <select name="category">
                            <option value="">-- Chọn danh mục --</option>
                            ${categoryOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Giá (₫)</label>
                        <input type="number" name="price" min="0" value="${product?.price || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Mô tả</label>
                    <textarea name="description" rows="4">${escapeHtml(product?.description || '')}</textarea>
                </div>
                <div class="form-row two-col">
                    <div class="form-group">
                        <label>Chất liệu</label>
                        <input type="text" name="material" value="${escapeHtml(product?.material || '')}">
                    </div>
                    <div class="form-group">
                        <label>Kích thước</label>
                        <input type="text" name="dimensions" value="${escapeHtml(product?.dimensions || '')}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Hình ảnh</label>
                    <div class="image-upload-area" onclick="document.getElementById('product-image-input').click()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Click để chọn ảnh hoặc kéo thả</p>
                    </div>
                    <input type="file" id="product-image-input" accept="image/*" style="display:none" onchange="previewImage(this, 'product-image-preview', 'product-image-url')">
                    <input type="hidden" id="product-image-url" name="image" value="${escapeHtml(product?.image || product?.imageUrl || '')}">
                    <div id="product-image-preview" class="mt-1">
                        ${
                            product?.image || product?.imageUrl
                                ? `<div class="image-preview">
                                    <img src="${escapeHtml(product.image || product.imageUrl)}" alt="Preview">
                                    <button type="button" class="remove-image" onclick="removeImagePreview('product-image-preview', 'product-image-input', 'product-image-url')">&times;</button>
                                   </div>`
                                : ''
                        }
                    </div>
                </div>
                <div class="form-row two-col">
                    <div class="form-group">
                        <label>Thứ tự hiển thị</label>
                        <input type="number" name="sortOrder" min="0" value="${product?.sort_order ?? product?.sortOrder ?? 0}">
                    </div>
                    <div class="form-group" style="display:flex;align-items:flex-end;padding-bottom:8px;">
                        <div class="form-check">
                            <input type="checkbox" id="product-featured" name="featured" ${product?.featured || product?.isFeatured ? 'checked' : ''}>
                            <label for="product-featured">Sản phẩm nổi bật</label>
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> ${isEdit ? 'Cập Nhật' : 'Thêm Mới'}
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                </div>
            </form>
        `;
        openModal(title, html);
    };

    // Validate cơ bản, upload ảnh nếu có rồi tạo hoặc cập nhật sản phẩm.
    window.saveProduct = async function (e, id) {
        e.preventDefault();
        const form = document.getElementById('product-form');
        const formData = new FormData(form);
        const fileInput = document.getElementById('product-image-input');
        const data = Object.fromEntries(formData.entries());
        data.category_id = data.category || '';
        data.sort_order = data.sortOrder || '0';
        data.featured = form.querySelector('[name="featured"]').checked;
        delete data.category;
        delete data.sortOrder;

        showLoading();
        try {
            if (fileInput.files.length > 0) {
                data.image = await uploadImage(fileInput.files[0]);
            }
            if (id) {
                await apiFetch(`/products/${id}`, { method: 'PUT', body: data });
                showToast('Cập nhật sản phẩm thành công!', 'success');
            } else {
                await apiFetch('/products', { method: 'POST', body: data });
                showToast('Thêm sản phẩm thành công!', 'success');
            }
            closeModal();
            await loadProducts();
        } catch (err) {
            showToast('Lỗi: ' + err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    // Xác nhận và xóa sản phẩm, sau đó tải lại bảng.
    window.deleteProduct = async function (id) {
        const confirmed = await showConfirm('Xóa Sản Phẩm', 'Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác không thể hoàn tác.');
        if (!confirmed) return;

        showLoading();
        try {
            await apiFetch(`/products/${id}`, { method: 'DELETE' });
            showToast('Đã xóa sản phẩm', 'success');
            await loadProducts();
        } catch (err) {
            showToast('Lỗi: ' + err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    // ========== DANH MỤC ==========

    // Tải danh sách danh mục để cập nhật state và bảng quản trị.
    async function loadCategories() {
        try {
            const data = await apiFetch('/categories');
            state.categories = data.data || data.categories || data || [];
            if (!Array.isArray(state.categories)) state.categories = [];
            renderCategories();
        } catch (err) {
            showToast('Không thể tải danh mục: ' + err.message, 'error');
        }
    }

    // Render bảng danh mục từ danh sách truyền vào hoặc state hiện tại.
    function renderCategories(list) {
        const items = list || state.categories;
        const tbody = document.getElementById('categories-tbody');
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Không có danh mục nào.</td></tr>';
            return;
        }

        tbody.innerHTML = items
            .map(
                (c) => `
            <tr>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td>${escapeHtml(truncateText(c.description, 80))}</td>
                <td><span class="badge badge-info">${c.product_count ?? c.productCount ?? c.products?.length ?? '—'}</span></td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary btn-icon" onclick="openCategoryForm('${c._id || c.id}')" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-icon" onclick="deleteCategory('${c._id || c.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
            )
            .join('');
    }

    // Lọc danh mục theo tên hoặc mô tả đang nhập.
    window.filterCategories = function () {
        const q = document.getElementById('category-search')?.value.toLowerCase() || '';
        if (!q) {
            renderCategories();
            return;
        }
        const filtered = state.categories.filter(
            (c) => (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
        );
        renderCategories(filtered);
    };

    // Tạo form thêm/sửa danh mục và nạp dữ liệu nếu đang chỉnh sửa.
    window.openCategoryForm = function (id) {
        const cat = id ? state.categories.find((c) => String(c._id || c.id) === String(id)) : null;
        const isEdit = !!cat;
        const title = isEdit ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới';

        const html = `
            <form id="category-form" onsubmit="saveCategory(event, '${id || ''}')">
                <div class="form-group">
                    <label>Tên danh mục *</label>
                    <input type="text" name="name" required value="${escapeHtml(cat?.name || '')}">
                </div>
                <div class="form-group">
                    <label>Mô tả</label>
                    <textarea name="description" rows="3">${escapeHtml(cat?.description || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>Hình ảnh</label>
                    <div class="image-upload-area" onclick="document.getElementById('category-image-input').click()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Click để chọn ảnh</p>
                    </div>
                    <input type="file" id="category-image-input" accept="image/*" style="display:none" onchange="previewImage(this, 'category-image-preview', 'category-image-url')">
                    <input type="hidden" id="category-image-url" name="image" value="${escapeHtml(cat?.image || cat?.imageUrl || '')}">
                    <div id="category-image-preview" class="mt-1">
                        ${
                            cat?.image || cat?.imageUrl
                                ? `<div class="image-preview">
                                    <img src="${escapeHtml(cat.image || cat.imageUrl)}" alt="Preview">
                                    <button type="button" class="remove-image" onclick="removeImagePreview('category-image-preview', 'category-image-input', 'category-image-url')">&times;</button>
                                   </div>`
                                : ''
                        }
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> ${isEdit ? 'Cập Nhật' : 'Thêm Mới'}
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                </div>
            </form>
        `;
        openModal(title, html);
    };

    // Upload ảnh nếu có rồi tạo mới hoặc cập nhật danh mục.
    window.saveCategory = async function (e, id) {
        e.preventDefault();
        const form = document.getElementById('category-form');
        const formData = new FormData(form);
        const fileInput = document.getElementById('category-image-input');
        const data = Object.fromEntries(formData.entries());

        showLoading();
        try {
            if (fileInput.files.length > 0) {
                data.image = await uploadImage(fileInput.files[0]);
            }
            if (id) {
                await apiFetch(`/categories/${id}`, { method: 'PUT', body: data });
                showToast('Cập nhật danh mục thành công!', 'success');
            } else {
                await apiFetch('/categories', { method: 'POST', body: data });
                showToast('Thêm danh mục thành công!', 'success');
            }
            closeModal();
            await loadCategories();
        } catch (err) {
            showToast('Lỗi: ' + err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    // Xác nhận và xóa danh mục, sau đó tải lại bảng.
    window.deleteCategory = async function (id) {
        const confirmed = await showConfirm('Xóa Danh Mục', 'Bạn có chắc chắn muốn xóa danh mục này? Các sản phẩm trong danh mục sẽ không bị xóa.');
        if (!confirmed) return;

        showLoading();
        try {
            await apiFetch(`/categories/${id}`, { method: 'DELETE' });
            showToast('Đã xóa danh mục', 'success');
            await loadCategories();
        } catch (err) {
            showToast('Lỗi: ' + err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    // ========== ẢNH TRÌNH CHIẾU ĐẦU TRANG ==========

    // Tải slide từ API và cập nhật danh sách trên trang admin.
    async function loadSlides() {
        try {
            const data = await apiFetch('/hero-slides');
            state.slides = data.data || data.slides || data || [];
            if (!Array.isArray(state.slides)) state.slides = [];
            renderSlides();
        } catch (err) {
            showToast('Không thể tải slides: ' + err.message, 'error');
        }
    }

    // Render các slide và trạng thái hoạt động thành thẻ quản trị.
    function renderSlides() {
        const grid = document.getElementById('slides-grid');
        if (!grid) return;

        if (state.slides.length === 0) {
            grid.innerHTML = '<p class="text-muted">Chưa có slide nào. Nhấn "Thêm Slide" để bắt đầu.</p>';
            return;
        }

        grid.innerHTML = state.slides
            .map(
                (s) => `
            <div class="slide-card">
                <div class="slide-card-image">
                    ${
                        s.image || s.imageUrl
                            ? `<img src="${escapeHtml(s.image || s.imageUrl)}" alt="${escapeHtml(s.title)}" loading="lazy">`
                            : `<div class="no-image-placeholder"><i class="fas fa-image"></i></div>`
                    }
                    <div class="slide-card-status">
                        ${
                            isEnabled(s.active, isEnabled(s.isActive))
                                ? '<span class="badge badge-success">Hoạt động</span>'
                                : '<span class="badge badge-muted">Ẩn</span>'
                        }
                    </div>
                </div>
                <div class="slide-card-body">
                    <h4>${escapeHtml(s.title || 'Không có tiêu đề')}</h4>
                    <p>${escapeHtml(truncateText(s.subtitle || s.description || '', 80))}</p>
                    <div class="slide-card-actions">
                        <button class="btn btn-sm btn-primary" onclick="openSlideForm('${s._id || s.id}')">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteSlide('${s._id || s.id}')">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            </div>
        `
            )
            .join('');
    }

    // Tạo form thêm/sửa slide và điền dữ liệu hiện tại khi cần.
    window.openSlideForm = function (id) {
        const slide = id ? state.slides.find((s) => String(s._id || s.id) === String(id)) : null;
        const isEdit = !!slide;
        const title = isEdit ? 'Sửa Slide' : 'Thêm Slide Mới';

        const html = `
            <form id="slide-form" onsubmit="saveSlide(event, '${id || ''}')">
                <div class="form-group">
                    <label>Tiêu đề</label>
                    <input type="text" name="title" value="${escapeHtml(slide?.title || '')}">
                </div>
                <div class="form-group">
                    <label>Phụ đề</label>
                    <input type="text" name="subtitle" value="${escapeHtml(slide?.subtitle || '')}">
                </div>
                <div class="form-group">
                    <label>Hình ảnh</label>
                    <div class="image-upload-area" onclick="document.getElementById('slide-image-input').click()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Click để chọn ảnh</p>
                    </div>
                    <input type="file" id="slide-image-input" accept="image/*" style="display:none" onchange="previewImage(this, 'slide-image-preview', 'slide-image-url')">
                    <input type="hidden" id="slide-image-url" name="image" value="${escapeHtml(slide?.image || slide?.imageUrl || '')}">
                    <div id="slide-image-preview" class="mt-1">
                        ${
                            slide?.image || slide?.imageUrl
                                ? `<div class="image-preview">
                                    <img src="${escapeHtml(slide.image || slide.imageUrl)}" alt="Preview">
                                    <button type="button" class="remove-image" onclick="removeImagePreview('slide-image-preview', 'slide-image-input', 'slide-image-url')">&times;</button>
                                   </div>`
                                : ''
                        }
                    </div>
                </div>
                <div class="form-row two-col">
                    <div class="form-group">
                        <label>Nút bấm (text)</label>
                        <input type="text" name="buttonText" value="${escapeHtml(slide?.button_text || slide?.buttonText || '')}" placeholder="VD: Xem Ngay">
                    </div>
                    <div class="form-group">
                        <label>Liên kết nút</label>
                        <input type="text" name="buttonLink" value="${escapeHtml(slide?.button_link || slide?.buttonLink || slide?.link || '')}" placeholder="VD: #products">
                    </div>
                </div>
                <div class="form-group" style="display:flex;align-items:center;padding-top:8px;">
                    <div class="form-check">
                        <input type="checkbox" id="slide-active" name="active" ${isEnabled(slide?.active, isEnabled(slide?.isActive)) ? 'checked' : ''}>
                        <label for="slide-active">Hiển thị slide</label>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> ${isEdit ? 'Cập Nhật' : 'Thêm Mới'}
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Hủy</button>
                </div>
            </form>
        `;
        openModal(title, html);
    };

    // Tạo mới hoặc cập nhật slide theo dữ liệu form.
    window.saveSlide = async function (e, id) {
        e.preventDefault();
        const form = document.getElementById('slide-form');
        const formData = new FormData(form);
        const fileInput = document.getElementById('slide-image-input');
        const data = Object.fromEntries(formData.entries());
        data.button_text = data.buttonText || '';
        data.button_link = data.buttonLink || '';
        data.active = form.querySelector('[name="active"]').checked;
        delete data.buttonText;
        delete data.buttonLink;

        showLoading();
        try {
            if (fileInput.files.length > 0) {
                data.image = await uploadImage(fileInput.files[0]);
            }
            if (id) {
                await apiFetch(`/hero-slides/${id}`, { method: 'PUT', body: data });
                showToast('Cập nhật slide thành công!', 'success');
            } else {
                await apiFetch('/hero-slides', { method: 'POST', body: data });
                showToast('Thêm slide thành công!', 'success');
            }
            closeModal();
            await loadSlides();
        } catch (err) {
            showToast('Lỗi: ' + err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    // Xác nhận và xóa slide, sau đó tải lại danh sách.
    window.deleteSlide = async function (id) {
        const confirmed = await showConfirm('Xóa Slide', 'Bạn có chắc chắn muốn xóa slide này?');
        if (!confirmed) return;

        showLoading();
        try {
            await apiFetch(`/hero-slides/${id}`, { method: 'DELETE' });
            showToast('Đã xóa slide', 'success');
            await loadSlides();
        } catch (err) {
            showToast('Lỗi: ' + err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    // ========== LIÊN HỆ ==========

    // Tải tin nhắn liên hệ và render bảng quản trị.
    async function loadContacts() {
        try {
            const data = await apiFetch('/contacts');
            state.contacts = data.data || data.contacts || data || [];
            if (!Array.isArray(state.contacts)) state.contacts = [];
            renderContacts();
        } catch (err) {
            showToast('Không thể tải tin nhắn: ' + err.message, 'error');
        }
    }

    // Render danh sách liên hệ cùng trạng thái đọc và thao tác.
    function renderContacts(list) {
        const items = list || state.contacts;
        const tbody = document.getElementById('contacts-tbody');
        const info = document.getElementById('contact-count-info');
        if (!tbody) return;

        info.textContent = `${items.length} tin nhắn`;

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Không có tin nhắn nào.</td></tr>';
            return;
        }

        // Sắp xếp theo ngày giảm dần
        const sorted = items.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        tbody.innerHTML = sorted
            .map(
                (c) => `
            <tr style="${!c.read && !c.isRead ? 'font-weight:600;' : ''}">
                <td>
                    ${
                        !c.read && !c.isRead
                            ? '<span class="badge badge-warning"><i class="fas fa-circle" style="font-size:8px;"></i></span>'
                            : '<span class="badge badge-muted"><i class="fas fa-check" style="font-size:10px;"></i></span>'
                    }
                </td>
                <td>${escapeHtml(c.name)}</td>
                <td>${escapeHtml(c.email || '—')}</td>
                <td>${escapeHtml(c.phone || '—')}</td>
                <td class="truncate">${escapeHtml(truncateText(c.message || c.content, 50))}</td>
                <td>${formatDate(c.createdAt)}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary btn-icon" onclick="viewContact('${c._id || c.id}')" title="Xem">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-icon" onclick="deleteContact('${c._id || c.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
            )
            .join('');
    }

    // Lọc tin nhắn liên hệ theo nội dung ô tìm kiếm.
    window.filterContacts = function () {
        const q = document.getElementById('contact-search')?.value.toLowerCase() || '';
        if (!q) {
            renderContacts();
            return;
        }
        const filtered = state.contacts.filter(
            (c) =>
                (c.name || '').toLowerCase().includes(q) ||
                (c.email || '').toLowerCase().includes(q) ||
                (c.phone || '').toLowerCase().includes(q) ||
                (c.message || c.content || '').toLowerCase().includes(q)
        );
        renderContacts(filtered);
    };

    // Mở chi tiết liên hệ và đánh dấu đã đọc nếu cần.
    window.viewContact = async function (id) {
        const contact = state.contacts.find((c) => (c._id || c.id) === id);
        if (!contact) return;

        // Đánh dấu đã đọc
        if (!contact.read && !contact.isRead) {
            try {
                await apiFetch(`/contacts/${id}/read`, { method: 'PUT' });
                contact.read = true;
                contact.isRead = true;
                renderContacts();
                // Cập nhật số lượng thông báo
                const unread = state.contacts.filter((c) => !c.read && !c.isRead).length;
                updateUnreadBadge(unread);
            } catch { /* Bỏ qua lỗi trong thao tác không bắt buộc */ }
        }

        const html = `
            <div class="contact-view">
                <dl class="contact-meta">
                    <dt>Họ tên</dt>
                    <dd>${escapeHtml(contact.name)}</dd>
                    <dt>Email</dt>
                    <dd>${contact.email ? `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : '—'}</dd>
                    <dt>Điện thoại</dt>
                    <dd>${contact.phone ? `<a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a>` : '—'}</dd>
                    <dt>Chủ đề</dt>
                    <dd>${escapeHtml(contact.subject || '—')}</dd>
                    <dt>Ngày gửi</dt>
                    <dd>${formatDate(contact.createdAt)}</dd>
                </dl>
                <h4 style="margin-bottom:8px;"><i class="fas fa-comment-dots" style="color:var(--accent);margin-right:6px;"></i>Nội dung tin nhắn</h4>
                <div class="contact-message-body">${escapeHtml(contact.message || contact.content || 'Không có nội dung.')}</div>
            </div>
        `;
        openModal('Chi Tiết Tin Nhắn', html);
    };

    // Xác nhận và xóa tin nhắn liên hệ.
    window.deleteContact = async function (id) {
        const confirmed = await showConfirm('Xóa Tin Nhắn', 'Bạn có chắc chắn muốn xóa tin nhắn này?');
        if (!confirmed) return;

        showLoading();
        try {
            await apiFetch(`/contacts/${id}`, { method: 'DELETE' });
            showToast('Đã xóa tin nhắn', 'success');
            await loadContacts();
        } catch (err) {
            showToast('Lỗi: ' + err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    // ========== CÀI ĐẶT ==========

    // Tải cài đặt hiện tại rồi điền vào các trường form quản trị.
    async function loadSettings() {
        try {
            const data = await apiFetch('/settings');
            state.settings = data.data || data.settings || data || {};
            fillSettingsForm();
        } catch (err) {
            showToast('Không thể tải cài đặt: ' + err.message, 'error');
        }
    }

    // Đổ dữ liệu cài đặt và các danh sách lặp vào giao diện form.
    function fillSettingsForm() {
        const s = state.settings;
        const fields = ['companyName', 'phone', 'email', 'address', 'about'];
        fields.forEach((f) => {
            const el = document.getElementById(`setting-${f}`);
            const value = f === 'companyName'
                ? (s.companyName ?? s.company_name)
                : f === 'about'
                    ? (s.about ?? s.about_text)
                    : s[f];
            if (el) el.value = value || '';
        });
        const aboutFields = {
            'setting-about-title': s.aboutTitle || 'Về Chúng Tôi',
            'setting-about-section-title': s.aboutTitleText || 'Đơn Vị Hàng Đầu Về Phào Chỉ Trang Trí',
            'setting-about-heading': s.aboutHeading || '',
            'setting-about-secondary': s.aboutTextSecondary || '',
            'setting-about-badge-number': s.aboutBadgeNumber || '15+',
            'setting-about-badge-text': s.aboutBadgeText || 'Năm Kinh Nghiệm',
        };
        Object.entries(aboutFields).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field) field.value = value;
        });
        const aboutImageUrl = document.getElementById('setting-about-image-url');
        const aboutImagePreview = document.getElementById('setting-about-image-preview');
        const image = typeof s.aboutImage === 'string' ? s.aboutImage : '/images/about-placeholder.jpg';
        if (aboutImageUrl) aboutImageUrl.value = image;
        if (aboutImagePreview) {
            aboutImagePreview.innerHTML = image
                ? `<div class="image-preview">
                    <img src="${escapeHtml(image)}" alt="Ảnh phần giới thiệu">
                    <button type="button" class="remove-image" onclick="removeImagePreview('setting-about-image-preview', 'setting-about-image-file', 'setting-about-image-url')">&times;</button>
                   </div>`
                : '';
        }
        renderAboutStatSettings(parseAboutStats(s.aboutStats));
        const socialLinks = parseSocialLinks(s.socialLinks);
        const socialLinksData = document.getElementById('setting-social-links-data');
        if (socialLinksData) socialLinksData.value = JSON.stringify(socialLinks);
        renderSocialLinkSettings(socialLinks);
        const featuresTitle = document.getElementById('setting-features-title');
        if (featuresTitle) featuresTitle.value = s.featuresTitle || 'Cam Kết Của Chúng Tôi';
        renderFeatureSettings(parseFeatures(s.features));
        const logoUrl = document.getElementById('setting-logo-url');
        const logoPreview = document.getElementById('setting-logo-preview');
        if (logoUrl) logoUrl.value = s.logo || '';
        if (logoPreview) {
            logoPreview.innerHTML = s.logo
                ? `<div class="image-preview">
                    <img src="${escapeHtml(s.logo)}" alt="Logo công ty">
                    <button type="button" class="remove-image" onclick="removeImagePreview('setting-logo-preview', 'setting-logo-file', 'setting-logo-url')">&times;</button>
                   </div>`
                : '';
        }
    }

    // Đọc/chuẩn hóa số liệu giới thiệu từ JSON hoặc dùng mặc định.
    function parseAboutStats(value) {
        if (Array.isArray(value)) return normalizeAboutStats(value);
        if (typeof value === 'string' && value.trim()) {
            try {
                const stats = JSON.parse(value);
                if (Array.isArray(stats)) {
                    return normalizeAboutStats(stats);
                }
                console.warn('Danh sách số liệu giới thiệu không đúng định dạng, hiển thị mặc định.');
            } catch (err) {
                console.warn('Không đọc được số liệu giới thiệu, hiển thị mặc định:', err);
            }
        }
        return defaultAboutStats.map((stat) => ({ ...stat }));
    }

    // Giới hạn kiểu dữ liệu của từng số liệu trước khi render/lưu.
    function normalizeAboutStats(stats) {
        return stats
            .filter((stat) => stat && typeof stat === 'object')
            .map((stat) => ({
                icon: typeof stat.icon === 'string' ? stat.icon : defaultAboutStats[0].icon,
                value: Number.isFinite(Number(stat.value)) ? Math.max(0, Math.floor(Number(stat.value))) : 0,
                suffix: typeof stat.suffix === 'string' ? stat.suffix : '+',
                label: typeof stat.label === 'string' ? stat.label : '',
            }));
    }

    // Đọc/chuẩn hóa liên kết mạng xã hội từ JSON hoặc dùng mặc định.
    function parseSocialLinks(value) {
        if (Array.isArray(value)) return normalizeSocialLinks(value);
        if (typeof value === 'string' && value.trim()) {
            try {
                const links = JSON.parse(value);
                if (Array.isArray(links)) return normalizeSocialLinks(links);
                console.warn('Danh sách mạng xã hội không đúng định dạng, hiển thị mặc định.');
            } catch (err) {
                console.warn('Không đọc được danh sách mạng xã hội, hiển thị mặc định:', err);
            }
        }
        return defaultSocialLinks.map((link) => ({ ...link }));
    }

    // Chỉ giữ các trường và biểu tượng hợp lệ của liên kết mạng xã hội.
    function normalizeSocialLinks(links) {
        return links
            .filter((link) => link && typeof link === 'object')
            .map((link) => ({
                label: typeof link.label === 'string' ? link.label : '',
                icon: socialIconOptions.some((option) => option.icon === link.icon)
                    ? link.icon
                    : socialIconOptions[0].icon,
                url: typeof link.url === 'string' ? link.url : '',
            }));
    }

    // Đọc danh sách mạng xã hội hiện tại từ các trường trong form.
    function readSocialLinkSettings() {
        return [...document.querySelectorAll('.setting-social-link-item')].map((item) => ({
            label: item.querySelector('[data-social-link="label"]').value.trim(),
            icon: item.querySelector('[data-social-link="icon"]').value,
            url: item.querySelector('[data-social-link="url"]').value.trim(),
        }));
    }

    // Tạo các trường chỉnh sửa mạng xã hội từ danh sách đã chuẩn hóa.
    function renderSocialLinkSettings(links) {
        const list = document.getElementById('setting-social-links-list');
        if (!list) return;
        list.innerHTML = links.map((link) => `
            <div class="form-card setting-social-link-item">
                <div class="form-row two-col">
                    <div class="form-group">
                        <label>Biểu tượng</label>
                        <select data-social-link="icon">
                            ${socialIconOptions.map((option) => `
                                <option value="${option.icon}" ${option.icon === link.icon ? 'selected' : ''}>${option.label}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tên hiển thị</label>
                        <input type="text" data-social-link="label" value="${escapeHtml(link.label)}" placeholder="Ví dụ: Facebook">
                    </div>
                </div>
                <div class="form-row two-col">
                    <div class="form-group">
                        <label>Đường dẫn</label>
                        <input type="url" data-social-link="url" value="${escapeHtml(link.url)}" placeholder="https://..." inputmode="url">
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-danger btn-sm" onclick="removeSocialLink(this)">
                            <i class="fas fa-trash"></i> Xóa liên kết
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Thêm một dòng trống để nhập liên kết mạng xã hội mới.
    window.addSocialLink = function () {
        const links = readSocialLinkSettings();
        links.push({ label: '', icon: socialIconOptions[0].icon, url: '' });
        renderSocialLinkSettings(links);
    };

    // Xóa dòng mạng xã hội chứa nút được nhấn.
    window.removeSocialLink = function (button) {
        const item = button.closest('.setting-social-link-item');
        if (!item) return;
        item.remove();
    };

    // Đọc các số liệu giới thiệu được nhập trong form.
    function readAboutStats() {
        return [...document.querySelectorAll('.setting-about-stat-item')].map((item) => ({
            icon: item.querySelector('[data-about-stat="icon"]').value,
            value: Number(item.querySelector('[data-about-stat="value"]').value),
            suffix: item.querySelector('[data-about-stat="suffix"]').value,
            label: item.querySelector('[data-about-stat="label"]').value.trim(),
        }));
    }

    // Render các trường chỉnh sửa số liệu giới thiệu.
    function renderAboutStatSettings(stats) {
        const list = document.getElementById('setting-about-stats-list');
        if (!list) return;
        list.innerHTML = stats.map((stat) => `
            <div class="form-card setting-about-stat-item">
                <div class="form-row two-col">
                    <div class="form-group">
                        <label>Số liệu</label>
                        <input type="number" min="0" step="1" data-about-stat="value" value="${escapeHtml(String(stat.value ?? 0))}" required>
                    </div>
                    <div class="form-group">
                        <label>Nội dung</label>
                        <input type="text" data-about-stat="label" value="${escapeHtml(stat.label || '')}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Ký tự phía sau</label>
                    <input type="text" maxlength="12" data-about-stat="suffix" value="${escapeHtml(stat.suffix ?? '+')}" placeholder="+">
                </div>
                <div class="form-group">
                    <label>Biểu tượng</label>
                    <select data-about-stat="icon">
                        ${aboutStatIconOptions.map((option) => `
                            <option value="${option.icon}" ${option.icon === (stat.icon || defaultAboutStats[0].icon) ? 'selected' : ''}>${option.label}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="setting-feature-actions">
                    <button type="button" class="btn btn-outline btn-sm" onclick="moveAboutStat(this, -1)" title="Chuyển lên">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="moveAboutStat(this, 1)" title="Chuyển xuống">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeAboutStat(this)">
                        <i class="fas fa-trash"></i> Xóa số liệu
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Thêm một dòng số liệu giới thiệu với giá trị ban đầu hợp lệ.
    window.addAboutStat = function () {
        const stats = readAboutStats();
        stats.push({ icon: defaultAboutStats[0].icon, value: 0, suffix: '+', label: '' });
        renderAboutStatSettings(stats);
    };

    // Di chuyển một dòng số liệu lên hoặc xuống trong danh sách.
    window.moveAboutStat = function (button, direction) {
        const item = button.closest('.setting-about-stat-item');
        if (!item) return;
        const stats = readAboutStats();
        const items = [...document.querySelectorAll('.setting-about-stat-item')];
        const index = items.indexOf(item);
        const target = index + direction;
        if (target < 0 || target >= stats.length) return;
        [stats[index], stats[target]] = [stats[target], stats[index]];
        renderAboutStatSettings(stats);
    };

    // Xóa dòng số liệu chứa nút được nhấn.
    window.removeAboutStat = function (button) {
        const item = button.closest('.setting-about-stat-item');
        if (!item) return;
        item.remove();
    };

    // Đọc và chuẩn hóa danh sách cam kết từ JSON hoặc mặc định.
    function parseFeatures(value) {
        if (Array.isArray(value)) return value;
        if (typeof value !== 'string' || !value.trim()) {
            return defaultFeatures.map((feature) => ({ ...feature }));
        }
        try {
            const features = JSON.parse(value);
            if (Array.isArray(features)) return features;
            console.warn('Danh sách cam kết không đúng định dạng, hiển thị nội dung mặc định.');
        } catch (err) {
            console.warn('Không đọc được danh sách cam kết, hiển thị nội dung mặc định:', err);
        }
        return defaultFeatures.map((feature) => ({ ...feature }));
    }

    // Đọc các cam kết hiện tại từ những trường trong form.
    function readFeatureSettings() {
        return [...document.querySelectorAll('.setting-feature-item')].map((item) => ({
            icon: item.querySelector('[data-feature="icon"]').value.trim(),
            title: item.querySelector('[data-feature="title"]').value.trim(),
            description: item.querySelector('[data-feature="description"]').value.trim(),
        }));
    }

    // Render các trường chỉnh sửa nội dung và biểu tượng cam kết.
    function renderFeatureSettings(features) {
        const list = document.getElementById('setting-features-list');
        if (!list) return;
        list.innerHTML = features.map((feature) => `
            <div class="form-card setting-feature-item">
                <div class="form-group">
                    <label>Tiêu đề cam kết</label>
                    <input type="text" data-feature="title" value="${escapeHtml(feature.title || '')}" required>
                </div>
                <div class="form-group">
                    <label>Nội dung</label>
                    <textarea data-feature="description" rows="3" required>${escapeHtml(feature.description || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>Chọn hình minh họa</label>
                    <input type="hidden" data-feature="icon" value="${escapeHtml(feature.icon || 'fas fa-check')}">
                    <div class="feature-icon-picker">
                        ${featureIconOptions.map((option) => `
                            <button type="button"
                                class="feature-icon-option ${option.className === (feature.icon || 'fas fa-check') ? 'selected' : ''}"
                                onclick="selectFeatureIcon(this, '${option.className}')"
                                aria-label="${option.label}"
                                title="${option.label}">
                                <i class="${option.className}" aria-hidden="true"></i>
                                <span>${option.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="setting-feature-actions">
                    <button type="button" class="btn btn-outline btn-sm" onclick="moveFeatureSetting(this, -1)" title="Chuyển lên">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="moveFeatureSetting(this, 1)" title="Chuyển xuống">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeFeatureSetting(this)">
                        <i class="fas fa-trash"></i> Xóa cam kết
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Gán biểu tượng đã chọn cho dòng cam kết tương ứng.
    window.selectFeatureIcon = function (button, iconClass) {
        const picker = button.closest('.feature-icon-picker');
        const iconInput = button.closest('.setting-feature-item')?.querySelector('[data-feature="icon"]');
        if (!picker || !iconInput) return;
        iconInput.value = iconClass;
        picker.querySelectorAll('.feature-icon-option').forEach((option) => {
            option.classList.toggle('selected', option === button);
        });
    };

    // Thêm một dòng cam kết mới vào form cài đặt.
    window.addFeatureSetting = function () {
        const features = readFeatureSettings();
        features.push({ icon: 'fas fa-check', title: '', description: '' });
        renderFeatureSettings(features);
    };

    // Xóa dòng cam kết chứa nút được nhấn.
    window.removeFeatureSetting = function (button) {
        const item = button.closest('.setting-feature-item');
        if (!item) return;
        const features = readFeatureSettings();
        const index = [...document.querySelectorAll('.setting-feature-item')].indexOf(item);
        features.splice(index, 1);
        renderFeatureSettings(features);
    };

    // Di chuyển một dòng cam kết lên hoặc xuống trong danh sách.
    window.moveFeatureSetting = function (button, direction) {
        const item = button.closest('.setting-feature-item');
        if (!item) return;
        const features = readFeatureSettings();
        const items = [...document.querySelectorAll('.setting-feature-item')];
        const index = items.indexOf(item);
        const target = index + direction;
        if (target < 0 || target >= features.length) return;
        [features[index], features[target]] = [features[target], features[index]];
        renderFeatureSettings(features);
    };

    // Thu thập, chuẩn hóa và lưu toàn bộ cài đặt website về server.
    window.saveSettings = async function (e) {
        e.preventDefault();
        const form = document.getElementById('settings-form');
        const data = {};
        new FormData(form).forEach((val, key) => {
            data[key] = val;
        });
        data.features = JSON.stringify(readFeatureSettings());
        data.aboutStats = JSON.stringify(readAboutStats());
        data.socialLinks = JSON.stringify(readSocialLinkSettings());
        const logoFile = document.getElementById('setting-logo-file').files[0];
        const aboutImageFile = document.getElementById('setting-about-image-file').files[0];

        showLoading();
        try {
            if (logoFile) {
                data.logo = await uploadImage(logoFile);
            }
            if (aboutImageFile) {
                data.aboutImage = await uploadImage(aboutImageFile);
            }
            state.settings = await apiFetch('/settings', { method: 'PUT', body: data });
            document.getElementById('setting-logo-file').value = '';
            document.getElementById('setting-about-image-file').value = '';
            fillSettingsForm();
            showToast('Lưu cài đặt thành công!', 'success');
        } catch (err) {
            showToast('Lỗi: ' + err.message, 'error');
        } finally {
            hideLoading();
        }
    };

    // ========== HÀM HỖ TRỢ TẢI ẢNH ==========

    // Hiển thị ảnh vừa chọn và lưu đường dẫn preview vào trường ẩn.
    window.previewImage = function (input, previewContainerId, imageUrlId) {
        const container = document.getElementById(previewContainerId);
        if (!container) return;

        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                container.innerHTML = `
                    <div class="image-preview">
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="remove-image" onclick="removeImagePreview('${previewContainerId}', '${input.id}', '${imageUrlId || ''}')">&times;</button>
                    </div>
                `;
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    // Xóa preview ảnh và reset file input cùng URL tương ứng.
    window.removeImagePreview = function (previewContainerId, inputId, imageUrlId) {
        const container = document.getElementById(previewContainerId);
        const input = document.getElementById(inputId);
        if (container) container.innerHTML = '';
        if (input) input.value = '';
        const imageUrl = imageUrlId && document.getElementById(imageUrlId);
        if (imageUrl) imageUrl.value = '';
    };

    // ========== SẮP XẾP BẢNG ==========

    // Sắp xếp bảng theo cột được chọn và luân phiên chiều tăng/giảm.
    window.sortTable = function (entity, field) {
        const config = state.sortConfig[entity] || {};
        const dir = config.field === field && config.dir === 'asc' ? 'desc' : 'asc';
        state.sortConfig[entity] = { field, dir };

        let list;
        switch (entity) {
            case 'products':
                list = state.products;
                break;
            case 'categories':
                list = state.categories;
                break;
            case 'contacts':
                list = state.contacts;
                break;
            default:
                return;
        }

        list.sort((a, b) => {
            let valA = a[field] || '';
            let valB = b[field] || '';
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return dir === 'asc' ? -1 : 1;
            if (valA > valB) return dir === 'asc' ? 1 : -1;
            return 0;
        });

        switch (entity) {
            case 'products':
                renderProducts();
                break;
            case 'categories':
                renderCategories();
                break;
            case 'contacts':
                renderContacts();
                break;
        }
    };

    // ========== PHÍM TẮT ==========

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            const confirmOverlay = document.getElementById('confirm-overlay');
            if (confirmOverlay.style.display !== 'none') {
                document.getElementById('confirm-cancel')?.click();
            }
        }
    });

    // ========== KHỞI TẠO ==========

    checkAuth();
})();
