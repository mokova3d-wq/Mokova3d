import { getDb } from "./db";
import { cacheGet, cacheSet, cacheInvalidate } from "./cache";
import crypto from "node:crypto";

export interface DbProduct {
  id: string;
  name: string;
  category_id: string;
  category_ids: string;
  price: string;
  reference_price: number;
  min_offer_floor: number;
  pricing_model: string;
  image: string;
  gallery: string;
  description: string;
  full_overview: string;
  sku: string;
  dimensions: string;
  material: string;
  weight: string;
  layer_height: string;
  infill: string;
  print_time: string;
  model_3d_path?: string;
  model_3d_type?: string;
  featured: number;
  active: number;
  sort_order: number;
}

export interface DbCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  sort_order: number;
  active: number;
}

export interface DbFaq {
  id: string;
  question: string;
  answer: string;
  active: number;
  sort_order: number;
}

export interface DbGallery {
  id: string;
  src: string;
  title: string;
  category_id: string;
  tag: string;
  active: number;
  sort_order: number;
}

export interface DbInquiry {
  id: string;
  type: string;
  product_id: string;
  product_name: string;
  proposed_price: number;
  quantity: number;
  buyer_name: string;
  buyer_phone: string;
  rationale: string;
  status: string;
  created_at: string;
}

export interface DbReview {
  id: string;
  product_id: string;
  author_name: string;
  location: string;
  rating: number;
  comment: string;
  active: number;
  created_at: string;
}

