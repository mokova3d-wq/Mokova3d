import { NextResponse } from "next/server";
import { getProducts, upsertProduct, deleteProduct } from "@/lib/api-db";
import { isAuthorizedAdmin } from "@/lib/auth-check";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category") || undefined;
  const all = searchParams.get("all") === "true";

  const products = getProducts(categoryId, !all);
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

export async function POST(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    upsertProduct(body);
    return NextResponse.json({ success: true, message: "Product saved" });
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

    deleteProduct(id);
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}