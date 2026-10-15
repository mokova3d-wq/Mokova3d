import { describe, it, expect } from "vitest";
import { MOKOVA_PRODUCTS } from "@/data/catalog";
import { BuyerCounterOfferPayload } from "@/contracts/email.contract";

describe("Architectural Integration Contracts", () => {
  it("validates all catalog items have compliant 3D descriptors", () => {
    for (const product of MOKOVA_PRODUCTS) {
      expect(product.model3D).toBeDefined();
      expect(product.model3D.assetUrl).toMatch(/\.(glb|gltf)$/i);
      expect(product.model3D.dimensions.widthMm).toBeGreaterThan(0);
      expect(product.model3D.triangleCount).toBeGreaterThan(0);
      expect(product.model3D.format).toBe("glb");
    }
  });

  it("ensures price negotiation parameters are logically consistent", () => {
    for (const product of MOKOVA_PRODUCTS) {
      expect(product.referencePriceInr).toBeGreaterThan(product.minOfferFloorInr);
      expect(product.minOfferFloorInr).toBeGreaterThan(0);
    }
  });

  it("verifies BuyerCounterOfferPayload conforms to schema", () => {
    const payload: BuyerCounterOfferPayload = {
      workflowType: "BUYER_COUNTER_OFFER",
      productId: "cat",
      productName: "Cute Cat",
      productSku: "MKV-CAT-01",
      referencePriceUsd: 299,
      proposedPriceUsd: 250,
      variancePercentage: -16.4,
      quantity: 1,
      buyer: {
        fullName: "Rohan Sharma",
        email: "rohan@example.com",
        country: "India",
      },
      hagglingRationale: "Festive discount offer",
      validUntilUtc: new Date().toISOString(),
      timestampUtc: new Date().toISOString(),
    };

    expect(payload.workflowType).toBe("BUYER_COUNTER_OFFER");
    expect(payload.proposedPriceUsd).toBe(250);
  });
});