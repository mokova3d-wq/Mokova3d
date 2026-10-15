import sharp, { type Metadata } from "sharp";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { cacheInvalidate } from "./cache";

export interface ImageOptimizationOptions {
  maxSizeBytes?: number; // default: 15MB
  maxWidth?: number; // default: 1920
  maxHeight?: number; // default: 1920
  minWidth?: number; // default: 10
  minHeight?: number; // default: 10
  quality?: number; // default: 82
  alphaQuality?: number; // default: 85
  effort?: number; // default: 4
  generateVariants?: boolean; // default: true
  prefix?: string; // e.g. "prod", "hero", "gallery", "cat"
  keepOriginal?: boolean; // default: false
  oldAssetUrl?: string; // url to clean up if replacing
}

export interface ImageVariant {
  name: "thumb" | "card" | "full";
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface OptimizedImageResult {
  url: string; // primary WebP URL (e.g. /assets/uploads/opt-hero-12345.webp)
  originalUrl?: string; // if keepOriginal was true
  format: "webp";
  originalFormat: string;
  width: number;
  height: number;
  sizeBytes: number;
  originalSizeBytes: number;
  compressionRatio: number; // e.g. 0.35 (65% reduction)
  variants?: ImageVariant[];
  hasAlpha: boolean;
}

/**
 * Validates actual binary file signatures (Magic Bytes).
 * Never trusts file extensions or client-sent MIME headers alone.
 */
export function validateImageMagicBytes(buffer: Buffer): {
  isValid: boolean;
  detectedFormat?: string;
  error?: string;
} {
  if (!buffer || buffer.length < 12) {
    return { isValid: false, error: "File buffer is too small or empty." };
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, detectedFormat: "jpeg" };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, detectedFormat: "png" };
  }

  // 3. WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { isValid: true, detectedFormat: "webp" };
  }

  // 4. GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { isValid: true, detectedFormat: "gif" };
  }

  // 5. TIFF: II*. or MM.*
  if (
    (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
    (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a)
  ) {
    return { isValid: true, detectedFormat: "tiff" };
  }

  // 6. AVIF: ....ftypavif or ftypavis
  const sub = buffer.subarray(4, 12).toString("latin1");
  if (sub === "ftypavif" || sub === "ftypavis") {
    return { isValid: true, detectedFormat: "avif" };
  }

  return {
    isValid: false,
    error: "Invalid file signature. File is not a recognized JPEG, PNG, WebP, GIF, TIFF, or AVIF image.",
  };
}

/**
 * Optimizes an uploaded image buffer to production WebP with validation,
 * resizing, transparency preservation, and atomic disk storage.
 */
