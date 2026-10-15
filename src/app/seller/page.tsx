"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Store, ShieldAlert, ArrowLeft, CheckCircle2, Lock, Sparkles, Upload } from "lucide-react";

export default function SellerPortalPage() {
  const [isMarketplaceActive, setIsMarketplaceActive] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/features")
      .then((r) => r.json())
      .then((flags) => {
        if (Array.isArray(flags)) {
          const m = flags.find((f: any) => f.id === "feature_seller_marketplace");
          setIsMarketplaceActive(m ? m.enabled === 1 : false);
        } else {
          setIsMarketplaceActive(false);
        }
      })
      .catch(() => setIsMarketplaceActive(false));
  }, []);

  if (isMarketplaceActive === false) {
    return (
      <div className="min-h-screen wrap py-24 text-center space-y-5">
        <div className="w-16 h-16 bg-amber-500/10 text-[#f59e0b] rounded-3xl flex items-center justify-center mx-auto border border-amber-500/30">
          <Lock className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff]">
          FEATURE STAGING &amp; LOCKED
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-[#0e0c1d] tracking-tight">
          Seller &amp; Creator Marketplace Inactive
        </h1>
        <p className="text-sm text-[#6a6880] max-w-lg mx-auto leading-relaxed">
          The multi-vendor Creator &amp; Seller Marketplace is currently disabled by administrative policy.
          Only authorized Superadmins can activate this module from the administrative security console.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link href="/" className="btn dark text-xs font-bold py-3 px-6">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Return to Studio Storefront</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen wrap py-12 space-y-8">
      <div className="pb-6 border-b border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-xs font-mono font-bold text-emerald-800 border border-emerald-200 mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>CREATOR MARKETPLACE · ACTIVE</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-[#0e0c1d]">Seller &amp; Creator Dashboard</h1>
          <p className="text-xs text-[#6a6880] mt-1">
            Manage your personal 3D model listings, physical print allocations, orders, and payout settings.
          </p>
        </div>
      </div>

      <div className="p-8 bg-white border border-black/10 rounded-3xl shadow-sm text-center space-y-4">
        <Sparkles className="w-8 h-8 text-[#5a45ff] mx-auto" />
        <h2 className="text-xl font-bold font-display text-[#0e0c1d]">Welcome, 3D Maker!</h2>
        <p className="text-xs text-[#6a6880] max-w-md mx-auto">
          Your seller account allows you to upload print-ready models, set pricing parameters, and monitor customer orders across Delhi NCR.
        </p>
      </div>
    </div>
  );
}