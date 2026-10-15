import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { seedLegalPages } from "./legal-pages-seed";

const DB_PATH = path.join(process.cwd(), "data", "mokova.db");

let _dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_dbInstance) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    _dbInstance = new DatabaseSync(DB_PATH);
    try {
      _dbInstance.exec("PRAGMA journal_mode = WAL;");
      _dbInstance.exec("PRAGMA busy_timeout = 30000;");
      _dbInstance.exec("PRAGMA synchronous = NORMAL;");
    } catch (e) {}
    initSchemaAndSeed(_dbInstance);
  }
  return _dbInstance;
}

function initSchemaAndSeed(db: DatabaseSync) {
  // 1. Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT,
      category_ids TEXT,
      price TEXT,
      reference_price INTEGER DEFAULT 0,
      min_offer_floor INTEGER DEFAULT 0,
      pricing_model TEXT DEFAULT 'FIXED_OR_HAGGLE',
      image TEXT,
      gallery TEXT,
      description TEXT,
      full_overview TEXT,
      sku TEXT,
      dimensions TEXT,
      material TEXT,
      weight TEXT,
      layer_height TEXT,
      infill TEXT,
      print_time TEXT,
      model_3d_path TEXT,
      model_3d_type TEXT,
      featured INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      src TEXT NOT NULL,
      title TEXT,
      category_id TEXT,
      tag TEXT,
      active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      author_name TEXT NOT NULL,
      location TEXT,
      rating INTEGER DEFAULT 5,
      comment TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      product_id TEXT,
      product_name TEXT,
      proposed_price INTEGER,
      quantity INTEGER DEFAULT 1,
      buyer_name TEXT,
      buyer_phone TEXT,
      rationale TEXT,
      status TEXT DEFAULT 'NEW',
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      email_verified INTEGER DEFAULT 0,
      mfa_enabled INTEGER DEFAULT 0,
      mfa_secret TEXT,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      mfa_verified INTEGER DEFAULT 1,
      ip_address TEXT,
      user_agent TEXT,
      expires_at TEXT NOT NULL,
      revoked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details_json TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS seller_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      store_name TEXT NOT NULL,
      bio TEXT,
      payout_upi TEXT,
      verified INTEGER DEFAULT 0,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT DEFAULT (datetime('now'))
    );

        CREATE TABLE IF NOT EXISTS admin_auth (
      id TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      session_token TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      title TEXT NOT NULL,
      sale_price INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      badge TEXT DEFAULT 'FLASH SALE',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS homepage_sections (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      layout_type TEXT DEFAULT 'standard',
      sort_order INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      config_json TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS feature_flags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      enabled INTEGER DEFAULT 0,
      is_implemented INTEGER DEFAULT 0,
      config_json TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pages (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      summary TEXT,
      content_html TEXT NOT NULL,
      published INTEGER DEFAULT 1,
      last_updated TEXT DEFAULT (datetime('now')),
      version INTEGER DEFAULT 1,
      legal_review_flagged INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS page_revisions (
      id TEXT PRIMARY KEY,
      page_slug TEXT NOT NULL,
      version INTEGER NOT NULL,
      title TEXT NOT NULL,
      content_html TEXT NOT NULL,
      author TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now')),
      note TEXT
    );
  `);

  // Migrate products table columns if missing
  try {
    db.exec("ALTER TABLE products ADD COLUMN view_count INTEGER DEFAULT 0;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE products ADD COLUMN created_at TEXT DEFAULT '2026-10-11T12:00:00Z';");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE admin_auth ADD COLUMN salt TEXT;");
  } catch (e) {}

  // Performance Indexes for high-frequency queries
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_active_cat ON products(active, category_id);
      CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order, featured);
      CREATE INDEX IF NOT EXISTS idx_reviews_product_active ON reviews(product_id, active);
      CREATE INDEX IF NOT EXISTS idx_inquiries_product ON inquiries(product_id);
      CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active, start_time, end_time);
      CREATE INDEX IF NOT EXISTS idx_gallery_active_cat ON gallery(active, category_id);
      CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active, sort_order);
    `);
  } catch (e) {}


  // 2. Check if admin credentials exist
  const adminRow = db.prepare("SELECT * FROM admin_auth WHERE id = 'admin'").get();
  if (!adminRow) {
    db.prepare(`
      INSERT INTO admin_auth (id, password_hash, updated_at)
      VALUES ('admin', 'Mokova@1234', datetime('now'))
    `).run();
  }

  // 2b. Provision Initial Superadmin securely if not exists
  const crypto = require("node:crypto");
  const superadminRow = db.prepare("SELECT * FROM users WHERE role = 'superadmin'").get();
  if (!superadminRow) {
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto.scryptSync("Mokova@SuperAdmin2026!", salt, 64).toString("hex");
    db.prepare(`
      INSERT INTO users (id, email, name, role, password_hash, salt, email_verified, mfa_enabled, created_at, updated_at)
      VALUES ('user-superadmin-01', 'superadmin@mokova3d.com', 'Mokova3D Master Admin', 'superadmin', ?, ?, 1, 1, datetime('now'), datetime('now'))
    `).run(passwordHash, salt);
  }


  // 3. Seed site_config if empty
  const configCount = (db.prepare("SELECT count(*) as count FROM site_config").get() as any)?.count || 0;
  if (configCount === 0) {
    const defaultConfigs: Record<string, string> = {
      siteName: "Mokova3D",
      tagline: "Custom 3D printing, creative décor, gifts and more.",
      whatsapp: "918527373680",
      instagram: "https://instagram.com/mokova3d",
      heroEyebrow: "MOKOVA3D · DELHI & NCR",
      heroTitle: "Made for people who like different.",
      heroSubtitle: "3D printed décor, gifts, collectibles and custom creations crafted in Delhi.",
      announcement: "Custom orders available — send your idea, sketch or STL on WhatsApp.",
      showAnnouncement: "true",
      deliveryArea: "Delhi & NCR · Local Pickup & Pan-India Courier",
      currency: "INR",
    };

    const insertConfig = db.prepare("INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)");
    for (const [k, v] of Object.entries(defaultConfigs)) {
      insertConfig.run(k, v);
    }
  }

  // 4. Seed categories if empty
  const catCount = (db.prepare("SELECT count(*) as count FROM categories").get() as any)?.count || 0;
  if (catCount === 0) {
    const catFile = path.join(process.cwd(), "src", "data", "categories.json");
    if (fs.existsSync(catFile)) {
      const data = JSON.parse(fs.readFileSync(catFile, "utf8"));
      const insertCat = db.prepare(`
        INSERT OR IGNORE INTO categories (id, name, description, image, sort_order, active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const c of data.categories || []) {
        const imagePath = c.image?.startsWith("/") ? c.image : `/${c.image}`;
        insertCat.run(c.id, c.name, c.description, imagePath, c.sortOrder || 0, c.active ? 1 : 0);
      }
    }
  }

  // 5. Seed products if empty
  const prodCount = (db.prepare("SELECT count(*) as count FROM products").get() as any)?.count || 0;
  if (prodCount === 0) {
    const prodFile = path.join(process.cwd(), "src", "data", "products.json");
    if (fs.existsSync(prodFile)) {
      const data = JSON.parse(fs.readFileSync(prodFile, "utf8"));
      const insertProd = db.prepare(`
        INSERT OR IGNORE INTO products (
          id, name, category_id, category_ids, price, reference_price, min_offer_floor,
          pricing_model, image, gallery, description, full_overview, sku,
          dimensions, material, weight, layer_height, infill, print_time,
          model_3d_path, model_3d_type, featured, active, sort_order
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
      `);

      for (const p of data.products || []) {
        const imagePath = p.image?.startsWith("/") ? p.image : `/${p.image}`;
        const galleryPaths = (p.gallery || []).map((g: string) => (g.startsWith("/") ? g : `/${g}`));
        const refPrice = parseInt(String(p.price || "").replace(/[^0-9]/g, ""), 10) || 499;
        const minFloor = Math.round(refPrice * 0.8);
        const pricingModel = p.price?.includes("₹") ? "FIXED_OR_HAGGLE" : "ASK_WHATSAPP";

        insertProd.run(
          p.id,
          p.name,
          p.categoryId || "home-decor",
          JSON.stringify(p.categoryIds || [p.categoryId || "home-decor"]),
          p.price || "Ask on WhatsApp",
          refPrice,
          minFloor,
          pricingModel,
          imagePath,
          JSON.stringify(galleryPaths),
          p.description || "",
          `Engineered and 3D printed with precision at Mokova3D. Features tuned layer lines, robust durability and custom color finishing.`,
          p.sku || `MKV-${p.id.toUpperCase()}`,
          p.dimensions || "90 × 80 × 120 mm",
          p.material || "Premium Matte Non-Toxic PLA",
          p.weight || "110g",
          "0.16 mm",
          "20%",
          "5.5 Hours",
          `/models/${p.id}.glb`,
          p.id,
          p.featured ? 1 : 0,
          p.active ? 1 : 0,
          p.sortOrder || 0
        );
      }
    }
  }

  // 6. Seed gallery if empty
  const galleryCount = (db.prepare("SELECT count(*) as count FROM gallery").get() as any)?.count || 0;
  if (galleryCount === 0) {
    const galleryFile = path.join(process.cwd(), "src", "data", "gallery.json");
    if (fs.existsSync(galleryFile)) {
      const data = JSON.parse(fs.readFileSync(galleryFile, "utf8"));
      const insertGal = db.prepare(`
        INSERT OR IGNORE INTO gallery (id, src, title, category_id, tag, active, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      let idx = 0;
      for (const item of data.items || []) {
        idx++;
        const rawSrc = item.src || item.image || "";
        const srcPath = rawSrc.startsWith("/") ? rawSrc : `/${rawSrc}`;
        insertGal.run(
          `gal-${idx}`,
          srcPath,
          item.title || "Custom 3D Print",
          item.categoryId || "home-decor",
          item.tag || "Client Print",
          item.active ? 1 : 0,
          item.sortOrder || idx
        );
      }
    }
  }

  // 7. Seed FAQs if empty
  const faqCount = (db.prepare("SELECT count(*) as count FROM faqs").get() as any)?.count || 0;
  if (faqCount === 0) {
    const faqFile = path.join(process.cwd(), "src", "data", "faq.json");
    if (fs.existsSync(faqFile)) {
      const data = JSON.parse(fs.readFileSync(faqFile, "utf8"));
      const insertFaq = db.prepare(`
        INSERT OR IGNORE INTO faqs (id, question, answer, active, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `);
      let idx = 0;
      for (const item of data.items || []) {
        idx++;
        insertFaq.run(
          item.id || `faq-${idx}`,
          item.question,
          item.answer,
          item.active ? 1 : 0,
          idx
        );
      }
    }
  }

  // 8. Seed reviews or repair if existing reviews have active = 0 or placeholder authors
  const activeRevCount = (db.prepare("SELECT count(*) as count FROM reviews WHERE active = 1").get() as any)?.count || 0;
  if (activeRevCount === 0) {
    try {
      db.prepare("DELETE FROM reviews").run();
    } catch (e) {}
    const revFile = path.join(process.cwd(), "src", "data", "reviews.json");
    if (fs.existsSync(revFile)) {
      const data = JSON.parse(fs.readFileSync(revFile, "utf8"));
      const insertRev = db.prepare(`
        INSERT OR REPLACE INTO reviews (id, product_id, author_name, location, rating, comment, active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      let idx = 0;
      for (const item of data.reviews || []) {
        idx++;
        insertRev.run(
          item.id || `rev-${idx}`,
          item.productId || "cat",
          item.name || item.authorName || item.customerName || "Verified Buyer",
          item.location || (idx % 3 === 0 ? "South Delhi" : idx % 3 === 1 ? "Noida Sector 62" : "Gurugram Cyber City"),
          item.rating || 5,
          item.comment || "Great 3D print and finish!",
          item.visible !== false ? 1 : 0,
          item.createdAt || new Date(Date.now() - (idx * 86400000 * 2)).toISOString()
        );
      }
    }
  }

  // 9. Seed homepage_sections if empty
  const secCount = (db.prepare("SELECT count(*) as count FROM homepage_sections").get() as any)?.count || 0;
  if (secCount === 0) {
    const defaultSections = [
      {
        id: "hero",
        title: "Signature Studio Build-Bed",
        subtitle: "Interactive WebGL Heated Bed & Metrology Station",
        layout_type: "interactive_bed",
        sort_order: 1,
        enabled: 1,
      },
      {
        id: "promotions",
        title: "Studio Batch Flash Allocations",
        subtitle: "Verified limited-time promotional pricing direct from our Delhi studio run",
        layout_type: "countdown_grid",
        sort_order: 2,
        enabled: 1,
      },
      {
        id: "curated_collections",
        title: "Atelier Curated Collections",
        subtitle: "Editorial groupings by functional utility, ambient lighting, and spiritual iconography",
        layout_type: "asymmetric_bento",
        sort_order: 3,
        enabled: 1,
      },
      {
        id: "trending",
        title: "Trending & High-Engagement Prints",
        subtitle: "Ranked by verified buyer inquiries, offers, and studio view metrics",
        layout_type: "ranked_metrics",
        sort_order: 4,
        enabled: 1,
      },
      {
        id: "new_arrivals",
        title: "Recent Studio Batch Releases",
        subtitle: "Freshly calibrated physical models with layer specs and immediate Delhi NCR dispatch",
        layout_type: "annotated_showcase",
        sort_order: 5,
        enabled: 1,
      },
      {
        id: "recommendations",
        title: "Engineered Discovery Matrix",
        subtitle: "Parametric recommendations based on material compatibility and use case",
        layout_type: "smart_matrix",
        sort_order: 6,
        enabled: 1,
      },
      {
        id: "recently_viewed",
        title: "Your Active Inspection Trail",
        subtitle: "Privacy-conscious continuation of your desktop and mobile browsing session",
        layout_type: "horizontal_filmstrip",
        sort_order: 7,
        enabled: 1,
      },
      {
        id: "price_discovery",
        title: "Bilateral Price Discovery Desk",
        subtitle: "Submit custom unit offers with real-time variance calculations against seller floor safeguards",
        layout_type: "interactive_haggle_dock",
        sort_order: 8,
        enabled: 1,
      },
      {
        id: "trust_process",
        title: "Studio Craft & Quality Guarantee",
        subtitle: "From sub-millimeter watertight slicing to local Delhi NCR delivery and pan-India courier",
        layout_type: "process_timeline",
        sort_order: 9,
        enabled: 1,
      },
      {
        id: "final_cta",
        title: "Custom 3D Printing & Bespoke Slicing",
        subtitle: "Have an STL, OBJ or napkin sketch? Launch our WebGL Custom 3D Print Studio",
        layout_type: "studio_action_band",
        sort_order: 10,
        enabled: 1,
      },
    ];

    const insSec = db.prepare(`
      INSERT OR REPLACE INTO homepage_sections (id, title, subtitle, layout_type, sort_order, enabled, config_json)
      VALUES (?, ?, ?, ?, ?, ?, '{}')
    `);

    for (const s of defaultSections) {
      insSec.run(s.id, s.title, s.subtitle, s.layout_type, s.sort_order, s.enabled);
    }
  }

  // 10. Seed promotions if empty or expired
  const activePromoCount = (db.prepare(`
    SELECT count(*) as count FROM promotions
    WHERE active = 1 AND datetime('now') <= datetime(end_time)
  `).get() as any)?.count || 0;

  if (activePromoCount === 0) {
    const now = new Date();
    const startTime = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
    const endTime = new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString();
    const endTime2 = new Date(now.getTime() + 21 * 24 * 3600 * 1000).toISOString();

    const insPromo = db.prepare(`
      INSERT OR REPLACE INTO promotions (id, product_id, title, sale_price, start_time, end_time, badge, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    // Cat desk companion sale (regular 299 -> 249)
    insPromo.run(
      "promo-cat-batch",
      "cat",
      "Weekend Desktop Duo Flash Batch",
      249,
      startTime,
      endTime,
      "LIMITED BATCH SALE"
    );

    // Lamp sale (regular 799 -> 699)
    insPromo.run(
      "promo-lamp-studio",
      "lamp",
      "Ambient Silhouette Lamp Early Run",
      699,
      startTime,
      endTime2,
      "STUDIO RUN PROMO"
    );
  }

  // 11. Seed feature_flags if empty
  const flagsCount = (db.prepare("SELECT count(*) as count FROM feature_flags").get() as any)?.count || 0;
  if (flagsCount === 0) {
    const defaultFlags = [
      {
        id: "feature_3d_renderer",
        name: "Browser-based 3D Model Renderer",
        description: "Interactive client-side WebGL 3D model viewer supporting local STL, OBJ, and GLB files with orbit, pan, measurement, and shader inspection.",
        category: "3D Graphics & Engine",
        enabled: 1,
        is_implemented: 1,
      },
      {
        id: "feature_flash_sales",
        name: "Flash Sales & Batch Promotions",
        description: "Promotional pricing engine with authoritative countdown timers and scheduled release windows.",
        category: "Commerce & Promotions",
        enabled: 1,
        is_implemented: 1,
      },
      {
        id: "feature_price_negotiation",
        name: "Bilateral Price Negotiation Desk",
        description: "Interactive counter-offer calculator with floor safeguards and direct WhatsApp dispatch.",
        category: "Commerce & Promotions",
        enabled: 1,
        is_implemented: 1,
      },
      {
        id: "feature_physical_printing_marketplace",
        name: "Physical 3D Printing Marketplace",
        description: "Studio catalog showcasing physical 3D printed products with local Delhi NCR delivery.",
        category: "Commerce & Promotions",
        enabled: 1,
        is_implemented: 1,
      },
      {
        id: "feature_ai_recommendations",
        name: "AI-Powered Product Recommendations",
        description: "Machine-learning product discovery predicting buyer affinity from inspection telemetry.",
        category: "AI & Intelligence",
        enabled: 0,
        is_implemented: 0,
      },
      {
        id: "feature_browser_llm",
        name: "Browser-Based Small LLM",
        description: "On-device WebGPU small language model assisting with 3D print advice and slicing prompts.",
        category: "AI & Intelligence",
        enabled: 0,
        is_implemented: 0,
      },
      {
        id: "feature_user_uploads_library",
        name: "User Model Uploads & Personal Library",
        description: "Cloud-synced private user library storing personal CAD files, slices, and asset collections.",
        category: "Community & User Platform",
        enabled: 0,
        is_implemented: 0,
      },
      {
        id: "feature_user_marketplace_listings",
        name: "User-Created Marketplace Listings",
        description: "Community creator portal enabling verified makers to list and monetize physical or digital designs.",
        category: "Community & User Platform",
        enabled: 0,
        is_implemented: 0,
      },
      {
        id: "feature_digital_downloads",
        name: "Digital Model Sales & Downloads",
        description: "Secure digital checkout enabling paid downloads of verified print-ready STL, OBJ, and 3MF files.",
        category: "Digital Commerce",
        enabled: 0,
        is_implemented: 0,
      },
      {
        id: "feature_advanced_analysis",
        name: "Advanced Model Analysis & Editing",
        description: "Automated wall-thickness checks, overhang stress analysis, hollow infill generators, and mesh healing.",
        category: "3D Graphics & Engine",
        enabled: 0,
        is_implemented: 0,
      },
    ];

    const insFlag = db.prepare(`
      INSERT OR REPLACE INTO feature_flags (id, name, description, category, enabled, is_implemented, config_json)
      VALUES (?, ?, ?, ?, ?, ?, '{}')
    `);

    for (const f of defaultFlags) {
      insFlag.run(f.id, f.name, f.description, f.category, f.enabled, f.is_implemented);
    }
  }

  // 12. Seed pages & legal documents
  seedLegalPages(db);
}
