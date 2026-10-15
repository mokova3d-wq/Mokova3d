import { NextResponse } from "next/server";
import { getCuratedRecommendations } from "@/lib/api-db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const limit = parseInt(searchParams.get("limit") || "6", 10);
  const products = getCuratedRecommendations(category, limit);
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}