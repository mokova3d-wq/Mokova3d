import { describe, it, expect } from "vitest";
import { getPages, getPageBySlug, upsertPage, getPageRevisions } from "@/lib/api-db";

describe("Legal & Informational CMS and Statutory Disclosures", () => {
  it("loads all 10 statutory Indian legal and informational pages from SQLite", () => {
    const pages = getPages(false);
    expect(pages.length).toBeGreaterThanOrEqual(10);

    const slugs = pages.map((p) => p.slug);
    expect(slugs).toContain("about");
    expect(slugs).toContain("terms");
    expect(slugs).toContain("privacy");
    expect(slugs).toContain("returns");
    expect(slugs).toContain("shipping");
    expect(slugs).toContain("cookies");
    expect(slugs).toContain("buyer-seller-terms");
    expect(slugs).toContain("ip-policy");
    expect(slugs).toContain("acceptable-use");
    expect(slugs).toContain("grievance");
  });

  it("verifies statutory grievance officer details and 48-hour timeline in grievance policy", () => {
    const grievancePage = getPageBySlug("grievance");
    expect(grievancePage).toBeDefined();
    expect(grievancePage?.content_html).toContain("Grievance Redressal Officer");
    expect(grievancePage?.content_html).toContain("48 hours");
    expect(grievancePage?.content_html).toContain("Consumer Protection (E-Commerce) Rules, 2020");
  });

  it("verifies DPDP Act 2023 data principal rights in privacy policy", () => {
    const privacyPage = getPageBySlug("privacy");
    expect(privacyPage).toBeDefined();
    expect(privacyPage?.content_html).toContain("Digital Personal Data Protection Act, 2023");
    expect(privacyPage?.content_html).toContain("Data Principal");
  });

  it("verifies custom on-demand 3D printing return terms in refund policy", () => {
    const returnsPage = getPageBySlug("returns");
    expect(returnsPage).toBeDefined();
    expect(returnsPage?.content_html).toContain("Custom On-Demand & Personalized Prints");
    expect(returnsPage?.content_html).toContain("48 hours of delivery");
  });

  it("updates page content, increments version, and records audit revision in SQLite", () => {
    const initial = getPageBySlug("about");
    const initialVersion = initial ? initial.version : 1;

    upsertPage(
      {
        slug: "about",
        title: "About Mokova3D Studio (Updated)",
        category: "Company",
        summary: "Updated company summary test.",
        content_html: "<p>Updated craftsmanship narrative.</p>",
        published: 1,
      },
      "test_admin",
      "Automated test revision"
    );

    const updated = getPageBySlug("about");
    expect(updated).toBeDefined();
    expect(updated?.title).toBe("About Mokova3D Studio (Updated)");
    expect(updated?.version).toBe(initialVersion + 1);

    const revisions = getPageRevisions("about");
    expect(revisions.length).toBeGreaterThan(0);
    expect(revisions[0].note).toBe("Automated test revision");
    expect(revisions[0].author).toBe("test_admin");
  });
});