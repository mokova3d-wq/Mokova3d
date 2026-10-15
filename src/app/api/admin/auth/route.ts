import { NextResponse } from "next/server";
import { verifyAdminPassword, createAdminSession } from "@/lib/api-db";
import { isAuthorizedAdmin } from "@/lib/auth-check";

const adminAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

export async function GET(req: Request) {
  const isAuth = isAuthorizedAdmin(req);
  return NextResponse.json({ authenticated: isAuth });
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const now = Date.now();
    const rateData = adminAttemptsMap.get(ip);
    if (rateData && now < rateData.lockedUntil) {
      const waitMin = Math.ceil((rateData.lockedUntil - now) / 60000);
      return NextResponse.json(
        { error: `Too many failed login attempts. Account temporarily locked for ${waitMin} minute(s).` },
        { status: 429 }
      );
    }

    const { password } = await req.json();
    if (!password || !verifyAdminPassword(password)) {
      const current = adminAttemptsMap.get(ip) || { count: 0, lockedUntil: 0 };
      current.count += 1;
      if (current.count >= 5) {
        current.lockedUntil = now + 15 * 60 * 1000; // 15 minute lockout
      }
      adminAttemptsMap.set(ip, current);

      return NextResponse.json(
        {
          error: "Invalid admin password",
          remainingAttempts: Math.max(0, 5 - current.count),
        },
        { status: 401 }
      );
    }

    // Success - reset attempts for this IP
    adminAttemptsMap.delete(ip);

    const token = createAdminSession();
    const res = NextResponse.json({ success: true, token });
    res.cookies.set("mokova_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("mokova_admin_session");
  return res;
}