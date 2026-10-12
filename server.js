const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

// ─── Cấu hình ─────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const DEFAULT_SETTINGS = {
  companyName: 'Guline',
  phone: '0356678961',
  email: 'tantue0344@gmail.com',
  address: '236/2, TL41, An Phú Đông, Hồ Chí Minh',
  about: 'Chuyên sản xuất và phân phối phào chỉ trang trí cao cấp. Đa dạng mẫu mã, chất lượng vượt trội, giá cả hợp lý.',
  aboutTitle: 'Về Chúng Tôi',
  aboutTitleText: 'Đơn Vị Hàng Đầu Về Phào Chỉ Trang Trí',
  aboutTextSecondary: 'Mỗi sản phẩm phào chỉ của chúng tôi được chế tác tỉ mỉ từ những nguyên liệu tốt nhất, kết hợp giữa nghệ thuật truyền thống và công nghệ hiện đại, tạo nên những đường nét tinh xảo hoàn hảo cho không gian sống của bạn.',
  aboutImage: '/images/about-placeholder.jpg',
  aboutBadgeNumber: '15+',
  aboutBadgeText: 'Năm Kinh Nghiệm',
  aboutStats: JSON.stringify([
    { icon: 'fas fa-calendar-alt', value: 15, suffix: '+', label: 'Năm Kinh Nghiệm' },
    { icon: 'fas fa-boxes-stacked', value: 500, suffix: '+', label: 'Sản Phẩm' },
    { icon: 'fas fa-smile', value: 2000, suffix: '+', label: 'Khách Hàng Hài Lòng' },
    { icon: 'fas fa-building', value: 350, suffix: '+', label: 'Dự Án Hoàn Thành' },
  ]),
  aboutHeading: '',
  logo: '',
  socialLinks: JSON.stringify([
    { label: 'Facebook', icon: 'fab fa-facebook-f', url: '' },
    { label: 'Instagram', icon: 'fab fa-instagram', url: '' },
    { label: 'YouTube', icon: 'fab fa-youtube', url: '' },
    { label: 'Zalo', icon: 'fas fa-comment-dots', url: '' },
  ]),
  featuresTitle: 'Cam Kết Của Chúng Tôi',
  features: JSON.stringify([
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
  ]),
};

function mergeSettings(rows) {
  const settings = { ...DEFAULT_SETTINGS };
  const storedKeys = new Set();
  for (const row of rows) {
    settings[row.key] = row.value;
    storedKeys.add(row.key);
  }
  if (storedKeys.has('company_name') && !storedKeys.has('companyName')) {
    settings.companyName = settings.company_name;
  }
  if (storedKeys.has('about_text') && !storedKeys.has('about')) {
    settings.about = settings.about_text;
  }
  if (typeof settings.features !== 'string' || !settings.features.trim()) {
    settings.features = DEFAULT_SETTINGS.features;
  }
  if (typeof settings.featuresTitle !== 'string' || !settings.featuresTitle.trim()) {
    settings.featuresTitle = DEFAULT_SETTINGS.featuresTitle;
  }
  return settings;
}

// ─── Các hàm trung gian ───────────────────────────────────────────────────────

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Tệp tĩnh
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
app.use(express.static(publicDir));

// Thư mục lưu ảnh tải lên
const uploadsDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Cấu hình Multer ──────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp, svg)'));
    }
  },
});

// ─── Hàm trung gian xác thực ──────────────────────────────────────────────────

function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
  }
}

// ─── Tiện ích: tạo slug ───────────────────────────────────────────────────────

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isUniqueViolation(err) {
  return err.code === '23505' || (err.message && err.message.includes('UNIQUE'));
}

// ═══════════════════════════════════════════════════════════════════════════
//  API công khai
// ═══════════════════════════════════════════════════════════════════════════

