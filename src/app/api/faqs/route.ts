import { NextResponse } from "next/server";
import { getFaqs, upsertFaq, deleteFaq } from "@/lib/api-db";
import { isAuthorizedAdmin } from "@/lib/auth-check";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  const faqs = getFaqs(!all);
  return NextResponse.json(faqs, {
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
    if (!body.question || !body.answer) {
      return NextResponse.json({ error: "Question and Answer required" }, { status: 400 });
    }

    upsertFaq(body);
    return NextResponse.json({ success: true, message: "FAQ saved" });
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

    deleteFaq(id);
    return NextResponse.json({ success: true, message: "FAQ deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}