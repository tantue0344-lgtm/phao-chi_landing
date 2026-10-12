/* ============================================
   PHÀO CHỈ VIỆT - JAVASCRIPT TRANG CHÍNH
   ============================================ */

(function () {
    'use strict';

    // ============ CÁC PHẦN TỬ DOM ============
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const escapeHtml = (value) => {
        const element = document.createElement('span');
        element.textContent = value == null ? '' : String(value);
        return element.innerHTML;
    };

    const navbar = $('#navbar');
    const navToggle = $('#navToggle');
    const navMenu = $('#navMenu');
    const heroSlider = $('#heroSlider');
    const heroSlides = $('#heroSlides');
    const heroDots = $('#heroDots');
    const heroPrev = $('#heroPrev');
    const heroNext = $('#heroNext');
    const heroFallback = $('#heroFallback');
    const heroSection = $('#hero');
    const categoriesGrid = $('#categoriesGrid');
    const categoriesLoading = $('#categoriesLoading');
    const featuredGrid = $('#featuredGrid');
    const featuredLoading = $('#featuredLoading');
    const productsGrid = $('#productsGrid');
    const productsLoading = $('#productsLoading');
    const productFilters = $('#productFilters');
    const loadMoreBtn = $('#loadMoreBtn');
    const contactForm = $('#contactForm');
    const formMessage = $('#formMessage');
    const scrollTopBtn = $('#scrollTopBtn');
    const productModal = $('#productModal');
    const modalOverlay = $('#modalOverlay');
    const modalClose = $('#modalClose');
    const modalBody = $('#modalBody');

    // ============ TRẠNG THÁI ============
    let currentSlide = 0;
    let slideCount = 0;
    let slideInterval = null;
    let allProducts = [];
    let displayedProducts = [];
    let currentCategory = 'all';
    let currentPage = 1;
    const PRODUCTS_PER_PAGE = 8;
    let categoriesData = [];
    let configuredPhone = '0356678961';

    // ============ KHỞI TẠO ============
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        setupNavbar();
        setupSmoothScroll();
        setupScrollToTop();
        setupIntersectionObserver();
        setupCounterAnimation();
        setupContactForm();
        setupModal();

        // Tải dữ liệu từ API
        loadSettings();
        loadHeroSlides();
        loadCategories();
        loadFeaturedProducts();
        loadAllProducts();
    }

    // ============ THANH ĐIỀU HƯỚNG ============
    function setupNavbar() {
        // Đổi nền khi cuộn trang
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            updateActiveNavLink();
        });

        // Nút bật/tắt menu trên điện thoại
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Đóng menu khi nhấn vào liên kết
        $$('.navbar__link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Đóng menu khi nhấn bên ngoài
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    function updateActiveNavLink() {
        const sections = $$('section[id]');
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = $(`.navbar__link[href="#${id}"]`);

            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    $$('.navbar__link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }

    // ============ CUỘN MƯỢT ============
    function setupSmoothScroll() {
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = $(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // ============ CUỘN LÊN ĐẦU TRANG ============
    function setupScrollToTop() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============ THEO DÕI PHẦN TỬ (HIỆU ỨNG CUỘN) ============
    function setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        $$('.animate-on-scroll').forEach(el => observer.observe(el));
    }

    // Theo dõi lại các phần tử mới sau khi tải nội dung động
    function observeNewElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        $$('.animate-on-scroll:not(.visible)').forEach(el => observer.observe(el));
    }

    // ============ HIỆU ỨNG ĐẾM ============
    function setupCounterAnimation() {
        observeCounterSection();
    }

    function observeCounterSection() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const statsSection = $('.about__stats');
        if (statsSection) observer.observe(statsSection);
    }

    function animateCounters() {
        $$('[data-count]').forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString('vi-VN');
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString('vi-VN') + (counter.dataset.suffix ?? '+');
                }
            };
            requestAnimationFrame(updateCounter);
        });
    }

    // ============ ẢNH TRÌNH CHIẾU ĐẦU TRANG ============
    async function loadHeroSlides() {
        try {
            let response = await fetch('/api/hero-slides');
            if (!response.ok) {
                response = await fetch('/api/slides');
            }
            if (!response.ok) throw new Error('Failed to load slides');
            const data = await response.json();
            const slides = data.data || data;

            if (slides && slides.length > 0) {
                renderHeroSlides(slides);
            } else {
                showHeroFallback();
            }
        } catch (err) {
            console.warn('Could not load hero slides, showing fallback:', err.message);
            showHeroFallback();
        }
    }

    function renderHeroSlides(slides) {
        heroSection.classList.add('hero--has-slides');
        slideCount = slides.length;

        heroSlides.innerHTML = slides.map((slide, i) => `
            <div class="hero__slide">
                <div class="hero__slide-bg" style="background-image: url('${slide.image || ''}')"></div>
                <div class="hero__slide-content">
                    <h1 class="hero__slide-title">${slide.title || 'Phào Chỉ Trang Trí Cao Cấp'}</h1>
                    <p class="hero__slide-desc">${slide.subtitle || slide.description || ''}</p>
                    ${(slide.button_text || slide.buttonText) ? `<a href="${slide.button_link || slide.buttonLink || '#products'}" class="btn btn--primary">${slide.button_text || slide.buttonText}</a>` : ''}
                </div>
            </div>
        `).join('');

        // Tạo các chấm điều hướng
        heroDots.innerHTML = slides.map((_, i) =>
            `<button class="hero__dot ${i === 0 ? 'active' : ''}" data-slide="${i}" aria-label="Slide ${i + 1}"></button>`
        ).join('');

        // Xử lý khi nhấn vào chấm điều hướng
        $$('.hero__dot', heroDots).forEach(dot => {
            dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.slide)));
        });

        // Xử lý khi nhấn nút mũi tên
        heroPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
        heroNext.addEventListener('click', () => goToSlide(currentSlide + 1));

        // Hỗ trợ thao tác chạm
        let touchStartX = 0;
        heroSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            clearInterval(slideInterval);
        }, { passive: true });
        heroSlider.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goToSlide(currentSlide + 1);
                else goToSlide(currentSlide - 1);
            }
            startSlideAutoPlay();
        }, { passive: true });

        // Tự động chuyển ảnh
        startSlideAutoPlay();
    }

    function goToSlide(index) {
        if (slideCount === 0) return;
        currentSlide = ((index % slideCount) + slideCount) % slideCount;
        heroSlides.style.transform = `translateX(-${currentSlide * 100}%)`;

        $$('.hero__dot', heroDots).forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function startSlideAutoPlay() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 5000);
    }

    function showHeroFallback() {
        heroSection.classList.remove('hero--has-slides');
        heroSlider.style.display = 'none';
        heroFallback.style.display = 'flex';
    }

    // ============ DANH MỤC ============
    async function loadCategories() {
        try {
            const response = await fetch('/api/categories', { cache: 'no-store' });
            if (!response.ok) throw new Error('Failed to load categories');
            const data = await response.json();
            categoriesData = Array.isArray(data) ? data : (data.data || data.categories || []);
            if (!Array.isArray(categoriesData)) {
                throw new Error('Invalid categories response');
            }

            renderFooterCategories(categoriesData);
            renderCategoryFilters(categoriesData);
            if (categoriesData.length > 0) {
                renderCategories(categoriesData);
            } else {
                categoriesGrid.innerHTML = '<p class="loading-spinner" style="color: rgba(255,255,255,0.7);">Chưa có danh mục nào.</p>';
            }
        } catch (err) {
            console.warn('Could not load categories:', err.message);
            renderFooterCategories([]);
            renderCategoryFilters([]);
            if (categoriesLoading) {
                categoriesLoading.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Không thể tải danh mục. Vui lòng thử lại.</p>';
            }
            if (categoriesGrid) {
                categoriesGrid.innerHTML = '<p class="loading-spinner" style="color: rgba(255,255,255,0.7);">Không thể tải danh mục. Vui lòng thử lại.</p>';
            }
        }
    }

    function renderCategories(categories) {
        categoriesGrid.innerHTML = categories.map(cat => `
            <div class="category-card animate-on-scroll" data-category-id="${escapeHtml(cat.id)}">
                ${cat.image
                    ? `<img class="category-card__image" src="${escapeHtml(cat.image)}" alt="${escapeHtml(cat.name)}" loading="lazy">`
                    : `<div class="category-card__placeholder"><i class="fas fa-layer-group"></i></div>`
                }
                <div class="category-card__overlay">
                    <div>
                        <div class="category-card__name">${escapeHtml(cat.name)}</div>
                        <div class="category-card__count">${Number(cat.product_count ?? cat.productCount ?? 0)} sản phẩm</div>
                    </div>
                </div>
            </div>
        `).join('');

        $$('[data-category-id]', categoriesGrid).forEach(card => {
            card.addEventListener('click', () => window.__filterByCategory(card.dataset.categoryId));
        });
        observeNewElements();
    }

    function renderCategoryFilters(categories) {
        const filtersHTML = categories.map(cat =>
            `<button class="products__filter" data-category="${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</button>`
        ).join('');

        productFilters.innerHTML = `<button class="products__filter active" data-category="all">Tất Cả</button>${filtersHTML}`;

        $$('.products__filter', productFilters).forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.products__filter', productFilters).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                currentPage = 1;
                filterAndRenderProducts();
            });
        });
    }

    function renderFooterCategories(categories) {
        const footerCats = $('#footerCategories');
        if (!footerCats) return;
        if (categories.length === 0) {
            footerCats.innerHTML = '<li><span>Chưa có danh mục sản phẩm.</span></li>';
            return;
        }

        footerCats.innerHTML = categories.map(cat =>
            `<li><a href="#products" data-category-id="${escapeHtml(cat.id)}"><i class="fas fa-angle-right"></i> ${escapeHtml(cat.name)}</a></li>`
        ).join('');
        $$('[data-category-id]', footerCats).forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                window.__filterByCategory(link.dataset.categoryId);
            });
        });
    }

    // Khi nhấn thẻ danh mục: cuộn đến sản phẩm và lọc theo danh mục
    window.__filterByCategory = function (categoryId) {
        const productsSection = $('#products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }

        setTimeout(() => {
            $$('.products__filter', productFilters).forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === categoryId);
            });
            currentCategory = categoryId;
            currentPage = 1;
            filterAndRenderProducts();
        }, 500);
    };

    // ============ SẢN PHẨM NỔI BẬT ============
    async function loadFeaturedProducts() {
        try {
            const response = await fetch('/api/products?featured=true');
            if (!response.ok) throw new Error('Failed to load featured products');
            const data = await response.json();
            const products = data.data || data;

            if (products && products.length > 0) {
                featuredGrid.innerHTML = products.slice(0, 8).map(p => createProductCard(p, true)).join('');
                observeNewElements();
            } else {
                featuredGrid.innerHTML = '<p class="loading-spinner"><span style="color: var(--color-gray);">Chưa có sản phẩm nổi bật.</span></p>';
            }
        } catch (err) {
            console.warn('Could not load featured products:', err.message);
            featuredGrid.innerHTML = '<p class="loading-spinner"><span style="color: var(--color-gray);">Không thể tải sản phẩm. Vui lòng thử lại.</span></p>';
        }
    }

    // ============ TẤT CẢ SẢN PHẨM ============
    async function loadAllProducts() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Failed to load products');
            const data = await response.json();
            allProducts = data.data || data;

            if (allProducts && allProducts.length > 0) {
                filterAndRenderProducts();
            } else {
                productsGrid.innerHTML = '<p class="loading-spinner"><span style="color: var(--color-gray);">Chưa có sản phẩm nào.</span></p>';
            }
        } catch (err) {
            console.warn('Could not load products:', err.message);
            productsGrid.innerHTML = '<p class="loading-spinner"><span style="color: var(--color-gray);">Không thể tải sản phẩm. Vui lòng thử lại.</span></p>';
        }
    }

    function filterAndRenderProducts() {
        let filtered;
        if (currentCategory === 'all') {
            filtered = allProducts;
        } else {
            filtered = allProducts.filter(p => {
                const catId = (p.category && typeof p.category === 'object')
                    ? (p.category._id || p.category.id)
                    : p.category;
                const productCategoryId = p.category_id ?? p.categoryId ?? catId;
                return String(productCategoryId) === String(currentCategory);
            });
        }

        displayedProducts = filtered.slice(0, currentPage * PRODUCTS_PER_PAGE);
        const hasMore = filtered.length > displayedProducts.length;

        if (displayedProducts.length > 0) {
            productsGrid.innerHTML = displayedProducts.map(p => createProductCard(p, false)).join('');
            observeNewElements();
        } else {
            productsGrid.innerHTML = '<p class="loading-spinner" style="grid-column:1/-1;"><span style="color: var(--color-gray);">Không tìm thấy sản phẩm nào trong danh mục này.</span></p>';
        }

        // Nút tải thêm sản phẩm
        if (hasMore) {
            loadMoreBtn.style.display = 'inline-flex';
            loadMoreBtn.onclick = () => {
                currentPage++;
                filterAndRenderProducts();
            };
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    // ============ MẪU THẺ SẢN PHẨM ============
    function createProductCard(product, featured) {
        const categoryName = product.category_name ||
            (product.category && typeof product.category === 'object'
                ? product.category.name
                : (getCategoryName(product.category_id ?? product.categoryId ?? product.category) || 'Phào Chỉ'));

        const priceFormatted = product.price
            ? new Intl.NumberFormat('vi-VN').format(product.price) + 'đ'
            : 'Liên hệ';

        const oldPriceHTML = product.oldPrice
            ? `<span class="product-card__price-old">${new Intl.NumberFormat('vi-VN').format(product.oldPrice)}đ</span>`
            : '';

        const productImage = product.image || product.gallery?.[0] || product.images?.[0];
        const imageHTML = productImage
            ? `<img class="product-card__image" src="${productImage}" alt="${product.name}" loading="lazy">`
            : `<div class="product-card__placeholder"><i class="fas fa-image"></i></div>`;

        const badgeHTML = featured && product.featured
            ? '<span class="product-card__badge">Nổi bật</span>'
            : (product.isNew ? '<span class="product-card__badge">Mới</span>' : '');

        return `
            <div class="product-card animate-on-scroll" data-product-id="${product._id || product.id}">
                <div class="product-card__image-wrapper" onclick="window.__showProductDetail('${product._id || product.id}')">
                    ${imageHTML}
                    ${badgeHTML}
                    <button class="product-card__quick-view" type="button">
                        <i class="fas fa-eye"></i> Xem Nhanh
                    </button>
                </div>
                <div class="product-card__body">
                    <div class="product-card__category">${categoryName}</div>
                    <h3 class="product-card__name">${product.name}</h3>
                    <div class="product-card__price">
                        ${priceFormatted}
                        ${oldPriceHTML}
                    </div>
                </div>
                <div class="product-card__footer">
                    <button class="product-card__btn" onclick="window.__showProductDetail('${product._id || product.id}')">
                        <i class="fas fa-info-circle"></i>
                        Xem Chi Tiết
                    </button>
                </div>
            </div>
        `;
    }

    function getCategoryName(categoryId) {
        if (!categoryId) return '';
        const cat = categoriesData.find(c => String(c._id || c.id) === String(categoryId));
        return cat ? cat.name : '';
    }

    // ============ HỘP THOẠI CHI TIẾT SẢN PHẨM ============
    function setupModal() {
        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    window.__showProductDetail = async function (productId) {
        // Tìm sản phẩm trong dữ liệu đã tải trước
        let product = allProducts.find(p => String(p._id || p.id) === String(productId));

        // Nếu không tìm thấy, lấy dữ liệu từ API
        if (!product) {
            try {
                const res = await fetch(`/api/products/${productId}`);
                if (res.ok) {
                    const data = await res.json();
                    product = data.data || data;
                }
            } catch (err) {
                console.warn('Could not load product detail:', err);
            }
        }

        if (!product) return;

        const categoryName = product.category_name ||
            (product.category && typeof product.category === 'object'
                ? product.category.name
                : (getCategoryName(product.category_id ?? product.categoryId ?? product.category) || 'Phào Chỉ'));

        const priceFormatted = product.price
            ? new Intl.NumberFormat('vi-VN').format(product.price) + 'đ'
            : 'Liên hệ';

        const productImage = product.image || product.gallery?.[0] || product.images?.[0];
        const imageHTML = productImage
            ? `<img src="${productImage}" alt="${product.name}">`
            : `<div class="modal__product-image-placeholder"><i class="fas fa-image"></i></div>`;

        // Tạo danh sách thông số
        let specsHTML = '';
        if (product.dimensions || product.material || product.code || product.weight) {
            specsHTML = `
                <div class="modal__product-specs">
                    ${product.code ? `<div class="modal__product-spec"><span class="modal__product-spec-label">Mã sản phẩm</span><span class="modal__product-spec-value">${product.code}</span></div>` : ''}
                    ${product.material ? `<div class="modal__product-spec"><span class="modal__product-spec-label">Chất liệu</span><span class="modal__product-spec-value">${product.material}</span></div>` : ''}
                    ${product.dimensions ? `<div class="modal__product-spec"><span class="modal__product-spec-label">Kích thước</span><span class="modal__product-spec-value">${product.dimensions}</span></div>` : ''}
                    ${product.weight ? `<div class="modal__product-spec"><span class="modal__product-spec-label">Trọng lượng</span><span class="modal__product-spec-value">${product.weight}</span></div>` : ''}
                </div>
            `;
        }

        modalBody.innerHTML = `
            <div class="modal__product">
                <div class="modal__product-image">
                    ${imageHTML}
                </div>
                <div class="modal__product-info">
                    <div class="modal__product-category">${categoryName}</div>
                    <h2 class="modal__product-name">${product.name}</h2>
                    <div class="modal__product-price">${priceFormatted}</div>
                    <p class="modal__product-desc">${product.description || 'Phào chỉ trang trí cao cấp, sản xuất từ nguyên liệu chất lượng, phù hợp cho mọi không gian nội thất.'}</p>
                    ${specsHTML}
                    <div class="modal__product-actions">
                        <a href="tel:${configuredPhone}" class="btn btn--primary">
                            <i class="fas fa-phone-alt"></i>
                            <span>Liên Hệ Ngay</span>
                        </a>
                        <button class="btn btn--outline" onclick="window.__closeProductModal()">
                            <i class="fas fa-times"></i>
                            <span>Đóng</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        productModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.__closeProductModal = function () {
        closeModal();
    };

    function closeModal() {
        productModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ============ BIỂU MẪU LIÊN HỆ ============
    function setupContactForm() {
        contactForm.addEventListener('submit', handleContactSubmit);

        // Kiểm tra dữ liệu theo thời gian thực
        $$('.form-input', contactForm).forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField(input);
                }
            });
        });
    }

    function validateField(input) {
        const name = input.name;
        const value = input.value.trim();
        let errorEl;
        let isValid = true;

        switch (name) {
            case 'name':
                errorEl = $('#nameError');
                if (!value) {
                    errorEl.textContent = 'Vui lòng nhập họ và tên';
                    input.classList.add('error');
                    isValid = false;
                } else if (value.length < 2) {
                    errorEl.textContent = 'Họ tên phải có ít nhất 2 ký tự';
                    input.classList.add('error');
                    isValid = false;
                } else {
                    errorEl.textContent = '';
                    input.classList.remove('error');
                }
                break;

            case 'email':
                errorEl = $('#emailError');
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorEl.textContent = 'Email không hợp lệ';
                    input.classList.add('error');
                    isValid = false;
                } else {
                    errorEl.textContent = '';
                    input.classList.remove('error');
                }
                break;

            case 'phone':
                errorEl = $('#phoneError');
                const phoneClean = value.replace(/[\s-]/g, '');
                if (!value) {
                    errorEl.textContent = 'Vui lòng nhập số điện thoại';
                    input.classList.add('error');
                    isValid = false;
                } else if (!/^(0|\+84)\d{9,10}$/.test(phoneClean)) {
                    errorEl.textContent = 'Số điện thoại không hợp lệ';
                    input.classList.add('error');
                    isValid = false;
                } else {
                    errorEl.textContent = '';
                    input.classList.remove('error');
                }
                break;
        }

        return isValid;
    }

    async function handleContactSubmit(e) {
        e.preventDefault();

        // Kiểm tra tất cả các trường bắt buộc
        const nameInput = $('#contactName');
        const emailInput = $('#contactEmailInput');
        const phoneInput = $('#contactPhoneInput');
        const messageInput = $('#contactMessage');

        const isNameValid = validateField(nameInput);
        const isEmailValid = validateField(emailInput);
        const isPhoneValid = validateField(phoneInput);

        if (!isNameValid || !isEmailValid || !isPhoneValid) {
            showFormMessage('Vui lòng kiểm tra lại thông tin.', 'error');
            return;
        }

        const submitBtn = $('#contactSubmitBtn');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Đang gửi...</span>';

        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            message: messageInput.value.trim(),
        };

        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Lỗi khi gửi tin nhắn');
            }

            showFormMessage('Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ liên hệ lại sớm nhất.', 'success');
            contactForm.reset();
            $$('.form-error', contactForm).forEach(el => el.textContent = '');
            $$('.form-input', contactForm).forEach(el => el.classList.remove('error'));
        } catch (err) {
            console.error('Contact form error:', err);
            showFormMessage(err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau hoặc gọi trực tiếp cho chúng tôi.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    }

    function showFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;

        // Tự ẩn sau 6 giây
        setTimeout(() => {
            formMessage.className = 'form-message';
        }, 6000);
    }

    // ============ CÀI ĐẶT ============
    async function loadSettings() {
        try {
            const res = await fetch('/api/settings');
            if (!res.ok) return;
            const settings = await res.json();
            applySettings(settings);
        } catch (err) {
            console.warn('Could not load website settings:', err);
        }
    }

    function applySettings(s) {
        if (!s || typeof s !== 'object') return;
        const companyName = s.companyName || s.company_name;
        const logo = typeof s.logo === 'string' ? s.logo : '';
        const phone = s.phone;
        const email = s.email;
        const address = s.address;
        const about = s.about || s.about_text;
        const aboutTitle = s.aboutTitle;
        const aboutTitleText = s.aboutTitleText;
        const aboutHeadingText = s.aboutHeading;
        const aboutTextSecondary = s.aboutTextSecondary;
        const aboutImage = s.aboutImage;
        const aboutBadgeNumber = s.aboutBadgeNumber;
        const aboutBadgeText = s.aboutBadgeText;
        const featuresTitle = s.featuresTitle;
        let socialLinks = s.socialLinks;
        let features = s.features;
        let aboutStats = s.aboutStats;

        if (typeof socialLinks === 'string') {
            try {
                socialLinks = JSON.parse(socialLinks);
            } catch (err) {
                console.warn('Could not parse footer social links:', err);
                socialLinks = null;
            }
        }
        if (typeof aboutStats === 'string') {
            try {
                aboutStats = JSON.parse(aboutStats);
            } catch (err) {
                console.warn('Could not parse about section statistics:', err);
                aboutStats = null;
            }
        }
        if (typeof features === 'string') {
            try {
                features = JSON.parse(features);
            } catch (err) {
                console.warn('Could not parse website commitments:', err);
                features = null;
            }
        }

        // Tên công ty, logo và tiêu đề
        if (companyName) {
            document.title = `${companyName} - Phào Chỉ Trang Trí Cao Cấp`;
            $$('.site-company-name').forEach(el => el.textContent = companyName);
            const copyEl = $('#footerCopyright');
            if (copyEl) {
                copyEl.innerHTML = `&copy; ${new Date().getFullYear()} ${companyName}. Tất cả quyền được bảo lưu.`;
            }
            const aboutHeading = $('#aboutHeading');
            if (aboutHeading) {
                aboutHeading.textContent = aboutHeadingText || `${companyName} – Kiến Tạo Vẻ Đẹp Cho Mọi Công Trình`;
            }
        }

        const aboutTitleElement = $('#aboutTitle');
        if (aboutTitleElement && typeof aboutTitle === 'string') aboutTitleElement.textContent = aboutTitle;
        const aboutTitleTextElement = $('#aboutSectionTitle');
        if (aboutTitleTextElement && typeof aboutTitleText === 'string') aboutTitleTextElement.textContent = aboutTitleText;
        const aboutHeadingElement = $('#aboutHeading');
        if (aboutHeadingElement && typeof aboutHeadingText === 'string' && aboutHeadingText) {
            aboutHeadingElement.textContent = aboutHeadingText;
        }
        const aboutImageElement = $('#aboutImage');
        if (aboutImageElement && typeof aboutImage === 'string') {
            aboutImageElement.style.display = '';
            aboutImageElement.parentElement.classList.remove('about__image-placeholder');
            if (aboutImage) aboutImageElement.src = aboutImage;
            else {
                aboutImageElement.removeAttribute('src');
                aboutImageElement.style.display = 'none';
                aboutImageElement.parentElement.classList.add('about__image-placeholder');
            }
        }
        const aboutBadgeNumberElement = $('#aboutBadgeNumber');
        if (aboutBadgeNumberElement && typeof aboutBadgeNumber === 'string') aboutBadgeNumberElement.textContent = aboutBadgeNumber;
        const aboutBadgeTextElement = $('#aboutBadgeText');
        if (aboutBadgeTextElement && typeof aboutBadgeText === 'string') aboutBadgeTextElement.textContent = aboutBadgeText;

        $$('.site-logo-image').forEach(image => {
            if (logo) {
                image.src = logo;
                image.hidden = false;
            } else {
                image.removeAttribute('src');
                image.hidden = true;
            }
        });

        const socialLinksContainer = $('#footerSocialLinks');
        if (socialLinksContainer && Array.isArray(socialLinks)) {
            socialLinksContainer.innerHTML = socialLinks
                .filter(link => link && typeof link === 'object')
                .map(link => {
                    const url = getSafeSocialUrl(link.url);
                    const icon = typeof link.icon === 'string' && /^(fab|fas|far) fa-[\w-]+$/.test(link.icon)
                        ? link.icon
                        : 'fas fa-globe';
                    const label = typeof link.label === 'string' ? link.label.trim() : '';
                    if (!url || !label) return '';
                    return `<a href="${escapeHtml(url)}" class="footer__social-link" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" target="_blank" rel="noopener noreferrer"><i class="${icon}" aria-hidden="true"></i></a>`;
                })
                .join('');
        }

        // Số điện thoại
        if (typeof phone === 'string') {
            const cleanPhone = phone.replace(/[^\d+]/g, '');
            const zaloPhone = cleanPhone.replace(/^\+84/, '0').replace(/\D/g, '');
            configuredPhone = cleanPhone;
            const navPhone = $('#navbarPhone') || $('.navbar__phone');
            if (navPhone) {
                navPhone.href = cleanPhone ? `tel:${cleanPhone}` : '#';
                const span = navPhone.querySelector('span');
                if (span) span.textContent = phone || '—';
            }
            const contactPhone = $('#contactPhone');
            if (contactPhone) {
                contactPhone.href = zaloPhone ? `https://zalo.me/${zaloPhone}` : '#';
                contactPhone.textContent = phone || '—';
            }
            const footerPhone = $('#footerPhone');
            if (footerPhone) {
                footerPhone.href = zaloPhone ? `https://zalo.me/${zaloPhone}` : '#';
                footerPhone.textContent = phone || '—';
            }
        }

        // Địa chỉ email
        if (typeof email === 'string') {
            const contactEmail = $('#contactEmail');
            if (contactEmail) {
                contactEmail.href = email ? `mailto:${email}` : '#';
                contactEmail.textContent = email || '—';
            }
            const footerEmail = $('#footerEmail');
            if (footerEmail) {
                footerEmail.href = email ? `mailto:${email}` : '#';
                footerEmail.textContent = email || '—';
            }
        }

        // Địa chỉ
        if (typeof address === 'string') {
            const contactAddress = $('#contactAddress');
            if (contactAddress) contactAddress.textContent = address || '—';
            const footerAddress = $('#footerAddress');
            if (footerAddress) footerAddress.textContent = address || '—';
        }

        // Nội dung giới thiệu
        if (typeof about === 'string') {
            const aboutText = $('#aboutText');
            if (aboutText) {
                aboutText.textContent = about;
            }
            const footerAbout = $('#footerAbout');
            if (footerAbout) {
                footerAbout.textContent = about.length > 160 ? about.substring(0, 160) + '...' : about;
            }
        }

        const aboutTextSecondaryElement = $('#aboutTextSecondary');
        if (aboutTextSecondaryElement && typeof aboutTextSecondary === 'string') {
            aboutTextSecondaryElement.textContent = aboutTextSecondary;
        }
        const aboutStatsElement = $('#aboutStats');
        if (aboutStatsElement && Array.isArray(aboutStats)) {
            const validStats = aboutStats.filter(stat => stat && typeof stat === 'object');
            aboutStatsElement.innerHTML = validStats.map((stat) => {
                const value = Number(stat.value);
                const count = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
                return `
                    <div class="about__stat">
                        <div class="about__stat-icon"><i class="${escapeHtml(stat.icon || 'fas fa-chart-line')}"></i></div>
                        <div class="about__stat-number" data-count="${count}" data-suffix="${escapeHtml(typeof stat.suffix === 'string' ? stat.suffix : '+')}">0</div>
                        <div class="about__stat-label">${escapeHtml(stat.label || '')}</div>
                    </div>
                `;
            }).join('');
            observeCounterSection();
            observeNewElements();
        }

        const featuresTitleElement = $('#featuresTitle');
        if (featuresTitleElement && typeof featuresTitle === 'string') {
            featuresTitleElement.textContent = featuresTitle;
        }
        const featuresGrid = $('#featuresGrid');
        if (featuresGrid && Array.isArray(features)) {
            featuresGrid.innerHTML = features.map(feature => `
                <div class="feature-card animate-on-scroll">
                    <div class="feature-card__icon">
                        <i class="${escapeHtml(feature.icon || 'fas fa-check')}"></i>
                    </div>
                    <h3 class="feature-card__title">${escapeHtml(feature.title)}</h3>
                    <p class="feature-card__text">${escapeHtml(feature.description)}</p>
                </div>
            `).join('');
            observeNewElements();
        }
    }

    function getSafeSocialUrl(value) {
        if (typeof value !== 'string' || !value.trim()) return '';
        try {
            const url = new URL(value.trim());
            return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
        } catch {
            return '';
        }
    }

})();