// --- GET /api/categories: lấy danh sách danh mục ---
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await db.prepare(
      `SELECT c.*, COUNT(p.id)::integer AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`
    ).all();
    res.json(categories);
  } catch (err) {
    console.error('[Categories]', err);
    res.status(500).json({ error: 'Lỗi tải danh mục.' });
  }
});

// --- GET /api/products: lấy danh sách sản phẩm ---
app.get('/api/products', async (req, res) => {
  try {
    const { category, featured, limit } = req.query;
    let sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ' AND (c.slug = ? OR p.category_id::text = ?)';
      params.push(category, category);
    }
    if (featured === '1' || featured === 'true') {
      sql += ' AND p.featured = 1';
    }

    sql += ' ORDER BY p.sort_order ASC, p.created_at DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const products = await db.prepare(sql).all(...params);
    // Chuyển dữ liệu bộ sưu tập ảnh từ JSON
    const result = products.map((p) => ({
      ...p,
      gallery: JSON.parse(p.gallery || '[]'),
    }));
    res.json(result);
  } catch (err) {
    console.error('[Products]', err);
    res.status(500).json({ error: 'Lỗi tải sản phẩm.' });
  }
});

// --- GET /api/products/:id: lấy chi tiết sản phẩm ---
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db
      .prepare(
        `SELECT p.*, c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id::text = ? OR p.slug = ?`
      )
      .get(req.params.id, req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    }
    product.gallery = JSON.parse(product.gallery || '[]');
    res.json(product);
  } catch (err) {
    console.error('[Product]', err);
    res.status(500).json({ error: 'Lỗi tải sản phẩm.' });
  }
});

// --- GET /api/hero-slides: lấy danh sách ảnh trình chiếu ---
app.get('/api/hero-slides', async (_req, res) => {
  try {
    const slides = await db
      .prepare('SELECT * FROM hero_slides WHERE active = 1 ORDER BY sort_order ASC')
      .all();
    res.json(slides);
  } catch (err) {
    console.error('[Hero Slides]', err);
    res.status(500).json({ error: 'Lỗi tải slides.' });
  }
});

// --- GET /api/settings: lấy cài đặt website ---
app.get('/api/settings', async (_req, res) => {
  try {
    const rows = await db.prepare('SELECT key, value FROM settings').all();
    res.json(mergeSettings(rows));
  } catch (err) {
    console.error('[Settings]', err);
    res.status(500).json({ error: 'Lỗi tải cài đặt.' });
  }
});

// --- POST /api/contacts: gửi thông tin liên hệ ---
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập họ tên.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập nội dung tin nhắn.' });
    }

    const result = await db
      .prepare('INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?) RETURNING id')
      .run(name.trim(), (email || '').trim(), (phone || '').trim(), message.trim());

    res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.',
      id: result.lastInsertRowid,
    });
  } catch (err) {
    console.error('[Contact]', err);
    res.status(500).json({ error: 'Lỗi gửi liên hệ. Vui lòng thử lại sau.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
//  API xác thực
// ═══════════════════════════════════════════════════════════════════════════

// --- POST /api/auth/login: đăng nhập ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const user = await db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie có hiệu lực trong 7 ngày
    });

    res.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error('[Login]', err);
    res.status(500).json({ error: 'Lỗi đăng nhập. Vui lòng thử lại.' });
  }
});

// --- POST /api/auth/logout: đăng xuất ---
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Đã đăng xuất.' });
});

// --- GET /api/auth/me: lấy thông tin tài khoản hiện tại ---
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ═══════════════════════════════════════════════════════════════════════════
//  API quản trị (mọi route đều yêu cầu xác thực)
// ═══════════════════════════════════════════════════════════════════════════

