import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth-rbac";

export async function POST(req: Request) {
  try {
    const { email, password, mfaCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const result = await authenticateUser(email, password, mfaCode, ipAddress, userAgent);

    if (!result.success) {
      if (result.requiresMfa) {
        return NextResponse.json({ requiresMfa: true, error: result.error }, { status: 401 });
      }
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const res = NextResponse.json({
      success: true,
      user: {
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name,
        role: result.user!.role,
      },
      token: result.token,
    });

    res.cookies.set("mokova_auth_session", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
