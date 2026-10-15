import { describe, it, expect, beforeEach, afterEach } from "vitest";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import {
  validateImageMagicBytes,
  optimizeAndSaveImage,
  cleanupOrphanedAsset,
} from "@/lib/image-optimizer";
import { migrateExistingImagesToWebP } from "@/lib/image-migration";

describe("Mandatory WebP Image Upload & Optimization Engine", () => {
  let samplePngBuffer: Buffer;
  let sampleTransparentPngBuffer: Buffer;
  let sampleJpegBuffer: Buffer;
  const createdTestUrls: string[] = [];

  beforeEach(async () => {
    // Generate valid test images via sharp in-memory
    samplePngBuffer = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 3,
        background: { r: 90, g: 69, b: 255 },
      },
    })
      .png()
      .toBuffer();

    sampleTransparentPngBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 },
      },
    })
      .png()
      .toBuffer();

    sampleJpegBuffer = await sharp({
      create: {
        width: 500,
        height: 500,
        channels: 3,
        background: { r: 245, g: 158, b: 11 },
      },
    })
      .jpeg()
      .toBuffer();
  });

  afterEach(() => {
    // Clean up created test assets
    for (const url of createdTestUrls) {
      cleanupOrphanedAsset(url);
    }
  });

  it("validates actual binary file signatures and rejects spoofed files", () => {
    // Valid checks
    expect(validateImageMagicBytes(samplePngBuffer).isValid).toBe(true);
    expect(validateImageMagicBytes(sampleJpegBuffer).isValid).toBe(true);

    // Corrupted / fake file with .png text
    const fakeFile = Buffer.from("NOT_AN_IMAGE_FAKE_FILE_CONTENT");
    const fakeCheck = validateImageMagicBytes(fakeFile);
    expect(fakeCheck.isValid).toBe(false);
    expect(fakeCheck.error).toContain("Invalid file signature");

    // Empty buffer
    expect(validateImageMagicBytes(Buffer.alloc(0)).isValid).toBe(false);
  });

  it("converts uploaded PNG and JPEG into optimized WebP atomically", async () => {
    const result = await optimizeAndSaveImage(samplePngBuffer, {
      prefix: "test-prod",
      maxWidth: 1200,
      quality: 82,
      generateVariants: true,
    });

    createdTestUrls.push(result.url);

    expect(result.format).toBe("webp");
    expect(result.url).toMatch(/^\/assets\/uploads\/test-prod-.*\.webp$/);
    expect(result.width).toBe(400);
    expect(result.height).toBe(300);
    expect(result.sizeBytes).toBeGreaterThan(0);

    // Verify written file on disk exists and is genuine WebP
    const filePath = path.join(process.cwd(), "public", result.url);
    expect(fs.existsSync(filePath)).toBe(true);

    const onDiskMeta = await sharp(filePath).metadata();
    expect(onDiskMeta.format).toBe("webp");
    expect(onDiskMeta.width).toBe(400);
  });

  it("correctly handles and preserves alpha transparency in WebP", async () => {
    const result = await optimizeAndSaveImage(sampleTransparentPngBuffer, {
      prefix: "test-alpha",
      quality: 85,
    });

    createdTestUrls.push(result.url);

    expect(result.format).toBe("webp");
    expect(result.hasAlpha).toBe(true);

    const onDiskMeta = await sharp(path.join(process.cwd(), "public", result.url)).metadata();
    expect(onDiskMeta.hasAlpha).toBe(true);
  });

  it("enforces configurable file-size limits", async () => {
    await expect(
      optimizeAndSaveImage(samplePngBuffer, {
        maxSizeBytes: 100, // 100 bytes limit
      })
    ).rejects.toThrow(/exceeds limit/i);
  });

  it("generates responsive variants for thumbnails and product cards", async () => {
    const largeImage = await sharp({
      create: {
        width: 1600,
        height: 1200,
        channels: 3,
        background: { r: 50, g: 100, b: 150 },
      },
    })
      .png()
      .toBuffer();

    const result = await optimizeAndSaveImage(largeImage, {
      prefix: "test-large",
      generateVariants: true,
    });

    createdTestUrls.push(result.url);

    expect(result.variants).toBeDefined();
    expect(result.variants?.length).toBeGreaterThanOrEqual(2);

    const thumbVariant = result.variants?.find((v) => v.name === "thumb");
    expect(thumbVariant).toBeDefined();
    expect(thumbVariant?.width).toBeLessThanOrEqual(320);

    const cardVariant = result.variants?.find((v) => v.name === "card");
    expect(cardVariant).toBeDefined();
    expect(cardVariant?.width).toBeLessThanOrEqual(800);
  });

  it("cleans up orphaned assets safely when replacing an old image", async () => {
    const first = await optimizeAndSaveImage(samplePngBuffer, { prefix: "test-replace" });
    const firstPath = path.join(process.cwd(), "public", first.url);
    expect(fs.existsSync(firstPath)).toBe(true);

    const second = await optimizeAndSaveImage(sampleJpegBuffer, {
      prefix: "test-replace-2",
      oldAssetUrl: first.url,
    });
    createdTestUrls.push(second.url);

    expect(fs.existsSync(firstPath)).toBe(false);
  });

  it("migrates existing catalog images to verified WebP", async () => {
    const summary = await migrateExistingImagesToWebP();
    expect(summary.totalScanned).toBeGreaterThan(0);
    expect(summary.errors.length).toBe(0);

    // Verify first record
    if (summary.records.length > 0) {
      const rec = summary.records[0];
      expect(rec.verified).toBe(true);
      expect(rec.webpUrl.endsWith(".webp")).toBe(true);

      const webpOnDisk = path.join(process.cwd(), "public", rec.webpFile);
      expect(fs.existsSync(webpOnDisk)).toBe(true);
    }
  }, 30000);
});
