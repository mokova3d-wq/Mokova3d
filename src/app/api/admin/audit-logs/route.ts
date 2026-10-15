import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser, checkRolePermission } from "@/lib/auth-rbac";

export async function GET(req: Request) {
  const user = getSessionUser(req);
  if (!checkRolePermission(user, ["admin", "superadmin"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const db = getDb();
  const logs = db.prepare(`
    SELECT id, actor_id, actor_role, action, target_type, target_id, 
           details_json, ip_address, created_at
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset) as any[];

  const total = (db.prepare("SELECT count(*) as count FROM audit_logs").get() as any)?.count || 0;

  return NextResponse.json({ logs, total });
}
