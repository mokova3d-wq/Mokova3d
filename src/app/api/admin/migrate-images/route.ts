import { NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/auth-check";
import {
  migrateExistingImagesToWebP,
  rollbackImageMigration,
} from "@/lib/image-migration";

export async function POST(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await migrateExistingImagesToWebP();
    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${summary.converted} images to WebP (${Math.round(
        summary.bytesSaved / 1024
      )} KB saved).`,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Migration failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await rollbackImageMigration();
    return NextResponse.json({
      success: true,
      message: `Rolled back ${result.rolledBackCount} image references to originals.`,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Rollback failed" }, { status: 500 });
  }
}
