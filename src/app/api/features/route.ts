import { NextResponse } from "next/server";
import { getFeatureFlags, setFeatureFlag } from "@/lib/features";
import { isAuthorizedAdmin } from "@/lib/auth-check";

export async function GET() {
  const flags = getFeatureFlags();
  return NextResponse.json(flags, {
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
    const { id, enabled, config_json } = await req.json();
    if (!id || typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Feature ID and boolean enabled status required" }, { status: 400 });
    }

    setFeatureFlag(id, enabled, config_json ? JSON.stringify(config_json) : undefined);
    return NextResponse.json({ success: true, message: `Feature ${id} updated` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}