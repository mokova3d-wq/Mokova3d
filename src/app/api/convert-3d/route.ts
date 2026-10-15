import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs";
import {
  convert3DModel,
  SupportedTargetFormat,
  CompanionFile,
} from "@/lib/3d-converter";
import {
  saveTempConvertedFile,
  getTempConvertedFile,
  deleteTempConvertedFile,
} from "@/lib/temp-3d-storage";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max limit

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetFormat = (formData.get("targetFormat") as SupportedTargetFormat) || "glb";
    const optimize = formData.get("optimize") !== "false";
    const computeNormals = formData.get("computeNormals") !== "false";

    if (!file) {
      return NextResponse.json({ error: "No 3D model file provided." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 50MB limit.` },
        { status: 400 }
      );
    }

    // Extract any companion files (e.g. MTL, textures)
    const companionFiles: CompanionFile[] = [];
    for (const [key, val] of formData.entries()) {
      if (key.startsWith("companion_") && val instanceof File) {
        const cBuffer = await val.arrayBuffer();
        companionFiles.push({
          name: val.name,
          data: cBuffer,
        });
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const conversionResult = await convert3DModel({
      fileName: file.name,
      data: arrayBuffer,
      targetFormat,
      options: {
        optimize,
        computeNormals,
        companionFiles,
      },
    });

    const conversionId = `conv-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const outputBuffer =
      typeof conversionResult.data === "string"
        ? Buffer.from(conversionResult.data, "utf8")
        : Buffer.from(conversionResult.data);

    // Save with 1-hour expiration
    saveTempConvertedFile(
      conversionId,
      conversionResult.targetFileName,
      file.name,
      outputBuffer,
      conversionResult.mimeType
    );

    return NextResponse.json({
      success: true,
      conversionId,
      downloadUrl: `/api/convert-3d?id=${conversionId}`,
      targetFileName: conversionResult.targetFileName,
      mimeType: conversionResult.mimeType,
      originalSizeBytes: conversionResult.originalSizeBytes,
      convertedSizeBytes: conversionResult.convertedSizeBytes,
      sizeDiffBytes: conversionResult.sizeDiffBytes,
      sizeDiffPercent: conversionResult.sizeDiffPercent,
      triangleCount: conversionResult.triangleCount,
      vertexCount: conversionResult.vertexCount,
      preservedFeatures: conversionResult.preservedFeatures,
      warnings: conversionResult.warnings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "3D Conversion failed" },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing conversion ID parameter." }, { status: 400 });
    }

    const tempRecord = getTempConvertedFile(id);
    if (!tempRecord) {
      return NextResponse.json(
        {
          error:
            "File expired or not found. Converted 3D files are automatically purged after 1 hour.",
        },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(tempRecord.filePath);
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": tempRecord.metadata.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          tempRecord.metadata.targetFileName
        )}"`,
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to download file" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing conversion ID parameter." }, { status: 400 });
    }

    deleteTempConvertedFile(id);
    return NextResponse.json({ success: true, message: "Temporary artifacts deleted." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to cleanup" }, { status: 500 });
  }
}
