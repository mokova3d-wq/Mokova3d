import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser, checkRolePermission } from "@/lib/auth-rbac";

export async function GET(req: Request) {
  const user = getSessionUser(req);
  if (!checkRolePermission(user, ["admin", "superadmin"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const db = getDb();
  const users = db.prepare(`
    SELECT id, email, name, role, email_verified, mfa_enabled, 
           failed_login_attempts, locked_until, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `).all();

  return NextResponse.json(users);
}
