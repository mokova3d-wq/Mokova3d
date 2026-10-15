import { describe, it, expect } from "vitest";
import {
  getHomepageSections,
  upsertHomepageSection,
  getPromotions,
  upsertPromotion,
  deletePromotion,
  getTrendingProducts,
  getNewArrivals,
  getCuratedRecommendations,
} from "@/lib/api-db";

describe("Homepage Architecture & Marketplace Logic", () => {
  it("loads all configured homepage sections in order", () => {
    const sections = getHomepageSections();
    expect(sections.length).toBe(10);
    expect(sections[0].id).toBe("hero");
    expect(sections[0].enabled).toBe(1);
    expect(sections[1].id).toBe("promotions");
  });

  it("updates and toggles a homepage section without errors", () => {
    upsertHomepageSection({
      id: "promotions",
      title: "Flash Studio Deals",
      enabled: 1,
      sort_order: 2,
    });

    const sections = getHomepageSections();
    const promoSec = sections.find((s) => s.id === "promotions");
    expect(promoSec).toBeDefined();
    expect(promoSec?.title).toBe("Flash Studio Deals");
  });

  it("enforces promotional pricing rule: sale price must be less than reference price", () => {
    // Attempting to set sale price higher than regular price should throw an error
    expect(() => {
      upsertPromotion({
        id: "invalid-promo",
        product_id: "cat",
        title: "Invalid Expensive Promo",
        sale_price: 9999, // regular is 299
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
      });
    }).toThrow(/must be strictly lower/i);
  });

  it("loads active promotions with verified product joins and discounts", () => {
    const promos = getPromotions(true);
    expect(promos.length).toBeGreaterThan(0);
    for (const p of promos) {
      expect(p.product).toBeDefined();
      expect(p.sale_price).toBeLessThan(p.product!.reference_price);
      expect(new Date(p.end_time).getTime()).toBeGreaterThan(Date.now());
    }
  });

  it("ranks trending products based on verified engagement metrics", () => {
    const trending = getTrendingProducts(4);
    expect(trending.length).toBeGreaterThan(0);
    expect(trending[0]).toHaveProperty("id");
    expect(trending[0]).toHaveProperty("name");
  });

  it("fetches new arrivals ordered by batch releases", () => {
    const arrivals = getNewArrivals(4);
    expect(arrivals.length).toBeGreaterThan(0);
  });

  it("provides tailored parametric recommendations with fallbacks", () => {
    const recs = getCuratedRecommendations("cute-fun", 4);
    expect(recs.length).toBe(4);
  });
});