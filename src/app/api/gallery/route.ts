import { NextResponse } from "next/server";
import { getGalleryItems, upsertGalleryItem, deleteGalleryItem } from "@/lib/api-db";
import { isAuthorizedAdmin } from "@/lib/auth-check";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category") || undefined;
  const all = searchParams.get("all") === "true";

  const items = getGalleryItems(categoryId, !all);
  return NextResponse.json(items, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}

export async function POST(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.src) {
      return NextResponse.json({ error: "Image path required" }, { status: 400 });
    }

    upsertGalleryItem(body);
    return NextResponse.json({ success: true, message: "Gallery item saved" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    deleteGalleryItem(id);
    return NextResponse.json({ success: true, message: "Gallery item deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}