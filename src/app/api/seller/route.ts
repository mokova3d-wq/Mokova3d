import { NextResponse } from "next/server";
import { isFeatureEnabled, FEATURE_KEYS } from "@/lib/features";
import { getSessionUser, canAccessSellerData, recordAuditLog } from "@/lib/auth-rbac";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  // 1. Mandatory Feature Flag Check
  if (!isFeatureEnabled(FEATURE_KEYS.SELLER_MARKETPLACE)) {
    return NextResponse.json(
      { error: "Seller & Creator Marketplace is currently disabled by administrator", code: "FEATURE_DISABLED" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  // 2. Authentication Check
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Enforce Seller / Staff permissions
  const db = getDb();
  if (user.role === "seller") {
    // Seller accesses ONLY their own listings and profile
    const profile = db.prepare("SELECT * FROM seller_profiles WHERE user_id = ?").get(user.id);
    const listings = db.prepare("SELECT * FROM products WHERE sku LIKE ?").all(`%${user.id}%`);
    return NextResponse.json({ profile, listings });
  } else if (["moderator", "operations", "admin", "superadmin"].includes(user.role)) {
    // Staff can review all seller profiles
    const profiles = db.prepare("SELECT * FROM seller_profiles").all();
    return NextResponse.json({ profiles });
  }

  return NextResponse.json({ error: "Access denied. Seller account required." }, { status: 403 });
}

export async function POST(req: Request) {
  // 1. Mandatory Feature Flag Check
  if (!isFeatureEnabled(FEATURE_KEYS.SELLER_MARKETPLACE)) {
    return NextResponse.json(
      { error: "Seller & Creator Marketplace is currently disabled by administrator", code: "FEATURE_DISABLED" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  // 2. Authentication
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const db = getDb();

    // Check if seller profile already exists
    const existing = db.prepare("SELECT id FROM seller_profiles WHERE user_id = ?").get(user.id) as any;
    const profileId = existing ? existing.id : `seller-${Date.now()}`;

    db.prepare(`
      INSERT INTO seller_profiles (id, user_id, store_name, bio, payout_upi, verified, status, created_at)
      VALUES (?, ?, ?, ?, ?, 0, 'PENDING', datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        store_name=excluded.store_name,
        bio=excluded.bio,
        payout_upi=excluded.payout_upi
    `).run(profileId, user.id, body.store_name || "Creator Studio", body.bio || "", body.payout_upi || "");

    recordAuditLog(user.id, user.role, "SELLER_PROFILE_SAVED", "SELLER", profileId, { store_name: body.store_name });

    return NextResponse.json({ success: true, message: "Seller profile registered and pending review." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}