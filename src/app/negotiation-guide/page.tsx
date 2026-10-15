import React from "react";
import Link from "next/link";
import { Scale, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, MessageCircle } from "lucide-react";

export default function NegotiationGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen space-y-10 text-[#0e0c1d]">
      <div className="space-y-3 pb-6 border-b border-black/10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eeedfb] text-xs font-bold text-[#5a45ff]">
          <Scale className="w-3.5 h-3.5" />
          Price Discovery &amp; Commercial Haggle Protocol
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-[#0e0c1d] tracking-tight">
          How Direct Equipment &amp; 3D Print Haggling Operates
        </h1>
        <p className="text-sm text-[#6a6880] leading-relaxed max-w-2xl">
          At Mokova3D, we believe in fair, transparent price discovery. Whether you are ordering a
          batch of custom client gifts, an engineered prototype, or home décor, our negotiation
          desk allows you to propose custom offers directly to our Delhi studio team.
        </p>
      </div>

      {/* 3 Step Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-black/10 rounded-3xl space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#eeedfb] text-[#5a45ff] font-display font-bold flex items-center justify-center text-sm">
            01
          </div>
          <h3 className="text-base font-bold text-[#0e0c1d] font-display">Pick or Upload</h3>
          <p className="text-xs text-[#6a6880] leading-relaxed">
            Choose a catalog design or drop your own STL / OBJ file into our Custom 3D Studio to check
            dimensions and materials.
          </p>
        </div>

        <div className="p-6 bg-white border border-black/10 rounded-3xl space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#eeedfb] text-[#5a45ff] font-display font-bold flex items-center justify-center text-sm">
            02
          </div>
          <h3 className="text-base font-bold text-[#0e0c1d] font-display">Submit Counter-Offer</h3>
          <p className="text-xs text-[#6a6880] leading-relaxed">
            Propose a target unit price (INR), select quantity, and write a quick note (e.g. bulk order,
            student budget, or matching quote).
          </p>
        </div>

        <div className="p-6 bg-white border border-black/10 rounded-3xl space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#eeedfb] text-[#5a45ff] font-display font-bold flex items-center justify-center text-sm">
            03
          </div>
          <h3 className="text-base font-bold text-[#0e0c1d] font-display">Fast Seller Resolution</h3>
          <p className="text-xs text-[#6a6880] leading-relaxed">
            Within 2 hours, our studio confirms your price, shares photos of filament color swatches,
            and starts printing.
          </p>
        </div>
      </div>

      {/* Variance Matrix */}
      <div className="p-8 bg-white border border-black/10 rounded-[30px] space-y-5 shadow-xs">
        <h2 className="text-lg font-bold font-display text-[#0e0c1d]">Offer Variance Guidelines</h2>
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block text-[#0e0c1d]">
                0% to -12% Variance (Competitive Offer)
              </span>
              <span className="text-emerald-800">
                Instantly prioritized. Approved in under 1 hour for standard bio-PLA and PETG prints.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block text-[#0e0c1d]">
                -13% to -24% Variance (Quantity &amp; Volume Terms)
              </span>
              <span className="text-amber-800">
                Evaluated against batch size (2+ units), infill requirements, and local Delhi NCR delivery.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900">
            <Scale className="w-4 h-4 text-[#5a45ff] mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block text-[#0e0c1d]">
                Bulk &amp; Corporate Gifting Discretion
              </span>
              <span className="text-purple-800">
                For 10+ pieces or wedding return gifts, reach out directly on WhatsApp for special bulk wholesale rates.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-black/10">
        <Link href="/products" className="btn dark text-xs font-bold py-3 px-6">
          <span>Explore Equipment &amp; Prints</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <a
          href="https://wa.me/918527373680?text=Hi%20Mokova3D%2C%20I%20have%20a%20price%20question%20regarding%20bulk%203D%20printing."
          target="_blank"
          rel="noopener noreferrer"
          className="btn wa text-xs font-bold py-3 px-6 flex items-center gap-2 shadow-xs"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Discuss Directly on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}