const admin = express.Router();
admin.use(authMiddleware);
let adminAuditWriteQueue = Promise.resolve();
admin.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  res.on('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 300) return;

    const route = req.originalUrl.split('?')[0];
    const actionNames = { POST: 'Tạo mới', PUT: 'Cập nhật', PATCH: 'Cập nhật', DELETE: 'Xóa' };
    let summary = '';
    if (req.path === '/settings') {
      summary = `Cập nhật cài đặt: ${Object.keys(req.body || {}).filter((key) => !['password', 'token'].includes(key)).join(', ')}`;
    } else if (req.file) {
      summary = `Tải lên ảnh ${req.file.originalname || req.file.filename}`;
    } else if (Array.isArray(req.files) && req.files.length) {
      summary = `Tải lên ${req.files.length} ảnh`;
    } else {
      const label = req.body?.name || req.body?.title;
      if (typeof label === 'string') summary = label.slice(0, 180);
    }

    adminAuditWriteQueue = adminAuditWriteQueue
      .then(() => db.prepare(
        'INSERT INTO admin_audit_logs (actor, action, route, summary) VALUES (?, ?, ?, ?)'
      ).run(req.user?.username || 'admin', actionNames[req.method], route, summary))
      .catch((err) => console.error('[Admin Audit Log]', err));
  });
  next();
});

async function registerUploadedImage(file, username) {
  await db.prepare(
    `INSERT INTO uploaded_images (filename, original_name, url, mime_type, size_bytes, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(filename) DO UPDATE SET
       original_name = EXCLUDED.original_name,
       url = EXCLUDED.url,
       mime_type = EXCLUDED.mime_type,
       size_bytes = EXCLUDED.size_bytes,
       uploaded_by = EXCLUDED.uploaded_by`
  ).run(
    file.filename,
    file.originalname || file.filename,
    `/uploads/${file.filename}`,
    file.mimetype || '',
    file.size || 0,
    username || 'admin'
  );
}

async function syncUploadedImageHistory() {
  const entries = await fs.promises.readdir(uploadsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const fullPath = path.join(uploadsDir, entry.name);
    const fileStat = await fs.promises.stat(fullPath);
    const ext = path.extname(entry.name).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    await db.prepare(
      `INSERT INTO uploaded_images (filename, original_name, url, mime_type, size_bytes, uploaded_by, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(filename) DO NOTHING`
    ).run(
      entry.name,
      entry.name,
      `/uploads/${entry.name}`,
      mimeTypes[ext] || 'application/octet-stream',
      fileStat.size,
      'Lưu trữ trước đây',
      fileStat.birthtime
    );
  }
}

async function collectReferencedUploadUrls() {
  const [products, categories, slides, settings] = await Promise.all([
    db.prepare('SELECT image, gallery FROM products').all(),
    db.prepare('SELECT image FROM categories').all(),
    db.prepare('SELECT image FROM hero_slides').all(),
    db.prepare('SELECT value FROM settings').all(),
  ]);
  const references = new Set();
  const addImage = (value) => {
    if (typeof value === 'string' && value.startsWith('/uploads/')) references.add(value);
  };

  for (const product of products) {
    addImage(product.image);
    try {
      const gallery = JSON.parse(product.gallery || '[]');
      if (Array.isArray(gallery)) gallery.forEach(addImage);
    } catch (err) {
      console.error('[Image History] Invalid product gallery JSON:', err);
    }
  }
  categories.forEach((category) => addImage(category.image));
  slides.forEach((slide) => addImage(slide.image));
  for (const setting of settings) {
    const matches = String(setting.value || '').match(/\/uploads\/[^"'\\\s,}\]]+/g) || [];
    matches.forEach(addImage);
  }
  return references;
}

// --- Thống kê trang tổng quan ---
admin.get('/dashboard', async (_req, res) => {
  try {
    const totalProducts = Number((await db.prepare('SELECT COUNT(*) AS count FROM products').get()).count);
    const totalCategories = Number((await db.prepare('SELECT COUNT(*) AS count FROM categories').get()).count);
    const unreadContacts = await db
      .prepare('SELECT COUNT(*) AS count FROM contacts WHERE "read" = 0')
      .get();
    const totalUnreadContacts = Number(unreadContacts.count);
    const totalContacts = Number((await db.prepare('SELECT COUNT(*) AS count FROM contacts').get()).count);

    res.json({ totalProducts, totalCategories, unreadContacts: totalUnreadContacts, totalContacts });
  } catch (err) {
    console.error('[Dashboard]', err);
    res.status(500).json({ error: 'Lỗi tải thống kê.' });
  }
});

// --- Tải ảnh lên ---
admin.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file nào được tải lên.' });
    }
    await registerUploadedImage(req.file, req.user?.username);
    const url = `/uploads/${req.file.filename}`;
    res.json({ success: true, url });
  } catch (err) {
    if (req.file?.path) {
      await fs.promises.unlink(req.file.path).catch((unlinkErr) => {
        console.error('[Upload Cleanup]', unlinkErr);
      });
      await db.prepare('DELETE FROM uploaded_images WHERE filename = ?').run(req.file.filename)
        .catch((cleanupErr) => console.error('[Upload History Cleanup]', cleanupErr));
    }
    console.error('[Upload]', err);
    res.status(500).json({ error: 'Lỗi tải file.' });
  }
});

