import { getDb } from "./db";
import { cacheGet, cacheSet, cacheInvalidate } from "./cache";

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: number;
  is_implemented: number;
  config_json: string;
  updated_at: string;
}

export const FEATURE_KEYS = {
  RENDERER_3D: "feature_3d_renderer",
  FLASH_SALES: "feature_flash_sales",
  PRICE_NEGOTIATION: "feature_price_negotiation",
  PRINTING_MARKETPLACE: "feature_physical_printing_marketplace",
  SELLER_MARKETPLACE: "feature_seller_marketplace",
  DIGITAL_MODEL_SALES: "feature_digital_model_sales",
  PHYSICAL_PRINTING_SALES: "feature_physical_printing_sales",
  PAYMENTS_PAYOUTS: "feature_payments_payouts",
  AI_RECOMMENDATIONS: "feature_ai_recommendations",
  BROWSER_LLM: "feature_browser_llm",
  USER_UPLOADS: "feature_user_uploads_library",
  CREATOR_LISTINGS: "feature_user_marketplace_listings",
  DIGITAL_DOWNLOADS: "feature_digital_downloads",
  ADVANCED_ANALYSIS: "feature_advanced_analysis",
} as const;

export function getFeatureFlags(): FeatureFlag[] {
  const cacheKey = "system_feature_flags";
  const cached = cacheGet<FeatureFlag[]>(cacheKey);
  if (cached) return cached;

  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM feature_flags
    ORDER BY is_implemented DESC, category ASC, name ASC
  `).all() as unknown as FeatureFlag[];

  cacheSet(cacheKey, rows, 60);
  return rows;
}

export function isFeatureEnabled(featureId: string): boolean {
  const flags = getFeatureFlags();
  const found = flags.find((f) => f.id === featureId);
  return found ? found.enabled === 1 : false;
}

export function setFeatureFlag(featureId: string, enabled: boolean, configJson?: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE feature_flags
    SET enabled = ?, config_json = COALESCE(?, config_json), updated_at = datetime('now')
    WHERE id = ?
  `).run(enabled ? 1 : 0, configJson || null, featureId);

  cacheInvalidate("system_feature_flags");
  cacheInvalidate("promotions_");
  cacheInvalidate("homepage_sections");
}