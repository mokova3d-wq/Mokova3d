import { NextResponse } from "next/server";
import { getReviews, createReview } from "@/lib/api-db";

const reviewRateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId") || undefined;
  const all = searchParams.get("all") === "true";

  const stats = getReviews(productId, !all);
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const now = Date.now();
    const rateData = reviewRateLimitMap.get(ip);
    if (rateData && now < rateData.resetAt) {
      if (rateData.count >= 5) {
        return NextResponse.json(
          { error: "Too many review submissions from this network. Please wait a few minutes." },
          { status: 429 }
        );
      }
      rateData.count += 1;
    } else {
      reviewRateLimitMap.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    }

    const body = await req.json();
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const authorName = typeof body.authorName === "string" ? body.authorName.trim().slice(0, 60) : "";
    const location = typeof body.location === "string" ? body.location.trim().slice(0, 80) : "Delhi NCR";
    const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 1000) : "";

    if (!productId || productId.length < 1) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    if (!authorName || authorName.length < 2) {
      return NextResponse.json({ error: "Please provide your name (minimum 2 characters)." }, { status: 400 });
    }

    if (!comment || comment.length < 5) {
      return NextResponse.json({ error: "Please provide a review comment (minimum 5 characters)." }, { status: 400 });
    }

    // Strip potential HTML/script injection
    const cleanAuthor = authorName.replace(/[<>]/g, "");
    const cleanComment = comment.replace(/[<>]/g, "");

    const rawRating = typeof body.rating === "number" ? body.rating : parseInt(body.rating, 10) || 5;
    const rating = Math.min(5, Math.max(1, Math.round(rawRating)));

    const review = createReview({
      productId,
      authorName: cleanAuthor,
      location,
      rating,
      comment: cleanComment,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit review" }, { status: 500 });
  }
}