// --- Tải nhiều ảnh lên (thư viện ảnh) ---
admin.post('/upload-multiple', upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Không có file nào được tải lên.' });
    }
    for (const file of req.files) {
      await registerUploadedImage(file, req.user?.username);
    }
    const urls = req.files.map((file) => `/uploads/${file.filename}`);
    res.json({ success: true, urls });
  } catch (err) {
    for (const file of req.files || []) {
      await fs.promises.unlink(file.path).catch((unlinkErr) => {
        console.error('[Upload Multiple Cleanup]', unlinkErr);
      });
      await db.prepare('DELETE FROM uploaded_images WHERE filename = ?').run(file.filename)
        .catch((cleanupErr) => console.error('[Upload Multiple History Cleanup]', cleanupErr));
    }
    console.error('[Upload Multiple]', err);
    res.status(500).json({ error: 'Lỗi tải nhiều file.' });
  }
});

admin.get('/uploads', async (_req, res) => {
  try {
    await syncUploadedImageHistory();
    const [images, referencedUrls] = await Promise.all([
      db.prepare('SELECT * FROM uploaded_images ORDER BY uploaded_at DESC, id DESC').all(),
      collectReferencedUploadUrls(),
    ]);
    res.json(images.map((image) => ({
      ...image,
      in_use: referencedUrls.has(image.url),
    })));
  } catch (err) {
    console.error('[Admin Upload History]', err);
    res.status(500).json({ error: 'Lỗi tải lịch sử ảnh.' });
  }
});

admin.delete('/uploads/:id', async (req, res) => {
  try {
    const image = await db.prepare('SELECT * FROM uploaded_images WHERE id = ?').get(req.params.id);
    if (!image) return res.status(404).json({ error: 'Không tìm thấy ảnh trong lịch sử.' });

    const referencedUrls = await collectReferencedUploadUrls();
    if (referencedUrls.has(image.url)) {
      return res.status(409).json({ error: 'Ảnh đang được sử dụng. Hãy thay hoặc gỡ ảnh khỏi nội dung trước khi xóa.' });
    }

    if (path.basename(image.filename) !== image.filename) {
      return res.status(400).json({ error: 'Đường dẫn ảnh không hợp lệ.' });
    }
    const imagePath = path.resolve(uploadsDir, image.filename);
    if (path.dirname(imagePath) !== path.resolve(uploadsDir)) {
      return res.status(400).json({ error: 'Đường dẫn ảnh không hợp lệ.' });
    }
    const imageStat = await fs.promises.lstat(imagePath);
    if (!imageStat.isFile()) {
      return res.status(400).json({ error: 'Chỉ cho phép xóa tệp ảnh trong thư mục tải lên.' });
    }

    await fs.promises.unlink(imagePath);
    await db.prepare('DELETE FROM uploaded_images WHERE id = ?').run(image.id);
    res.json({ success: true, message: 'Đã xóa ảnh khỏi máy chủ.' });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Tệp ảnh không còn tồn tại trên máy chủ.' });
    }
    console.error('[Admin Delete Uploaded Image]', err);
    res.status(500).json({ error: 'Lỗi xóa ảnh khỏi máy chủ.' });
  }
});

