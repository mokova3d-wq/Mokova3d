import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-rbac";

export async function GET(req: Request) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mfa_enabled: user.mfa_enabled,
    },
  });
}
