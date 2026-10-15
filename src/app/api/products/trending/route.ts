import { NextResponse } from "next/server";
import { getTrendingProducts } from "@/lib/api-db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "6", 10);
  const products = getTrendingProducts(limit);
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}