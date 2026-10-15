import path from "node:path";
import fs from "node:fs";

const TEMP_DIR = path.join(process.cwd(), "data", "temp-3d-conversions");
const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour max retention

export interface TempFileMetadata {
  id: string;
  originalFileName: string;
  targetFileName: string;
  mimeType: string;
  createdAt: number;
  expiresAt: number;
  fileSizeBytes: number;
}

function ensureTempDir(): void {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

/**
 * Deletes any server-side temporary conversion artifacts older than 1 hour.
 * Downloads never extend this retention period.
 */
export function purgeExpiredTemp3DFiles(): number {
  ensureTempDir();
  let deletedCount = 0;
  const now = Date.now();

  try {
    const entries = fs.readdirSync(TEMP_DIR);
    for (const entry of entries) {
      const entryPath = path.join(TEMP_DIR, entry);
      const metaPath = path.join(entryPath, "metadata.json");

      if (fs.existsSync(metaPath)) {
        try {
          const meta: TempFileMetadata = JSON.parse(fs.readFileSync(metaPath, "utf8"));
          if (now >= meta.expiresAt) {
            fs.rmSync(entryPath, { recursive: true, force: true });
            deletedCount++;
            continue;
          }
        } catch (_) {}
      }

      // Fallback check on folder mtime if metadata missing
      try {
        const stats = fs.statSync(entryPath);
        if (now - stats.mtimeMs > ONE_HOUR_MS) {
          fs.rmSync(entryPath, { recursive: true, force: true });
          deletedCount++;
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error("Error purging expired 3D temp files:", err);
  }

  return deletedCount;
}

/**
 * Stores a server-side converted 3D artifact with strict 1-hour expiration.
 */
export function saveTempConvertedFile(
  id: string,
  targetFileName: string,
  originalFileName: string,
  buffer: Buffer | Uint8Array,
  mimeType: string
): TempFileMetadata {
  ensureTempDir();
  purgeExpiredTemp3DFiles();

  const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, "");
  const cleanTargetName = path.basename(targetFileName);
  const cleanOriginalName = path.basename(originalFileName);

  const sessionDir = path.join(TEMP_DIR, cleanId);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const filePath = path.join(sessionDir, cleanTargetName);
  fs.writeFileSync(filePath, Buffer.from(buffer));

  const now = Date.now();
  const metadata: TempFileMetadata = {
    id: cleanId,
    originalFileName: cleanOriginalName,
    targetFileName: cleanTargetName,
    mimeType,
    createdAt: now,
    expiresAt: now + ONE_HOUR_MS,
    fileSizeBytes: buffer.byteLength,
  };

  fs.writeFileSync(path.join(sessionDir, "metadata.json"), JSON.stringify(metadata, null, 2), "utf8");
  return metadata;
}

/**
 * Retrieves a temporary converted file if still valid (under 1 hour).
 */
export function getTempConvertedFile(id: string): {
  metadata: TempFileMetadata;
  filePath: string;
} | null {
  purgeExpiredTemp3DFiles();

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return null;

  const sessionDir = path.join(TEMP_DIR, id);
  if (!path.resolve(sessionDir).startsWith(path.resolve(TEMP_DIR))) return null;

  const metaPath = path.join(sessionDir, "metadata.json");

  if (!fs.existsSync(metaPath)) return null;

  try {
    const meta: TempFileMetadata = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    if (Date.now() >= meta.expiresAt) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      return null;
    }

    const cleanName = path.basename(meta.targetFileName);
    const filePath = path.join(sessionDir, cleanName);
    if (!fs.existsSync(filePath)) return null;

    return { metadata: meta, filePath };
  } catch (_) {
    return null;
  }
}

/**
 * Immediately deletes a temporary conversion session and all artifacts.
 */
export function deleteTempConvertedFile(id: string): void {
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return;
  const sessionDir = path.join(TEMP_DIR, id);
  if (path.resolve(sessionDir).startsWith(path.resolve(TEMP_DIR)) && fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }
}
