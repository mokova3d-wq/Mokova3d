import { NextResponse } from "next/server";
import { getSiteConfig, setSiteConfig } from "@/lib/api-db";
import { isAuthorizedAdmin } from "@/lib/auth-check";

export async function GET() {
  const config = getSiteConfig();
  return NextResponse.json(config, {
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
    for (const [k, v] of Object.entries(body)) {
      setSiteConfig(k, String(v));
    }
    return NextResponse.json({ success: true, message: "Settings saved" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}