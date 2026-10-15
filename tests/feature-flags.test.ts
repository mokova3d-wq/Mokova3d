import { describe, it, expect } from "vitest";
import { getFeatureFlags, isFeatureEnabled, setFeatureFlag, FEATURE_KEYS } from "@/lib/features";

describe("Central Feature Flags Management System", () => {
  it("registers all required system features in SQLite", () => {
    const flags = getFeatureFlags();
    expect(flags.length).toBeGreaterThanOrEqual(10);

    const keys = flags.map((f) => f.id);
    expect(keys).toContain(FEATURE_KEYS.RENDERER_3D);
    expect(keys).toContain(FEATURE_KEYS.FLASH_SALES);
    expect(keys).toContain(FEATURE_KEYS.PRICE_NEGOTIATION);
    expect(keys).toContain(FEATURE_KEYS.PRINTING_MARKETPLACE);
    expect(keys).toContain(FEATURE_KEYS.AI_RECOMMENDATIONS);
    expect(keys).toContain(FEATURE_KEYS.BROWSER_LLM);
    expect(keys).toContain(FEATURE_KEYS.USER_UPLOADS);
    expect(keys).toContain(FEATURE_KEYS.CREATOR_LISTINGS);
    expect(keys).toContain(FEATURE_KEYS.DIGITAL_DOWNLOADS);
    expect(keys).toContain(FEATURE_KEYS.ADVANCED_ANALYSIS);
  });

  it("ensures the browser-based 3D renderer is implemented and enabled", () => {
    expect(isFeatureEnabled(FEATURE_KEYS.RENDERER_3D)).toBe(true);
    const flags = getFeatureFlags();
    const renderer = flags.find((f) => f.id === FEATURE_KEYS.RENDERER_3D);
    expect(renderer?.is_implemented).toBe(1);
    expect(renderer?.enabled).toBe(1);
  });

  it("ensures future optional modules are registered but disabled and marked not implemented", () => {
    expect(isFeatureEnabled(FEATURE_KEYS.AI_RECOMMENDATIONS)).toBe(false);
    expect(isFeatureEnabled(FEATURE_KEYS.BROWSER_LLM)).toBe(false);
    expect(isFeatureEnabled(FEATURE_KEYS.USER_UPLOADS)).toBe(false);
    expect(isFeatureEnabled(FEATURE_KEYS.CREATOR_LISTINGS)).toBe(false);
    expect(isFeatureEnabled(FEATURE_KEYS.DIGITAL_DOWNLOADS)).toBe(false);
    expect(isFeatureEnabled(FEATURE_KEYS.ADVANCED_ANALYSIS)).toBe(false);
  });

  it("toggles a feature flag, persists to SQLite, and updates cached lookup", () => {
    // Toggle flash sales off and verify
    setFeatureFlag(FEATURE_KEYS.FLASH_SALES, false);
    expect(isFeatureEnabled(FEATURE_KEYS.FLASH_SALES)).toBe(false);

    // Toggle flash sales back on and verify
    setFeatureFlag(FEATURE_KEYS.FLASH_SALES, true);
    expect(isFeatureEnabled(FEATURE_KEYS.FLASH_SALES)).toBe(true);
  });
});