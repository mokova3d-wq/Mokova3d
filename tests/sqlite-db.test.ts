import { describe, it, expect } from "vitest";
import {
  getProducts,
  getCategories,
  getFaqs,
  getGalleryItems,
  getSiteConfig,
  recordInquiry,
  getInquiries,
  getReviews,
  createReview,
} from "@/lib/api-db";

describe("SQLite Database Persistence & Caching", () => {
  it("loads products from SQLite with required schema fields", () => {
    const products = getProducts(undefined, false);
    expect(products.length).toBeGreaterThan(0);
    const cat = products.find((p) => p.id === "cat");
    expect(cat).toBeDefined();
    expect(cat?.name).toBe("Cute Cat");
  });

  it("loads categories with proper sort orders", () => {
    const categories = getCategories(false);
    expect(categories.length).toBe(8);
  });

  it("loads FAQs from SQLite", () => {
    const faqs = getFaqs(false);
    expect(faqs.length).toBe(16);
  });

  it("loads gallery items from SQLite", () => {
    const gallery = getGalleryItems(undefined, false);
    expect(gallery.length).toBe(60);
  });

  it("records customer price inquiries into SQLite", () => {
    const id = recordInquiry({
      type: "OFFER",
      product_name: "Roly-Poly Penguin",
      proposed_price: 250,
      quantity: 1,
      buyer_name: "Test Buyer",
      buyer_phone: "+91 9999999999",
      rationale: "Automated test inquiry",
    });

    expect(id).toBeDefined();
    const all = getInquiries();
    const found = all.find((i) => i.id === id);
    expect(found).toBeDefined();
    expect(found?.buyer_name).toBe("Test Buyer");
    expect(found?.proposed_price).toBe(250);
  });

  it("fetches seeded reviews with stats and records new client review", () => {
    const stats = getReviews("cat", true);
    expect(stats.totalReviews).toBeGreaterThan(0);
    expect(stats.averageRating).toBeGreaterThanOrEqual(4);
    expect(stats.ratingDistribution).toBeDefined();

    const created = createReview({
      productId: "cat",
      authorName: "Ananya Deshmukh",
      location: "South Delhi",
      rating: 5,
      comment: "Super smooth finish and adorable cat model! High quality print.",
    });

    expect(created.id).toBeDefined();
    expect(created.author_name).toBe("Ananya Deshmukh");

    const updated = getReviews("cat", true);
    expect(updated.totalReviews).toBe(stats.totalReviews + 1);
  });
});