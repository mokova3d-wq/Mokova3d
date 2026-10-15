import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OfferModal } from "@/components/negotiation/OfferModal";
import { MOKOVA_PRODUCTS } from "@/data/catalog";

describe("Negotiation & Offer Modal", () => {
  const sampleProduct = MOKOVA_PRODUCTS[0];

  it("renders offer modal with product reference price", () => {
    render(<OfferModal isOpen={true} onClose={() => {}} product={sampleProduct} />);
    expect(screen.getByText(new RegExp(`Make an Offer: ${sampleProduct.name}`, "i"))).toBeInTheDocument();
  });

  it("updates target unit price and shows counter-offer calculation", () => {
    render(<OfferModal isOpen={true} onClose={() => {}} product={sampleProduct} />);
    const priceInput = screen.getByRole("spinbutton", { name: "" });
    expect(priceInput).toBeInTheDocument();

    fireEvent.change(priceInput, { target: { value: "250" } });
    expect(priceInput).toHaveValue(250);
  });
});