admin.get('/audit-logs', async (_req, res) => {
  try {
    await adminAuditWriteQueue;
    const logs = await db.prepare(
      'SELECT id, actor, action, route, summary, created_at FROM admin_audit_logs ORDER BY created_at DESC, id DESC LIMIT 500'
    ).all();
    res.json(logs);
  } catch (err) {
    console.error('[Admin Audit History]', err);
    res.status(500).json({ error: 'Lỗi tải lịch sử hoạt động admin.' });
  }
});

// ─── Thêm, đọc, sửa, xóa sản phẩm trong trang quản trị ────────────────────────

admin.get('/products', async (req, res) => {
  try {
    const products = await db
      .prepare(
        `SELECT p.*, c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         ORDER BY p.sort_order ASC, p.created_at DESC`
      )
      .all();
    const result = products.map((p) => ({ ...p, gallery: JSON.parse(p.gallery || '[]') }));
    res.json(result);
  } catch (err) {
    console.error('[Admin Products]', err);
    res.status(500).json({ error: 'Lỗi tải danh sách sản phẩm.' });
  }
});

admin.get('/products/:id', async (req, res) => {
  try {
    const product = await db
      .prepare(
        `SELECT p.*, c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`
      )
      .get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    }
    product.gallery = JSON.parse(product.gallery || '[]');
    res.json(product);
  } catch (err) {
    console.error('[Admin Product]', err);
    res.status(500).json({ error: 'Lỗi tải sản phẩm.' });
  }
});

