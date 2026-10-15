import { NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/auth-check";
import { optimizeAndSaveImage } from "@/lib/image-optimizer";

export async function POST(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const prefix = (formData.get("prefix") as string) || "img";
    const oldAssetUrl = (formData.get("oldAssetUrl") as string) || undefined;
    const keepOriginal = formData.get("keepOriginal") === "true";

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await optimizeAndSaveImage(buffer, {
      prefix,
      oldAssetUrl,
      keepOriginal,
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 82,
      generateVariants: true,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      originalUrl: result.originalUrl,
      format: result.format,
      width: result.width,
      height: result.height,
      sizeBytes: result.sizeBytes,
      originalSizeBytes: result.originalSizeBytes,
      compressionRatio: result.compressionRatio,
      variants: result.variants,
      hasAlpha: result.hasAlpha,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Image validation or WebP conversion failed" },
      { status: 400 }
    );
  }
}
