import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
import { getDb } from "./db";
import { cacheInvalidate } from "./cache";
import { validateImageMagicBytes } from "./image-optimizer";

export interface MigrationRecord {
  originalFile: string;
  webpFile: string;
  originalUrl: string;
  webpUrl: string;
  originalSizeBytes: number;
  webpSizeBytes: number;
  width: number;
  height: number;
  verified: boolean;
  migratedAt: string;
}

export interface MigrationSummary {
  totalScanned: number;
  converted: number;
  skipped: number;
  errors: string[];
  records: MigrationRecord[];
  bytesSaved: number;
}

const BACKUP_MANIFEST_PATH = path.join(process.cwd(), "data", "image-migration-backup.json");

/**
 * Migrates existing catalog, gallery, and site config images to optimized WebP.
 * Verifies every converted file and saves a rollback manifest.
 */
export async function migrateExistingImagesToWebP(): Promise<MigrationSummary> {
  const db = getDb();
  const summary: MigrationSummary = {
    totalScanned: 0,
    converted: 0,
    skipped: 0,
    errors: [],
    records: [],
    bytesSaved: 0,
  };

  const urlMapping = new Map<string, string>(); // originalUrl -> webpUrl

  // Helper to convert an image file to WebP and verify
  const convertFile = async (relativeAssetPath: string): Promise<MigrationRecord | null> => {
    summary.totalScanned++;
    // Clean leading slash
    const cleanRel = relativeAssetPath.startsWith("/") ? relativeAssetPath.slice(1) : relativeAssetPath;
    const absPath = path.join(process.cwd(), "public", cleanRel);

    if (!fs.existsSync(absPath)) {
      summary.skipped++;
      return null;
    }

    const ext = path.extname(absPath).toLowerCase();
    if (ext === ".webp" || ext === ".glb" || ext === ".stl" || ext === ".obj") {
      summary.skipped++;
      return null;
    }

    try {
      const buffer = fs.readFileSync(absPath);
      const magicCheck = validateImageMagicBytes(buffer);
      if (!magicCheck.isValid) {
        summary.skipped++;
        return null;
      }

      // Convert to WebP using Sharp
      const webpBuffer = await sharp(buffer)
        .rotate()
        .webp({ quality: 82, alphaQuality: 85, effort: 4 })
        .toBuffer();

      // Deep verification of the generated WebP file
      const webpMeta = await sharp(webpBuffer).metadata();
      if (webpMeta.format !== "webp" || !webpMeta.width || !webpMeta.height) {
        throw new Error(`Verification failed for converted WebP: ${cleanRel}`);
      }

      const webpRel = cleanRel.replace(/\.[a-zA-Z0-9]+$/, ".webp");
      const webpAbs = path.join(process.cwd(), "public", webpRel);

      // Write verified WebP file
      fs.writeFileSync(webpAbs, webpBuffer);

      const record: MigrationRecord = {
        originalFile: cleanRel,
        webpFile: webpRel,
        originalUrl: `/${cleanRel.replace(/\\/g, "/")}`,
        webpUrl: `/${webpRel.replace(/\\/g, "/")}`,
        originalSizeBytes: buffer.length,
        webpSizeBytes: webpBuffer.length,
        width: webpMeta.width,
        height: webpMeta.height,
        verified: true,
        migratedAt: new Date().toISOString(),
      };

      summary.converted++;
      summary.bytesSaved += Math.max(0, buffer.length - webpBuffer.length);
      summary.records.push(record);
      urlMapping.set(record.originalUrl, record.webpUrl);

      return record;
    } catch (err: any) {
      summary.errors.push(`Failed to convert ${cleanRel}: ${err.message}`);
      return null;
    }
  };

  // 1. Gather all image references from Database
  const products = db.prepare("SELECT id, image, gallery FROM products").all() as any[];
  const categories = db.prepare("SELECT id, image FROM categories").all() as any[];
  const galleryItems = db.prepare("SELECT id, src FROM gallery").all() as any[];
  const siteConfigs = db.prepare("SELECT key, value FROM site_config WHERE key IN ('heroImage', 'heroMobileImage')").all() as any[];

  // Convert product main images and galleries
  for (const prod of products) {
    if (prod.image && prod.image.startsWith("/assets/")) {
      await convertFile(prod.image);
    }
    if (prod.gallery) {
      try {
        const gal = JSON.parse(prod.gallery);
        if (Array.isArray(gal)) {
          for (const g of gal) {
            if (typeof g === "string" && g.startsWith("/assets/")) {
              await convertFile(g);
            }
          }
        }
      } catch (_) {}
    }
  }

  // Convert category images
  for (const cat of categories) {
    if (cat.image && cat.image.startsWith("/assets/")) {
      await convertFile(cat.image);
    }
  }

  // Convert gallery images
  for (const gal of galleryItems) {
    if (gal.src && gal.src.startsWith("/assets/")) {
      await convertFile(gal.src);
    }
  }

  // Convert site config images
  for (const cfg of siteConfigs) {
    if (cfg.value && cfg.value.startsWith("/assets/")) {
      await convertFile(cfg.value);
    }
  }

  // Also scan public/assets/uploads directory if present
  const uploadsDir = path.join(process.cwd(), "public", "assets", "uploads");
  if (fs.existsSync(uploadsDir)) {
    const uploadFiles = fs.readdirSync(uploadsDir);
    for (const f of uploadFiles) {
      const ext = path.extname(f).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".avif", ".tiff"].includes(ext)) {
        await convertFile(`assets/uploads/${f}`);
      }
    }
  }

  // 2. Save Rollback Backup Manifest
  let existingBackup: MigrationRecord[] = [];
  if (fs.existsSync(BACKUP_MANIFEST_PATH)) {
    try {
      existingBackup = JSON.parse(fs.readFileSync(BACKUP_MANIFEST_PATH, "utf8"));
    } catch (_) {}
  }
  const allRecords = [...existingBackup, ...summary.records];
  fs.writeFileSync(BACKUP_MANIFEST_PATH, JSON.stringify(allRecords, null, 2), "utf8");

  // 3. Atomically update database references in a transaction
  db.exec("BEGIN TRANSACTION;");
  try {
    const updateProduct = db.prepare("UPDATE products SET image = ?, gallery = ? WHERE id = ?");
    for (const prod of products) {
      const newImage = urlMapping.get(prod.image) || prod.image;
      let newGallery = prod.gallery;
      if (prod.gallery) {
        try {
          const parsed = JSON.parse(prod.gallery);
          if (Array.isArray(parsed)) {
            const updatedGal = parsed.map((item: string) => urlMapping.get(item) || item);
            newGallery = JSON.stringify(updatedGal);
          }
        } catch (_) {}
      }
      if (newImage !== prod.image || newGallery !== prod.gallery) {
        updateProduct.run(newImage, newGallery, prod.id);
      }
    }

    const updateCategory = db.prepare("UPDATE categories SET image = ? WHERE id = ?");
    for (const cat of categories) {
      const newImg = urlMapping.get(cat.image);
      if (newImg && newImg !== cat.image) {
        updateCategory.run(newImg, cat.id);
      }
    }

    const updateGallery = db.prepare("UPDATE gallery SET src = ? WHERE id = ?");
    for (const gal of galleryItems) {
      const newSrc = urlMapping.get(gal.src);
      if (newSrc && newSrc !== gal.src) {
        updateGallery.run(newSrc, gal.id);
      }
    }

    const updateConfig = db.prepare("UPDATE site_config SET value = ? WHERE key = ?");
    for (const cfg of siteConfigs) {
      const newVal = urlMapping.get(cfg.value);
      if (newVal && newVal !== cfg.value) {
        updateConfig.run(newVal, cfg.key);
      }
    }

    db.exec("COMMIT;");
  } catch (dbErr) {
    db.exec("ROLLBACK;");
    throw dbErr;
  }

  // 4. Invalidate all caches
  cacheInvalidate();

  return summary;
}

/**
 * Rollback image migration using the stored backup manifest.
 */
export function rollbackImageMigration(): { rolledBackCount: number } {
  if (!fs.existsSync(BACKUP_MANIFEST_PATH)) {
    return { rolledBackCount: 0 };
  }

  const records: MigrationRecord[] = JSON.parse(fs.readFileSync(BACKUP_MANIFEST_PATH, "utf8"));
  const db = getDb();

  db.exec("BEGIN TRANSACTION;");
  try {
    for (const rec of records) {
      db.prepare("UPDATE products SET image = ? WHERE image = ?").run(rec.originalUrl, rec.webpUrl);
      db.prepare("UPDATE categories SET image = ? WHERE image = ?").run(rec.originalUrl, rec.webpUrl);
      db.prepare("UPDATE gallery SET src = ? WHERE src = ?").run(rec.originalUrl, rec.webpUrl);
      db.prepare("UPDATE site_config SET value = ? WHERE value = ?").run(rec.originalUrl, rec.webpUrl);
    }
    db.exec("COMMIT;");
  } catch (err) {
    db.exec("ROLLBACK;");
    throw err;
  }

  cacheInvalidate();
  return { rolledBackCount: records.length };
}