admin.post('/products', async (req, res) => {
  try {
    const { name, description, price, material, dimensions, image, featured } = req.body;
    const category_id = req.body.category_id || req.body.category || req.body.categoryId || null;
    const sort_order = req.body.sort_order !== undefined ? req.body.sort_order : (req.body.sortOrder !== undefined ? req.body.sortOrder : 0);

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tên sản phẩm không được để trống.' });
    }

    const slug = generateSlug(name);
    let galleryJson = '[]';
    if (Array.isArray(req.body.gallery)) {
      galleryJson = JSON.stringify(req.body.gallery.filter(Boolean));
    } else if (typeof req.body.gallery === 'string') {
      try {
        const parsed = JSON.parse(req.body.gallery);
        galleryJson = JSON.stringify(Array.isArray(parsed) ? parsed : [req.body.gallery]);
      } catch {
        galleryJson = JSON.stringify(req.body.gallery ? [req.body.gallery] : []);
      }
    }

    const isFeatured = featured === true || featured === 1 || featured === '1' || featured === 'true' ? 1 : 0;

    const result = await db
      .prepare(
        `INSERT INTO products (category_id, name, slug, description, price, material, dimensions, image, gallery, featured, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
      )
      .run(
        category_id ? parseInt(category_id, 10) : null,
        name.trim(),
        slug,
        (description || '').trim(),
        parseFloat(price) || 0,
        (material || '').trim(),
        (dimensions || '').trim(),
        (image || '').trim(),
        galleryJson,
        isFeatured,
        parseInt(sort_order, 10) || 0
      );

    const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    product.gallery = JSON.parse(product.gallery || '[]');
    res.status(201).json(product);
  } catch (err) {
    console.error('[Admin Create Product]', err);
    if (isUniqueViolation(err)) {
      return res.status(400).json({ error: 'Sản phẩm với tên tương tự đã tồn tại.' });
    }
    res.status(500).json({ error: 'Lỗi tạo sản phẩm.' });
  }
});

admin.put('/products/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    }

    const { name, description, price, material, dimensions, image, featured } = req.body;
    const category_id = req.body.category_id !== undefined ? req.body.category_id : (req.body.category !== undefined ? req.body.category : req.body.categoryId);
    const sort_order = req.body.sort_order !== undefined ? req.body.sort_order : req.body.sortOrder;

    const updatedName = name ? name.trim() : existing.name;
    const slug = name ? generateSlug(updatedName) : existing.slug;

    let galleryJson = existing.gallery;
    if (req.body.gallery !== undefined) {
      if (Array.isArray(req.body.gallery)) {
        galleryJson = JSON.stringify(req.body.gallery.filter(Boolean));
      } else if (typeof req.body.gallery === 'string') {
        try {
          const parsed = JSON.parse(req.body.gallery);
          galleryJson = JSON.stringify(Array.isArray(parsed) ? parsed : [req.body.gallery]);
        } catch {
          galleryJson = JSON.stringify(req.body.gallery ? [req.body.gallery] : []);
        }
      }
    }

    const isFeatured = featured !== undefined
      ? (featured === true || featured === 1 || featured === '1' || featured === 'true' ? 1 : 0)
      : existing.featured;

    await db.prepare(
      `UPDATE products SET
         category_id = ?, name = ?, slug = ?, description = ?, price = ?,
         material = ?, dimensions = ?, image = ?, gallery = ?, featured = ?,
         sort_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(
      category_id !== undefined ? (category_id ? parseInt(category_id, 10) : null) : existing.category_id,
      updatedName,
      slug,
      description !== undefined ? description.trim() : existing.description,
      price !== undefined ? (parseFloat(price) || 0) : existing.price,
      material !== undefined ? material.trim() : existing.material,
      dimensions !== undefined ? dimensions.trim() : existing.dimensions,
      image !== undefined ? image.trim() : existing.image,
      galleryJson,
      isFeatured,
      sort_order !== undefined ? (parseInt(sort_order, 10) || 0) : existing.sort_order,
      req.params.id
    );

    const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    product.gallery = JSON.parse(product.gallery || '[]');
    res.json(product);
  } catch (err) {
    console.error('[Admin Update Product]', err);
    if (isUniqueViolation(err)) {
      return res.status(400).json({ error: 'Sản phẩm với tên tương tự đã tồn tại.' });
    }
    res.status(500).json({ error: 'Lỗi cập nhật sản phẩm.' });
  }
});

admin.delete('/products/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    }
    await db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Đã xóa sản phẩm.' });
  } catch (err) {
    console.error('[Admin Delete Product]', err);
    res.status(500).json({ error: 'Lỗi xóa sản phẩm.' });
  }
});

// ─── Thêm, đọc, sửa, xóa danh mục trong trang quản trị ────────────────────────

admin.get('/categories', async (_req, res) => {
  try {
    const categories = await db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
    res.json(categories);
  } catch (err) {
    console.error('[Admin Categories]', err);
    res.status(500).json({ error: 'Lỗi tải danh mục.' });
  }
});

admin.get('/categories/:id', async (req, res) => {
  try {
    const category = await db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục.' });
    }
    res.json(category);
  } catch (err) {
    console.error('[Admin Category]', err);
    res.status(500).json({ error: 'Lỗi tải danh mục.' });
  }
});

admin.post('/categories', async (req, res) => {
  try {
    const { name, description, image, sort_order } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tên danh mục không được để trống.' });
    }

    const slug = generateSlug(name);
    const result = await db
      .prepare('INSERT INTO categories (name, slug, description, image, sort_order) VALUES (?, ?, ?, ?, ?) RETURNING id')
      .run(name.trim(), slug, (description || '').trim(), (image || '').trim(), sort_order || 0);

    const category = await db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(category);
  } catch (err) {
    console.error('[Admin Create Category]', err);
    if (isUniqueViolation(err)) {
      return res.status(400).json({ error: 'Danh mục với tên tương tự đã tồn tại.' });
    }
    res.status(500).json({ error: 'Lỗi tạo danh mục.' });
  }
});

