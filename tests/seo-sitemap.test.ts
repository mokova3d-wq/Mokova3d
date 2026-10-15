import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("Production SEO & Metadata Integrity", () => {
  it("generates a comprehensive sitemap with all core, legal, and product routes", () => {
    const site = sitemap();
    expect(site.length).toBeGreaterThanOrEqual(15);

    const urls = site.map((entry) => entry.url);
    expect(urls).toContain("https://mokova3d.com");
    expect(urls).toContain("https://mokova3d.com/products");
    expect(urls).toContain("https://mokova3d.com/renderer");
    expect(urls).toContain("https://mokova3d.com/gallery");
    expect(urls).toContain("https://mokova3d.com/terms");
    expect(urls).toContain("https://mokova3d.com/privacy");
    expect(urls).toContain("https://mokova3d.com/shipping");
    expect(urls).toContain("https://mokova3d.com/returns");

    // Must contain product routes
    const productRoutes = urls.filter((u) => u.includes("/product/"));
    expect(productRoutes.length).toBeGreaterThan(0);
  });

  it("configures robots.txt to index public pages and disallow admin endpoints", () => {
    const rob = robots();
    expect(rob.sitemap).toBe("https://mokova3d.com/sitemap.xml");

    const rules = Array.isArray(rob.rules) ? rob.rules[0] : rob.rules;
    expect(rules).toBeDefined();
    expect(rules?.allow).toBe("/");
    expect(rules?.disallow).toContain("/admin");
    expect(rules?.disallow).toContain("/api/admin");
  });
});
