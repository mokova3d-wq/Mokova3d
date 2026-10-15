import { NextResponse } from "next/server";
import { getHomepageSections, upsertHomepageSection } from "@/lib/api-db";
import { isAuthorizedAdmin } from "@/lib/auth-check";

export async function GET() {
  const sections = getHomepageSections();
  return NextResponse.json(sections, {
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
    if (Array.isArray(body)) {
      for (const sec of body) {
        upsertHomepageSection(sec);
      }
    } else {
      upsertHomepageSection(body);
    }
    return NextResponse.json({ success: true, message: "Homepage sections saved" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}