admin.put('/categories/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục.' });
    }

    const { name, description, image, sort_order } = req.body;
    const updatedName = name ? name.trim() : existing.name;
    const slug = name ? generateSlug(updatedName) : existing.slug;

    await db.prepare(
      'UPDATE categories SET name = ?, slug = ?, description = ?, image = ?, sort_order = ? WHERE id = ?'
    ).run(
      updatedName,
      slug,
      description !== undefined ? description.trim() : existing.description,
      image !== undefined ? image.trim() : existing.image,
      sort_order !== undefined ? sort_order : existing.sort_order,
      req.params.id
    );

    const category = await db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json(category);
  } catch (err) {
    console.error('[Admin Update Category]', err);
    if (isUniqueViolation(err)) {
      return res.status(400).json({ error: 'Danh mục với tên tương tự đã tồn tại.' });
    }
    res.status(500).json({ error: 'Lỗi cập nhật danh mục.' });
  }
});

admin.delete('/categories/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục.' });
    }
    await db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Đã xóa danh mục.' });
  } catch (err) {
    console.error('[Admin Delete Category]', err);
    res.status(500).json({ error: 'Lỗi xóa danh mục.' });
  }
});

// ─── Thêm, đọc, sửa, xóa ảnh trình chiếu trong trang quản trị ─────────────────

admin.get('/hero-slides', async (_req, res) => {
  try {
    const slides = await db.prepare('SELECT * FROM hero_slides ORDER BY sort_order ASC').all();
    res.json(slides);
  } catch (err) {
    console.error('[Admin Slides]', err);
    res.status(500).json({ error: 'Lỗi tải slides.' });
  }
});

admin.get('/hero-slides/:id', async (req, res) => {
  try {
    const slide = await db.prepare('SELECT * FROM hero_slides WHERE id = ?').get(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: 'Không tìm thấy slide.' });
    }
    res.json(slide);
  } catch (err) {
    console.error('[Admin Slide]', err);
    res.status(500).json({ error: 'Lỗi tải slide.' });
  }
});

admin.post('/hero-slides', async (req, res) => {
  try {
    const { title, subtitle, image, button_text, button_link, sort_order, active } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Tiêu đề slide không được để trống.' });
    }

    const result = await db
      .prepare(
        `INSERT INTO hero_slides (title, subtitle, image, button_text, button_link, sort_order, active)
         VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`
      )
      .run(
        title.trim(),
        (subtitle || '').trim(),
        (image || '').trim(),
        (button_text || '').trim(),
        (button_link || '').trim(),
        sort_order || 0,
        active !== undefined ? (active ? 1 : 0) : 1
      );

    const slide = await db.prepare('SELECT * FROM hero_slides WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(slide);
  } catch (err) {
    console.error('[Admin Create Slide]', err);
    res.status(500).json({ error: 'Lỗi tạo slide.' });
  }
});

admin.put('/hero-slides/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM hero_slides WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy slide.' });
    }

    const { title, subtitle, image, button_text, button_link, sort_order, active } = req.body;

    await db.prepare(
      `UPDATE hero_slides SET
         title = ?, subtitle = ?, image = ?, button_text = ?,
         button_link = ?, sort_order = ?, active = ?
       WHERE id = ?`
    ).run(
      title !== undefined ? title.trim() : existing.title,
      subtitle !== undefined ? subtitle.trim() : existing.subtitle,
      image !== undefined ? image.trim() : existing.image,
      button_text !== undefined ? button_text.trim() : existing.button_text,
      button_link !== undefined ? button_link.trim() : existing.button_link,
      sort_order !== undefined ? sort_order : existing.sort_order,
      active !== undefined ? (active ? 1 : 0) : existing.active,
      req.params.id
    );

    const slide = await db.prepare('SELECT * FROM hero_slides WHERE id = ?').get(req.params.id);
    res.json(slide);
  } catch (err) {
    console.error('[Admin Update Slide]', err);
    res.status(500).json({ error: 'Lỗi cập nhật slide.' });
  }
});