export async function optimizeAndSaveImage(
  inputBuffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxSizeBytes = 15 * 1024 * 1024, // 15MB max upload
    maxWidth = 1920,
    maxHeight = 1920,
    minWidth = 10,
    minHeight = 10,
    quality = 82,
    alphaQuality = 85,
    effort = 4,
    generateVariants = true,
    prefix = "opt",
    keepOriginal = false,
    oldAssetUrl,
  } = options;

  // 1. File size check
  if (inputBuffer.length > maxSizeBytes) {
    throw new Error(
      `File size (${(inputBuffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds limit of ${(
        maxSizeBytes /
        (1024 * 1024)
      ).toFixed(1)}MB.`
    );
  }

  // 2. Validate Magic Bytes (Content Sniffing)
  const magicCheck = validateImageMagicBytes(inputBuffer);
  if (!magicCheck.isValid) {
    throw new Error(magicCheck.error || "File signature validation failed.");
  }

  // 3. Inspect image metadata via Sharp (deep validation)
  let metadata: Metadata;
  try {
    metadata = await sharp(inputBuffer).metadata();
  } catch (err: any) {
    throw new Error(`Corrupted or unreadable image file: ${err.message || "Failed to decode"}`);
  }

  const origWidth = metadata.width || 0;
  const origHeight = metadata.height || 0;

  if (origWidth < minWidth || origHeight < minHeight) {
    throw new Error(`Image dimensions (${origWidth}×${origHeight}) are below minimum requirement (${minWidth}×${minHeight}).`);
  }

  // Check for alpha channel transparency
  const hasAlpha = Boolean(metadata.hasAlpha);

  // 4. Ensure target directories exist
  const uploadsDir = path.join(process.cwd(), "public", "assets", "uploads");
  const tmpDir = path.join(process.cwd(), "public", "assets", "uploads", ".tmp");
  const originalsDir = path.join(process.cwd(), "public", "assets", "uploads", "originals");

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  if (!fs.existsSync(originalsDir)) fs.mkdirSync(originalsDir, { recursive: true });

  const fileId = `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const tmpFilesToCleanup: string[] = [];

  try {
    // 5. Generate primary optimized WebP image
    let pipeline = sharp(inputBuffer).rotate(); // auto-orient via EXIF

    if (origWidth > maxWidth || origHeight > maxHeight) {
      pipeline = pipeline.resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const primaryBuffer = await pipeline
      .webp({
        quality,
        alphaQuality,
        effort,
        lossless: false,
      })
      .toBuffer();

    // Verify generated WebP output
    const primaryMeta = await sharp(primaryBuffer).metadata();
    if (primaryMeta.format !== "webp" || !primaryMeta.width || !primaryMeta.height) {
      throw new Error("WebP encoding validation failed.");
    }

    // Atomic write for primary image
    const primaryFilename = `${fileId}.webp`;
    const primaryTmpPath = path.join(tmpDir, `${primaryFilename}.tmp`);
    const primaryFinalPath = path.join(uploadsDir, primaryFilename);

    fs.writeFileSync(primaryTmpPath, primaryBuffer);
    tmpFilesToCleanup.push(primaryTmpPath);
    fs.renameSync(primaryTmpPath, primaryFinalPath);

    // 6. Generate responsive variants if requested
    const variants: ImageVariant[] = [];
    if (generateVariants) {
      const variantSpecs: { name: "thumb" | "card"; maxDimension: number }[] = [
        { name: "thumb", maxDimension: 320 },
        { name: "card", maxDimension: 800 },
      ];

      for (const spec of variantSpecs) {
        if (primaryMeta.width > spec.maxDimension || primaryMeta.height > spec.maxDimension) {
          const varBuffer = await sharp(inputBuffer)
            .rotate()
            .resize({
              width: spec.maxDimension,
              height: spec.maxDimension,
              fit: "inside",
              withoutEnlargement: true,
            })
            .webp({ quality: Math.max(75, quality - 5), alphaQuality, effort })
            .toBuffer();

          const varMeta = await sharp(varBuffer).metadata();
          const varFilename = `${fileId}-${spec.name}.webp`;
          const varTmpPath = path.join(tmpDir, `${varFilename}.tmp`);
          const varFinalPath = path.join(uploadsDir, varFilename);

          fs.writeFileSync(varTmpPath, varBuffer);
          tmpFilesToCleanup.push(varTmpPath);
          fs.renameSync(varTmpPath, varFinalPath);

          variants.push({
            name: spec.name,
            url: `/assets/uploads/${varFilename}`,
            width: varMeta.width || spec.maxDimension,
            height: varMeta.height || spec.maxDimension,
            sizeBytes: varBuffer.length,
          });
        }
      }

      // Add full variant entry
      variants.push({
        name: "full",
        url: `/assets/uploads/${primaryFilename}`,
        width: primaryMeta.width,
        height: primaryMeta.height,
        sizeBytes: primaryBuffer.length,
      });
    }

    // 7. Store original if explicitly requested
    let originalUrl: string | undefined;
    if (keepOriginal) {
      const origExt = magicCheck.detectedFormat || "bin";
      const origFilename = `${fileId}-original.${origExt}`;
      const origFinalPath = path.join(originalsDir, origFilename);
      fs.writeFileSync(origFinalPath, inputBuffer);
      originalUrl = `/assets/uploads/originals/${origFilename}`;
    }

    // 8. Clean up orphaned previous upload asset if specified
    if (oldAssetUrl && oldAssetUrl.startsWith("/assets/uploads/")) {
      cleanupOrphanedAsset(oldAssetUrl);
    }

    // 9. Invalidate relevant caches
    cacheInvalidate("site_config_");
    cacheInvalidate("products_");
    cacheInvalidate("gallery_");
    cacheInvalidate("categories_");

    return {
      url: `/assets/uploads/${primaryFilename}`,
      originalUrl,
      format: "webp",
      originalFormat: magicCheck.detectedFormat || metadata.format || "unknown",
      width: primaryMeta.width,
      height: primaryMeta.height,
      sizeBytes: primaryBuffer.length,
      originalSizeBytes: inputBuffer.length,
      compressionRatio: parseFloat((primaryBuffer.length / inputBuffer.length).toFixed(3)),
      variants,
      hasAlpha,
    };
  } catch (error) {
    // Clean up temporary files on failure
    for (const tmp of tmpFilesToCleanup) {
      if (fs.existsSync(tmp)) {
        try {
          fs.unlinkSync(tmp);
        } catch (_) {}
      }
    }
    throw error;
  }
}

/**
 * Safely removes an orphaned upload file and its responsive variants.
 */
export function cleanupOrphanedAsset(assetUrl: string): void {
  if (!assetUrl || !assetUrl.startsWith("/assets/uploads/")) return;

  const uploadsDir = path.join(process.cwd(), "public", "assets", "uploads");
  const baseName = path.basename(assetUrl);

  // Prevent directory traversal
  if (baseName.includes("..") || baseName.includes("/") || baseName.includes("\\")) return;

  const targetPath = path.join(uploadsDir, baseName);
  if (fs.existsSync(targetPath)) {
    try {
      fs.unlinkSync(targetPath);
    } catch (_) {}
  }

  // Also remove potential variants
  const stem = baseName.replace(/\.webp$/, "");
  for (const suffix of ["-thumb.webp", "-card.webp"]) {
    const variantPath = path.join(uploadsDir, `${stem}${suffix}`);
    if (fs.existsSync(variantPath)) {
      try {
        fs.unlinkSync(variantPath);
      } catch (_) {}
    }
  }
}
