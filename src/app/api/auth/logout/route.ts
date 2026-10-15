import { NextResponse } from "next/server";
import { revokeSession } from "@/lib/auth-rbac";

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/mokova_auth_session=([^;]+)/);
  const token = match?.[1];

  if (token) {
    revokeSession(token);
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete("mokova_auth_session");
  res.cookies.delete("mokova_admin_session");
  return res;
}

export async function DELETE(req: Request) {
  return POST(req);
}