admin.delete('/hero-slides/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM hero_slides WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy slide.' });
    }
    await db.prepare('DELETE FROM hero_slides WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Đã xóa slide.' });
  } catch (err) {
    console.error('[Admin Delete Slide]', err);
    res.status(500).json({ error: 'Lỗi xóa slide.' });
  }
});

// ─── Cài đặt trong trang quản trị ─────────────────────────────────────────────

admin.put('/settings', async (req, res) => {
  try {
    const settings = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Dữ liệu cài đặt không hợp lệ.' });
    }

    if (settings.companyName !== undefined && settings.company_name === undefined) {
      settings.company_name = settings.companyName;
    } else if (settings.company_name !== undefined && settings.companyName === undefined) {
      settings.companyName = settings.company_name;
    }
    if (settings.about !== undefined && settings.about_text === undefined) {
      settings.about_text = settings.about;
    } else if (settings.about_text !== undefined && settings.about === undefined) {
      settings.about = settings.about_text;
    }

    await db.transaction(async (query) => {
      for (const [key, value] of Object.entries(settings)) {
        await query(
          'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value',
          [key, String(value ?? '')]
        );
      }
    });

    // Trả về cài đặt vừa được cập nhật
    const rows = await db.prepare('SELECT key, value FROM settings').all();
    res.json(mergeSettings(rows));
  } catch (err) {
    console.error('[Admin Settings]', err);
    res.status(500).json({ error: 'Lỗi cập nhật cài đặt.' });
  }
});

// ─── Tin nhắn liên hệ trong trang quản trị ────────────────────────────────────

admin.get('/contacts', async (req, res) => {
  try {
    const { unread } = req.query;
    let sql = 'SELECT * FROM contacts';
    const params = [];

    if (unread === '1' || unread === 'true') {
      sql += ' WHERE "read" = 0';
    }
    sql += ' ORDER BY created_at DESC';

    const contacts = await db.prepare(sql).all(...params);
    res.json(contacts);
  } catch (err) {
    console.error('[Admin Contacts]', err);
    res.status(500).json({ error: 'Lỗi tải danh sách liên hệ.' });
  }
});

admin.put('/contacts/:id/read', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy liên hệ.' });
    }
    await db.prepare('UPDATE contacts SET "read" = 1 WHERE id = ?').run(req.params.id);
    const contact = await db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    res.json(contact);
  } catch (err) {
    console.error('[Admin Mark Read]', err);
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái.' });
  }
});

admin.delete('/contacts/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Không tìm thấy liên hệ.' });
    }
    await db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Đã xóa liên hệ.' });
  } catch (err) {
    console.error('[Admin Delete Contact]', err);
    res.status(500).json({ error: 'Lỗi xóa liên hệ.' });
  }
});

// Gắn router quản trị
app.use('/api/admin', admin);
app.use('/api', admin);

// ─── Bộ xử lý lỗi Multer ──────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File quá lớn. Tối đa 5MB.' });
    }
    return res.status(400).json({ error: `Lỗi upload: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message || 'Đã xảy ra lỗi.' });
  }
  next();
});

// ─── Xử lý route API không tồn tại (404) ──────────────────────────────────────

app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint không tồn tại.' });
});

// ─── Khởi động máy chủ ────────────────────────────────────────────────────────

async function startServer() {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with a unique value of at least 32 characters.');
  }

  await db.initializeDatabase();
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   Phào Chỉ Việt - Server đang chạy           ║
║   http://localhost:${PORT}                   ║
╚══════════════════════════════════════════════╝
  `);
  });
}

if (require.main === module) {
  startServer().catch(async (err) => {
    console.error('[Startup] Không thể khởi động server:', err);
    await db.pool.end();
    process.exitCode = 1;
  });
}

module.exports = app;
