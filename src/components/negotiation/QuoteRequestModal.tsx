"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Input, Textarea } from "@/components/common/Input";
import { CatalogProduct } from "@/data/catalog";
import { PriceQuoteRequestPayload } from "@/contracts/email.contract";
import { FileText, CheckCircle2 } from "lucide-react";

export interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CatalogProduct;
  onQuoteRequested?: (payload: PriceQuoteRequestPayload) => void;
}

export function QuoteRequestModal({
  isOpen,
  onClose,
  product,
  onQuoteRequested,
}: QuoteRequestModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsSubmitting(true);

    const payload: PriceQuoteRequestPayload = {
      workflowType: "PRICE_QUOTE_REQUEST",
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantityRequested: quantity,
      buyer: {
        fullName,
        email,
        companyName: company || undefined,
        country: "India",
      },
      customRequirementsNotes: notes,
      timestampUtc: new Date().toISOString(),
    };

    fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((e) => console.error("Inquiry logging error", e));

    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
      onQuoteRequested?.(payload);
    }, 500);
  };

  const handleClose = () => {
    setIsDone(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isDone ? "Quote Request Submitted" : `Request Quote: ${product.name}`}
      description={
        isDone
          ? "Our sales team has received your inquiry."
          : `SKU: ${product.sku} • Fast Delivery across Delhi & NCR`
      }
    >
      {isDone ? (
        <div className="space-y-4 text-center py-4">
          <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-[#0e0c1d] font-display">
            Quotation Request Recorded!
          </h4>
          <p className="text-xs text-[#6a6880] max-w-sm mx-auto">
            A comprehensive commercial quote has been queued. We will follow up directly at{" "}
            <span className="text-[#5a45ff] font-bold">{email}</span>.
          </p>
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Return to Product
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Estimated Units Needed"
              type="number"
              min={1}
              max={500}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
            <Input
              label="City / Pincode"
              placeholder="Delhi, Gurgaon, Noida..."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full Name"
              placeholder="Rohan Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="WhatsApp Phone / Email"
              placeholder="+91 9876543210"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Specific Requirements / Material / Colors"
            placeholder="e.g. Matte black finish, custom scale height 15cm, or gift packaging..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#6a6880] hover:text-[#0e0c1d]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-5 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting..." : "Submit Quote Request"}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}