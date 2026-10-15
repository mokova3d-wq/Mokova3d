import { NextResponse } from "next/server";
import { getPromotions, upsertPromotion, deletePromotion } from "@/lib/api-db";
import { isFeatureEnabled, FEATURE_KEYS } from "@/lib/features";
import { isAuthorizedAdmin } from "@/lib/auth-check";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  if (!all && !isFeatureEnabled(FEATURE_KEYS.FLASH_SALES)) {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }

  const promos = getPromotions(!all);
  return NextResponse.json(promos, {
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
    if (!body.product_id || !body.sale_price) {
      return NextResponse.json({ error: "Product ID and Sale Price are required" }, { status: 400 });
    }

    upsertPromotion(body);
    return NextResponse.json({ success: true, message: "Promotion saved" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
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

    deletePromotion(id);
    return NextResponse.json({ success: true, message: "Promotion deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}