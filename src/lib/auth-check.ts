import { verifyAdminSession } from "./api-db";

export function isAuthorizedAdmin(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (verifyAdminSession(token)) return true;
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/mokova_admin_session=([^;]+)/);
  if (match && match[1]) {
    if (verifyAdminSession(match[1])) return true;
  }

  return false;
}