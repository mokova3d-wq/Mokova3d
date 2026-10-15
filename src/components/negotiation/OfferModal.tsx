"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Input, Textarea } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { CatalogProduct } from "@/data/catalog";
import { formatCurrency, createWhatsAppHaggleUrl } from "@/lib/utils";
import { BuyerCounterOfferPayload } from "@/contracts/email.contract";
import { CheckCircle2, AlertTriangle, ShieldCheck, MessageCircle, DollarSign } from "lucide-react";

export interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CatalogProduct;
  onOfferSubmitted?: (offer: BuyerCounterOfferPayload) => void;
}

export function OfferModal({ isOpen, onClose, product, onOfferSubmitted }: OfferModalProps) {
  const [proposedPrice, setProposedPrice] = useState<number>(
    Math.round(product.referencePriceInr * 0.9)
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [rationale, setRationale] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<BuyerCounterOfferPayload | null>(null);

  const variancePercent =
    ((proposedPrice - product.referencePriceInr) / product.referencePriceInr) * 100;
  const isBelowFloor = proposedPrice < product.minOfferFloorInr;

  let varianceAssessment = {
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    label: "Reasonable offer — High probability of seller acceptance",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  };

  if (variancePercent < -25) {
    varianceAssessment = {
      color: "text-red-700 bg-red-50 border-red-200",
      label: "Deep discount — Requires special quantity / batch approval",
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
    };
  } else if (variancePercent < -15) {
    varianceAssessment = {
      color: "text-amber-700 bg-amber-50 border-amber-200",
      label: "Competitive counter-offer — Subject to batch / delivery terms",
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    };
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !proposedPrice) return;

    setIsSubmitting(true);

    const payload: BuyerCounterOfferPayload = {
      workflowType: "BUYER_COUNTER_OFFER",
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      referencePriceUsd: product.referencePriceInr,
      proposedPriceUsd: proposedPrice,
      variancePercentage: Number(variancePercent.toFixed(1)),
      quantity,
      buyer: {
        fullName,
        email: phone || "customer@mokova3d.com",
        phone: phone || undefined,
        country: "India",
      },
      hagglingRationale: rationale || "Customer price negotiation",
      validUntilUtc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      timestampUtc: new Date().toISOString(),
    };

    fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((e) => console.error("Inquiry logging error", e));

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData(payload);
      onOfferSubmitted?.(payload);
    }, 500);
  };

  const handleWhatsAppHaggle = () => {
    const url = createWhatsAppHaggleUrl(product.name, proposedPrice, quantity, rationale);
    window.open(url, "_blank");
    onClose();
  };

  const handleReset = () => {
    setSubmittedData(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={submittedData ? handleReset : onClose}
      title={submittedData ? "Offer Dispatched" : `Make an Offer: ${product.name}`}
      description={
        submittedData
          ? "Your counter-offer has been recorded into the Mokova3D negotiation desk."
          : `Reference Price: ${formatCurrency(product.referencePriceInr)} • SKU: ${product.sku}`
      }
    >
      {submittedData ? (
        <div className="space-y-5 text-center py-4">
          <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#0e0c1d] font-display">
              Counter-Offer Proposal Recorded!
            </h4>
            <p className="text-xs text-[#6a6880] max-w-sm mx-auto">
              You proposed{" "}
              <span className="font-bold text-[#5a45ff]">
                {formatCurrency(submittedData.proposedPriceUsd)}
              </span>{" "}
              for {submittedData.quantity} item(s) ({submittedData.variancePercentage}% variance).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#faf9f7] border border-black/10 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#6a6880]">Token:</span>
              <span className="font-mono font-semibold">
                MKV-NEG-{Math.random().toString(36).substring(2, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6a6880]">Product:</span>
              <span className="font-semibold">{submittedData.productName}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleWhatsAppHaggle}
              className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirm on WhatsApp ↗</span>
            </button>
            <button
              onClick={handleReset}
              className="py-3 px-4 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white font-bold text-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Price Negotiation Calculator */}
          <div className="bg-[#faf9f7] p-4 rounded-2xl border border-black/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0e0c1d]">Your Target Price (INR)</span>
              <span className="font-mono text-[#6a6880]">
                Ref Price: {formatCurrency(product.referencePriceInr)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  min={100}
                  max={product.referencePriceInr * 2}
                  step={10}
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(Number(e.target.value))}
                  prefixSymbol="₹"
                  className="font-bold text-lg text-[#5a45ff] bg-white border-black/15"
                  required
                />
              </div>
              <div className="w-28">
                <Input
                  label="Quantity"
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="bg-white border-black/15 font-semibold"
                  required
                />
              </div>
            </div>

            {/* Quick Haggle Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-[#6a6880]">
                <span>-25% ({formatCurrency(product.referencePriceInr * 0.75)})</span>
                <span className="font-mono font-bold text-[#5a45ff]">
                  Variance: {variancePercent > 0 ? "+" : ""}
                  {variancePercent.toFixed(1)}%
                </span>
                <span>Full Price ({formatCurrency(product.referencePriceInr)})</span>
              </div>
              <input
                type="range"
                min={Math.round(product.referencePriceInr * 0.65)}
                max={product.referencePriceInr}
                step={10}
                value={proposedPrice}
                onChange={(e) => setProposedPrice(Number(e.target.value))}
                className="w-full h-2 bg-[#eeedfb] rounded-lg appearance-none cursor-pointer accent-[#5a45ff]"
              />
            </div>

            {/* Assessment badge */}
            <div
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold ${varianceAssessment.color}`}
            >
              {varianceAssessment.icon}
              <span>{varianceAssessment.label}</span>
            </div>

            {isBelowFloor && (
              <p className="text-[11px] text-amber-700 italic">
                * Note: Price is below standard baseline floor ({formatCurrency(product.minOfferFloorInr)}).
                Please add a note below (e.g. bulk order, college project, repeat customer).
              </p>
            )}
          </div>

          {/* Rationale & Buyer info */}
          <div className="space-y-3">
            <Textarea
              label="Haggling Rationale / Note for Mokova3D"
              placeholder="e.g. Ordering 3 pieces, student project in Delhi, or looking for specific color finish..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={2}
              className="bg-white border-black/15"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Your Name"
                placeholder="Rohan Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-white border-black/15"
                required
              />
              <Input
                label="WhatsApp / Phone Number"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border-black/15"
                required
              />
            </div>
          </div>

          {/* Action triggers */}
          <div className="pt-2 border-t border-black/10 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleWhatsAppHaggle}
              className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Haggle on WhatsApp (Fastest)</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-5 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white font-bold text-xs transition-all cursor-pointer"
            >
              {isSubmitting ? "Logging..." : `Submit Offer (${formatCurrency(proposedPrice * quantity)})`}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}