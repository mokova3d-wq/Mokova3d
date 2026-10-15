"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Scale, CheckCircle2, AlertTriangle, ArrowRight, MessageCircle, DollarSign } from "lucide-react";
import { formatCurrency, createWhatsAppHaggleUrl } from "@/lib/utils";

export function BilateralHaggleDeskSection({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const [testPrice, setTestPrice] = useState(260);
  const refPrice = 299;
  const floorPrice = 240;

  const variancePercent = ((testPrice - refPrice) / refPrice) * 100;
  const isBelowFloor = testPrice < floorPrice;

  const handleTestWhatsApp = () => {
    const url = createWhatsAppHaggleUrl(
      "Desk Companion Print",
      testPrice,
      1,
      "Testing offer variance on Mokova3D Price Desk"
    );
    window.open(url, "_blank");
  };

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 my-20">
      <div className="rounded-[34px] bg-[#faf9f7] border border-black/10 p-8 sm:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Explanation Column */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff]">
            <Scale className="w-3.5 h-3.5" />
            <span>{title || "BILATERAL PRICE DISCOVERY & NEGOTIATION DESK"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-display text-[#0e0c1d] tracking-tight leading-tight">
            Fair Pricing Built Around <br />
            <span className="text-[#5a45ff]">Your Batch &amp; Project Budget.</span>
          </h2>

          <p className="text-sm text-[#6a6880] leading-relaxed max-w-xl">
            {subtitle ||
              "Whether ordering a single bespoke desk companion or fifty corporate pieces, you don't have to accept arbitrary retail markups. Submit your proposed unit price, see instant feasibility feedback, and lock your deal."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-white rounded-2xl border border-black/10">
              <span className="text-[10px] font-mono text-[#6a6880] block font-bold">STEP 01</span>
              <strong className="text-sm text-[#0e0c1d] block mt-0.5">Pick Any Product</strong>
              <span className="text-xs text-[#6a6880] mt-1 block">Or drop your own STL</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-black/10">
              <span className="text-[10px] font-mono text-[#6a6880] block font-bold">STEP 02</span>
              <strong className="text-sm text-[#0e0c1d] block mt-0.5">Propose Your Target</strong>
              <span className="text-xs text-[#6a6880] mt-1 block">Instant variance gauge</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-black/10">
              <span className="text-[10px] font-mono text-[#6a6880] block font-bold">STEP 03</span>
              <strong className="text-sm text-[#0e0c1d] block mt-0.5">Lock &amp; Print</strong>
              <span className="text-xs text-[#6a6880] mt-1 block">&lt;2 hour studio response</span>
            </div>
          </div>
        </div>

        {/* Right Interactive Simulator Column */}
        <div className="lg:col-span-5 bg-white border border-black/10 rounded-[28px] p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-black/10">
            <span className="font-bold text-sm text-[#0e0c1d] font-display">
              Live Negotiation Simulator
            </span>
            <span className="text-[10px] font-mono text-[#5a45ff] font-bold bg-[#eeedfb] px-2 py-0.5 rounded-full">
              INTERACTIVE
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0e0c1d]">Try a Target Price (INR):</span>
              <span className="font-mono text-[#6a6880]">Reference: ₹{refPrice}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5a45ff]">
                  ₹
                </span>
                <input
                  type="number"
                  min={180}
                  max={350}
                  step={10}
                  value={testPrice}
                  onChange={(e) => setTestPrice(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 bg-[#faf9f7] border border-black/15 rounded-xl font-bold font-mono text-base text-[#0e0c1d] focus:outline-none focus:border-[#5a45ff]"
                />
              </div>

              <div className="px-3 py-2 rounded-xl bg-[#faf9f7] border border-black/10 text-xs font-mono font-bold text-[#0e0c1d]">
                {variancePercent > 0 ? "+" : ""}
                {variancePercent.toFixed(1)}%
              </div>
            </div>

            <input
              type="range"
              min={190}
              max={299}
              step={5}
              value={testPrice}
              onChange={(e) => setTestPrice(Number(e.target.value))}
              className="w-full h-2 bg-[#eeedfb] rounded-lg appearance-none cursor-pointer accent-[#5a45ff]"
            />

            {/* Assessment */}
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                isBelowFloor
                  ? "bg-red-50 border-red-200 text-red-800"
                  : variancePercent < -15
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              {isBelowFloor ? (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>
                {isBelowFloor
                  ? "Below standard floor · Requires quantity/student justification"
                  : variancePercent < -15
                  ? "Competitive offer · High probability for 2+ units"
                  : "Feasible offer · Rapid 1-hour acceptance SLA"}
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={handleTestWhatsApp}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Test This Deal on WhatsApp (Fastest)</span>
            </button>

            <Link
              href="/negotiation-guide"
              className="block text-center text-xs font-bold text-[#5a45ff] hover:underline pt-1"
            >
              Read Complete Negotiation Rules &amp; SLA →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}