export interface ReviewStats {
  reviews: DbReview[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

// ---------------- PRODUCTS ----------------
export function getProducts(categoryId?: string, activeOnly = true): DbProduct[] {
  const cacheKey = `products_${categoryId || "all"}_${activeOnly ? "active" : "all"}`;
  const cached = cacheGet<DbProduct[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  let query = "SELECT * FROM products";
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (activeOnly) {
    whereClauses.push("active = 1");
  }
  if (categoryId && categoryId !== "all") {
    whereClauses.push("(category_id = ? OR category_ids LIKE ?)");
    params.push(categoryId, `%"${categoryId}"%`);
  }

  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }

  query += " ORDER BY sort_order ASC, name ASC";

  const rows = db.prepare(query).all(...params) as unknown as DbProduct[];
  cacheSet(cacheKey, rows, 30);
  return rows;
}

export function getProductById(id: string): DbProduct | null {
  const cacheKey = `product_${id}`;
  const cached = cacheGet<DbProduct>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as unknown as DbProduct | undefined;
  if (row) {
    cacheSet(cacheKey, row, 30);
    return row;
  }
  return null;
}

export function upsertProduct(product: Partial<DbProduct>): void {
  const db = getDb();
  const p = {
    id: product.id || `prod-${Date.now()}`,
    name: product.name || "Untitled Product",
    category_id: product.category_id || "home-decor",
    category_ids: product.category_ids || JSON.stringify([product.category_id || "home-decor"]),
    price: product.price || "Ask on WhatsApp",
    reference_price: product.reference_price || 0,
    min_offer_floor: product.min_offer_floor || 0,
    pricing_model: product.pricing_model || "FIXED_OR_HAGGLE",
    image: product.image || "/assets/products/cat.jpg",
    gallery: product.gallery || "[]",
    description: product.description || "",
    full_overview: product.full_overview || "",
    sku: product.sku || `MKV-${(product.id || "").toUpperCase()}`,
    dimensions: product.dimensions || "90 × 80 × 120 mm",
    material: product.material || "PLA Matte",
    weight: product.weight || "100g",
    layer_height: product.layer_height || "0.16 mm",
    infill: product.infill || "20%",
    print_time: product.print_time || "4 Hours",
    model_3d_path: product.model_3d_path || "",
    model_3d_type: product.model_3d_type || "default",
    featured: product.featured !== undefined ? product.featured : 0,
    active: product.active !== undefined ? product.active : 1,
    sort_order: product.sort_order || 0,
  };

  db.prepare(`
    INSERT INTO products (
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
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      category_id=excluded.category_id,
      category_ids=excluded.category_ids,
      price=excluded.price,
      reference_price=excluded.reference_price,
      min_offer_floor=excluded.min_offer_floor,
      pricing_model=excluded.pricing_model,
      image=excluded.image,
      gallery=excluded.gallery,
      description=excluded.description,
      full_overview=excluded.full_overview,
      sku=excluded.sku,
      dimensions=excluded.dimensions,
      material=excluded.material,
      weight=excluded.weight,
      layer_height=excluded.layer_height,
      infill=excluded.infill,
      print_time=excluded.print_time,
      model_3d_path=excluded.model_3d_path,
      model_3d_type=excluded.model_3d_type,
      featured=excluded.featured,
      active=excluded.active,
      sort_order=excluded.sort_order
  `).run(
    p.id, p.name, p.category_id, p.category_ids, p.price, p.reference_price, p.min_offer_floor,
    p.pricing_model, p.image, p.gallery, p.description, p.full_overview, p.sku,
    p.dimensions, p.material, p.weight, p.layer_height, p.infill, p.print_time,
    p.model_3d_path, p.model_3d_type, p.featured, p.active, p.sort_order
  );

  cacheInvalidate("products_");
  cacheInvalidate(`product_${p.id}`);
}

export function deleteProduct(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  cacheInvalidate("products_");
  cacheInvalidate(`product_${id}`);
}

// ---------------- CATEGORIES ----------------
export function getCategories(activeOnly = true): DbCategory[] {
  const cacheKey = `categories_${activeOnly ? "active" : "all"}`;
  const cached = cacheGet<DbCategory[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const query = activeOnly
    ? "SELECT * FROM categories WHERE active = 1 ORDER BY sort_order ASC, name ASC"
    : "SELECT * FROM categories ORDER BY sort_order ASC, name ASC";

  const rows = db.prepare(query).all() as unknown as DbCategory[];
  cacheSet(cacheKey, rows, 60);
  return rows;
}

export function upsertCategory(cat: Partial<DbCategory>): void {
  const db = getDb();
  const c = {
    id: cat.id || `cat-${Date.now()}`,
    name: cat.name || "New Category",
    description: cat.description || "",
    image: cat.image || "/assets/hero.jpg",
    sort_order: cat.sort_order || 0,
    active: cat.active !== undefined ? cat.active : 1,
  };

  db.prepare(`
    INSERT INTO categories (id, name, description, image, sort_order, active)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      description=excluded.description,
      image=excluded.image,
      sort_order=excluded.sort_order,
      active=excluded.active
  `).run(c.id, c.name, c.description, c.image, c.sort_order, c.active);

  cacheInvalidate("categories_");
}

export function deleteCategory(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  cacheInvalidate("categories_");
}

// ---------------- GALLERY ----------------
export function getGalleryItems(categoryId?: string, activeOnly = true): DbGallery[] {
  const cacheKey = `gallery_${categoryId || "all"}_${activeOnly ? "active" : "all"}`;
  const cached = cacheGet<DbGallery[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  let query = "SELECT * FROM gallery";
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (activeOnly) {
    whereClauses.push("active = 1");
  }
  if (categoryId && categoryId !== "ALL") {
    whereClauses.push("(category_id = ? OR tag LIKE ?)");
    params.push(categoryId, `%${categoryId}%`);
  }

  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }

  query += " ORDER BY sort_order ASC";

  const rows = db.prepare(query).all(...params) as unknown as DbGallery[];
  cacheSet(cacheKey, rows, 60);
  return rows;
}

export function upsertGalleryItem(item: Partial<DbGallery>): void {
  const db = getDb();
  const g = {
    id: item.id || `gal-${Date.now()}`,
    src: item.src || "/assets/hero.jpg",
    title: item.title || "Custom 3D Print",
    category_id: item.category_id || "home-decor",
    tag: item.tag || "Client Print",
    active: item.active !== undefined ? item.active : 1,
    sort_order: item.sort_order || 0,
  };

  db.prepare(`
    INSERT INTO gallery (id, src, title, category_id, tag, active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      src=excluded.src,
      title=excluded.title,
      category_id=excluded.category_id,
      tag=excluded.tag,
      active=excluded.active,
      sort_order=excluded.sort_order
  `).run(g.id, g.src, g.title, g.category_id, g.tag, g.active, g.sort_order);

  cacheInvalidate("gallery_");
}

export function deleteGalleryItem(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM gallery WHERE id = ?").run(id);
  cacheInvalidate("gallery_");
}

// ---------------- FAQS ----------------
export function getFaqs(activeOnly = true): DbFaq[] {
  const cacheKey = `faqs_${activeOnly ? "active" : "all"}`;
  const cached = cacheGet<DbFaq[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const query = activeOnly
    ? "SELECT * FROM faqs WHERE active = 1 ORDER BY sort_order ASC"
    : "SELECT * FROM faqs ORDER BY sort_order ASC";

  const rows = db.prepare(query).all() as unknown as DbFaq[];
  cacheSet(cacheKey, rows, 60);
  return rows;
}

export function upsertFaq(faq: Partial<DbFaq>): void {
  const db = getDb();
  const f = {
    id: faq.id || `faq-${Date.now()}`,
    question: faq.question || "",
    answer: faq.answer || "",
    active: faq.active !== undefined ? faq.active : 1,
    sort_order: faq.sort_order || 0,
  };

  db.prepare(`
    INSERT INTO faqs (id, question, answer, active, sort_order)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      question=excluded.question,
      answer=excluded.answer,
      active=excluded.active,
      sort_order=excluded.sort_order
  `).run(f.id, f.question, f.answer, f.active, f.sort_order);

  cacheInvalidate("faqs_");
}

export function deleteFaq(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM faqs WHERE id = ?").run(id);
  cacheInvalidate("faqs_");
}

// ---------------- SITE CONFIG ----------------
export function getSiteConfig(): Record<string, string> {
  const cacheKey = "site_config";
  const cached = cacheGet<Record<string, string>>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM site_config").all() as any[];
  const config: Record<string, string> = {};
  for (const r of rows) {
    config[r.key] = r.value;
  }
  cacheSet(cacheKey, config, 60);
  return config;
}

export function setSiteConfig(key: string, value: string): void {
  const db = getDb();
  db.prepare("INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)").run(key, value);
  cacheInvalidate("site_config");
}

// ---------------- INQUIRIES ----------------
export function getInquiries(): DbInquiry[] {
  const db = getDb();
  return db.prepare("SELECT * FROM inquiries ORDER BY created_at DESC").all() as unknown as DbInquiry[];
}

export function recordInquiry(inquiry: Partial<DbInquiry>): string {
  const db = getDb();
  const id = inquiry.id || `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  db.prepare(`
    INSERT INTO inquiries (
      id, type, product_id, product_name, proposed_price, quantity,
      buyer_name, buyer_phone, rationale, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    id,
    inquiry.type || "OFFER",
    inquiry.product_id || "",
    inquiry.product_name || "",
    inquiry.proposed_price || 0,
    inquiry.quantity || 1,
    inquiry.buyer_name || "",
    inquiry.buyer_phone || "",
    inquiry.rationale || "",
    inquiry.status || "NEW"
  );
  return id;
}

export function updateInquiryStatus(id: string, status: string): void {
  const db = getDb();
  db.prepare("UPDATE inquiries SET status = ? WHERE id = ?").run(status, id);
}

// ---------------- AUTHENTICATION ----------------
export function verifyAdminPassword(password: string): boolean {
  const db = getDb();
  const row = db.prepare("SELECT password_hash, salt FROM admin_auth WHERE id = 'admin'").get() as any;
  if (!row) return false;

  if (row.salt) {
    try {
      const computed = crypto.scryptSync(password, row.salt, 64).toString("hex");
      return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(row.password_hash, "hex"));
    } catch {
      return false;
    }
  }

  // Legacy plaintext fallback: verify, and immediately upgrade to salt + scrypt hash
  if (row.password_hash === password) {
    try {
      updateAdminPassword(password);
    } catch (_) {}
    return true;
  }
  return false;
}

export function updateAdminPassword(newPassword: string): void {
  const db = getDb();
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(newPassword, salt, 64).toString("hex");
  db.prepare("UPDATE admin_auth SET password_hash = ?, salt = ?, updated_at = datetime('now') WHERE id = 'admin'").run(hash, salt);
}

export function createAdminSession(): string {
  const token = crypto.randomBytes(32).toString("hex");
  const db = getDb();
  db.prepare("UPDATE admin_auth SET session_token = ? WHERE id = 'admin'").run(token);
  return token;
}

export function verifyAdminSession(token: string): boolean {
  if (!token) return false;
  const db = getDb();
  const row = db.prepare("SELECT session_token FROM admin_auth WHERE id = 'admin'").get() as any;
  if (!row) return false;
  return row.session_token === token;
}

export interface DbPromotion {
  id: string;
  product_id: string;
  title: string;
  sale_price: number;
  start_time: string;
  end_time: string;
  badge: string;
  active: number;
  created_at: string;
  product?: DbProduct;
}

export interface DbHomepageSection {
  id: string;
  title: string;
  subtitle: string;
  layout_type: string;
  sort_order: number;
  enabled: number;
  config_json: string;
}

// ---------------- HOMEPAGE SECTIONS ----------------
export function getHomepageSections(): DbHomepageSection[] {
  const cacheKey = "homepage_sections";
  const cached = cacheGet<DbHomepageSection[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const rows = db.prepare("SELECT * FROM homepage_sections ORDER BY sort_order ASC").all() as unknown as DbHomepageSection[];
  cacheSet(cacheKey, rows, 60);
  return rows;
}

export function upsertHomepageSection(sec: Partial<DbHomepageSection>): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO homepage_sections (id, title, subtitle, layout_type, sort_order, enabled, config_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title,
      subtitle=excluded.subtitle,
      layout_type=excluded.layout_type,
      sort_order=excluded.sort_order,
      enabled=excluded.enabled,
      config_json=excluded.config_json
  `).run(
    sec.id || "",
    sec.title || "Section",
    sec.subtitle || "",
    sec.layout_type || "standard",
    sec.sort_order || 0,
    sec.enabled !== undefined ? sec.enabled : 1,
    sec.config_json || "{}"
  );
  cacheInvalidate("homepage_sections");
}

// ---------------- PROMOTIONS ----------------
export function getPromotions(activeOnly = true): DbPromotion[] {
  const cacheKey = `promotions_${activeOnly ? "active" : "all"}`;
  const cached = cacheGet<DbPromotion[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  let query = `
    SELECT pr.*, p.name as prod_name, p.image as prod_image, p.price as prod_price,
           p.reference_price as prod_ref_price, p.category_id as prod_category_id,
           p.description as prod_desc, p.sku as prod_sku, p.dimensions as prod_dimensions,
           p.material as prod_material
    FROM promotions pr
    JOIN products p ON pr.product_id = p.id
  `;

  if (activeOnly) {
    // Valid time window and active flag; sale_price must be strictly lower than regular price
    query += ` WHERE pr.active = 1
               AND datetime('now') >= datetime(pr.start_time)
               AND datetime('now') <= datetime(pr.end_time)
               AND pr.sale_price < p.reference_price `;
  }

  query += " ORDER BY pr.end_time ASC";

  const rows = db.prepare(query).all() as any[];
  const mapped: DbPromotion[] = rows.map((r) => ({
    id: r.id,
    product_id: r.product_id,
    title: r.title,
    sale_price: r.sale_price,
    start_time: r.start_time,
    end_time: r.end_time,
    badge: r.badge,
    active: r.active,
    created_at: r.created_at,
    product: {
      id: r.product_id,
      name: r.prod_name,
      category_id: r.prod_category_id,
      category_ids: JSON.stringify([r.prod_category_id]),
      price: r.prod_price,
      reference_price: r.prod_ref_price,
      min_offer_floor: Math.round(r.prod_ref_price * 0.8),
      pricing_model: "FIXED_OR_HAGGLE",
      image: r.prod_image,
      gallery: JSON.stringify([r.prod_image]),
      description: r.prod_desc || "",
      full_overview: "",
      sku: r.prod_sku,
      dimensions: r.prod_dimensions || "90 ? 80 ? 120 mm",
      material: r.prod_material || "PLA Matte",
      weight: "100g",
      layer_height: "0.16 mm",
      infill: "20%",
      print_time: "5 Hours",
      featured: 1,
      active: 1,
      sort_order: 0,
    },
  }));

  cacheSet(cacheKey, mapped, 30);
  return mapped;
}

export function upsertPromotion(promo: Partial<DbPromotion>): void {
  const db = getDb();
  const prod = db.prepare("SELECT reference_price FROM products WHERE id = ?").get(promo.product_id || "") as any;
  if (!prod) {
    throw new Error("Invalid product ID for promotion");
  }

  const salePrice = Number(promo.sale_price) || 0;
  if (salePrice <= 0) {
    throw new Error("Sale price must be greater than zero");
  }
  if (salePrice >= prod.reference_price) {
    throw new Error(`Sale price (?${salePrice}) must be strictly lower than regular reference price (?${prod.reference_price})`);
  }

  const startDate = new Date(promo.start_time || new Date());
  const endDate = new Date(promo.end_time || new Date());
  if (endDate <= startDate) {
    throw new Error("Promotion end time must be after start time");
  }

  const id = promo.id || `promo-${Date.now()}`;

  db.prepare(`
    INSERT INTO promotions (id, product_id, title, sale_price, start_time, end_time, badge, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      product_id=excluded.product_id,
      title=excluded.title,
      sale_price=excluded.sale_price,
      start_time=excluded.start_time,
      end_time=excluded.end_time,
      badge=excluded.badge,
      active=excluded.active
  `).run(
    id,
    promo.product_id || "",
    promo.title || "Special Promotion",
    salePrice,
    startDate.toISOString(),
    endDate.toISOString(),
    promo.badge || "FLASH SALE",
    promo.active !== undefined ? promo.active : 1
  );

  cacheInvalidate("promotions_");
}

export function deletePromotion(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM promotions WHERE id = ?").run(id);
  cacheInvalidate("promotions_");
}

// ---------------- TRENDING & RECOMMENDATIONS ----------------
export function getTrendingProducts(limit = 6): DbProduct[] {
  const cacheKey = `trending_products_${limit}`;
  const cached = cacheGet<DbProduct[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  // Rank by: view_count + (verified buyer inquiries for this product * 5)
  const query = `
    SELECT p.*,
      (COALESCE(p.view_count, 0) + (SELECT COUNT(*) * 5 FROM inquiries WHERE product_id = p.id)) as score
    FROM products p
    WHERE p.active = 1
    ORDER BY score DESC, p.featured DESC, p.sort_order ASC
    LIMIT ?
  `;
  const rows = db.prepare(query).all(limit) as unknown as DbProduct[];
  cacheSet(cacheKey, rows, 30);
  return rows;
}

export function getNewArrivals(limit = 6): DbProduct[] {
  const cacheKey = `new_arrivals_${limit}`;
  const cached = cacheGet<DbProduct[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const query = `
    SELECT * FROM products
    WHERE active = 1
    ORDER BY datetime(COALESCE(created_at, '2026-10-11')) DESC, sort_order ASC
    LIMIT ?
  `;
  const rows = db.prepare(query).all(limit) as unknown as DbProduct[];
  cacheSet(cacheKey, rows, 30);
  return rows;
}

export function getCuratedRecommendations(preferenceCategory?: string, limit = 6): DbProduct[] {
  const cacheKey = `recommendations_${preferenceCategory || "general"}_${limit}`;
  const cached = cacheGet<DbProduct[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  let rows: DbProduct[] = [];

  if (preferenceCategory && preferenceCategory !== "all") {
    rows = db.prepare(`
      SELECT * FROM products
      WHERE active = 1 AND (category_id = ? OR category_ids LIKE ?)
      ORDER BY featured DESC, sort_order ASC
      LIMIT ?
    `).all(preferenceCategory, `%"${preferenceCategory}"%`, limit) as unknown as DbProduct[];
  }

  // Fallback: pick diverse items from different categories
  if (rows.length < limit) {
    const existingIds = rows.map((r) => r.id);
    const placeholders = existingIds.length > 0 ? existingIds.map(() => "?").join(",") : "''";
    const remainingLimit = limit - rows.length;

    const filler = db.prepare(`
      SELECT * FROM products
      WHERE active = 1 AND id NOT IN (${placeholders})
      ORDER BY featured DESC, reference_price ASC
      LIMIT ?
    `).all(...existingIds, remainingLimit) as unknown as DbProduct[];

    rows = [...rows, ...filler];
  }

  cacheSet(cacheKey, rows, 60);
  return rows;
}

export function recordProductView(id: string): void {
  const db = getDb();
  db.prepare("UPDATE products SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?").run(id);
  cacheInvalidate("trending_products_");
}


export interface DbPage {
  slug: string;
  title: string;
  category: string;
  summary: string;
  content_html: string;
  published: number;
  last_updated: string;
  version: number;
  legal_review_flagged: number;
}

export interface DbPageRevision {
  id: string;
  page_slug: string;
  version: number;
  title: string;
  content_html: string;
  author: string;
  created_at: string;
  note: string;
}

// ---------------- PAGES CMS ----------------
export function getPages(publishedOnly = true): DbPage[] {
  const cacheKey = `pages_${publishedOnly ? "published" : "all"}`;
  const cached = cacheGet<DbPage[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const query = publishedOnly
    ? "SELECT * FROM pages WHERE published = 1 ORDER BY category ASC, title ASC"
    : "SELECT * FROM pages ORDER BY category ASC, title ASC";

  const rows = db.prepare(query).all() as unknown as DbPage[];
  cacheSet(cacheKey, rows, 60);
  return rows;
}

export function getPageBySlug(slug: string): DbPage | null {
  const cacheKey = `page_${slug}`;
  const cached = cacheGet<DbPage>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const row = db.prepare("SELECT * FROM pages WHERE slug = ?").get(slug) as unknown as DbPage | undefined;
  if (row) {
    cacheSet(cacheKey, row, 60);
    return row;
  }
  return null;
}

export function upsertPage(
  page: Partial<DbPage>,
  author = "admin",
  note = "Content updated via Admin CMS"
): void {
  const db = getDb();
  const slug = (page.slug || "").trim().toLowerCase();
  if (!slug) throw new Error("Page slug is required");

  const existing = db.prepare("SELECT * FROM pages WHERE slug = ?").get(slug) as any;
  const currentVersion = existing ? existing.version + 1 : 1;

  const p = {
    slug,
    title: page.title || "Untitled Page",
    category: page.category || "General",
    summary: page.summary || "",
    content_html: page.content_html || "<p></p>",
    published: page.published !== undefined ? page.published : 1,
    version: currentVersion,
    legal_review_flagged: page.legal_review_flagged !== undefined ? page.legal_review_flagged : 1,
  };

  db.prepare(`
    INSERT INTO pages (slug, title, category, summary, content_html, published, last_updated, version, legal_review_flagged)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title=excluded.title,
      category=excluded.category,
      summary=excluded.summary,
      content_html=excluded.content_html,
      published=excluded.published,
      last_updated=datetime('now'),
      version=excluded.version,
      legal_review_flagged=excluded.legal_review_flagged
  `).run(
    p.slug,
    p.title,
    p.category,
    p.summary,
    p.content_html,
    p.published,
    p.version,
    p.legal_review_flagged
  );

  // Record revision
  const revId = `rev-${p.slug}-v${p.version}-${Date.now()}`;
  db.prepare(`
    INSERT INTO page_revisions (id, page_slug, version, title, content_html, author, created_at, note)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)
  `).run(revId, p.slug, p.version, p.title, p.content_html, author, note);

  cacheInvalidate("pages_");
  cacheInvalidate(`page_${p.slug}`);
}

export function getPageRevisions(slug: string): DbPageRevision[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM page_revisions WHERE page_slug = ? ORDER BY version DESC
  `).all(slug) as unknown as DbPageRevision[];
}

export function deletePage(slug: string): void {
  const db = getDb();
  db.prepare("DELETE FROM pages WHERE slug = ?").run(slug);
  db.prepare("DELETE FROM page_revisions WHERE page_slug = ?").run(slug);
  cacheInvalidate("pages_");
  cacheInvalidate(`page_${slug}`);
}

// ---------------- REVIEWS ----------------
export function getReviews(productId?: string, activeOnly = true): ReviewStats {
  const cacheKey = `reviews_${productId || "all"}_${activeOnly ? "active" : "all"}`;
  const cached = cacheGet<ReviewStats>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  let query = "SELECT * FROM reviews";
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (activeOnly) {
    whereClauses.push("active = 1");
  }
  if (productId) {
    whereClauses.push("product_id = ?");
    params.push(productId);
  }

  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }

  query += " ORDER BY created_at DESC";

  const rows = db.prepare(query).all(...params) as unknown as DbReview[];

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;

  for (const r of rows) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    distribution[star] = (distribution[star] || 0) + 1;
    totalRating += (r.rating || 5);
  }

  const averageRating = rows.length > 0 ? parseFloat((totalRating / rows.length).toFixed(1)) : 4.9;

  const result: ReviewStats = {
    reviews: rows,
    averageRating,
    totalReviews: rows.length,
    ratingDistribution: distribution,
  };

  cacheSet(cacheKey, result, 30);
  return result;
}

export function createReview(data: {
  productId: string;
  authorName: string;
  location?: string;
  rating: number;
  comment: string;
}): DbReview {
  const db = getDb();
  const id = `rev-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const review: DbReview = {
    id,
    product_id: data.productId,
    author_name: data.authorName.trim(),
    location: (data.location || "Delhi NCR").trim(),
    rating: Math.min(5, Math.max(1, Math.round(data.rating))),
    comment: data.comment.trim(),
    active: 1,
    created_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO reviews (id, product_id, author_name, location, rating, comment, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    review.id,
    review.product_id,
    review.author_name,
    review.location,
    review.rating,
    review.comment,
    review.active,
    review.created_at
  );

  cacheInvalidate("reviews_");
  return review;
}
