"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Flame, Tag, ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { formatCurrency, createWhatsAppProductUrl } from "@/lib/utils";

interface PromotionItem {
  id: string;
  product_id: string;
  title: string;
  sale_price: number;
  start_time: string;
  end_time: string;
  badge: string;
  product: {
    id: string;
    name: string;
    image: string;
    price: string;
    reference_price: number;
    category_id: string;
    description: string;
    sku: string;
    dimensions?: string;
    material?: string;
  };
}

export function FlashPromotionsSection({ title, subtitle }: { title?: string; subtitle?: string }) {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/promotions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPromotions(data);
        }
      })
      .catch(() => {});
  }, []);

  // Live countdown timer calculation
  useEffect(() => {
    if (promotions.length === 0) return;

    const updateTimers = () => {
      const now = Date.now();
      const updated: Record<string, string> = {};

      for (const p of promotions) {
        const end = new Date(p.end_time).getTime();
        const diff = Math.max(0, end - now);

        if (diff <= 0) {
          updated[p.id] = "EXPIRED";
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          updated[p.id] = `${hours.toString().padStart(2, "0")}h : ${minutes
            .toString()
            .padStart(2, "0")}m : ${seconds.toString().padStart(2, "0")}s`;
        }
      }
      setTimeRemaining(updated);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [promotions]);

  // If no active valid promotions, don't show empty marketing filler
  const activePromos = promotions.filter((p) => timeRemaining[p.id] !== "EXPIRED");
  if (activePromos.length === 0) return null;

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 my-16">
      <div className="rounded-[32px] bg-[#0c0f14] border border-[#f59e0b]/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-white/10 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f59e0b]/15 text-xs font-mono font-bold text-[#f59e0b] border border-[#f59e0b]/30 mb-2">
              <Flame className="w-3.5 h-3.5" />
              <span>{title || "STUDIO BATCH FLASH ALLOCATIONS"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-tight">
              Limited-Time Print Bed Allocations
            </h2>
            <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl">
              {subtitle ||
                "Verified promotional pricing direct from our scheduled print runs. Valid while production slots remain open."}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#c8f542]">
            <ShieldCheck className="w-4 h-4" />
            <span>Guaranteed Studio Quality</span>
          </div>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-8 relative z-10">
          {activePromos.map((promo) => {
            const savings = promo.product.reference_price - promo.sale_price;
            const savingsPercent = Math.round((savings / promo.product.reference_price) * 100);
            const waUrl = createWhatsAppProductUrl(
              `${promo.product.name} (Flash Promo: ?${promo.sale_price})`,
              `?${promo.sale_price}`
            );

            return (
              <div
                key={promo.id}
                className="bg-[#12161f] border border-white/10 rounded-2xl overflow-hidden p-5 sm:p-6 flex flex-col sm:flex-row gap-5 hover:border-[#f59e0b]/50 transition-all duration-300 group shadow-lg min-w-0"
              >
                {/* Product Image */}
                <div className="relative w-full sm:w-44 md:w-48 aspect-square rounded-xl overflow-hidden bg-black/40 shrink-0 border border-white/10">
                  <img
                    src={promo.product.image}
                    alt={promo.product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#f59e0b] text-[#0e0c1d] text-[10px] font-mono font-bold shadow-md">
                    {promo.badge}
                  </span>
                </div>

                {/* Details & Live Countdown */}
                <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono">
                      <span className="uppercase tracking-wider text-white/50">
                        {promo.product.category_id} ? SKU: {promo.product.sku}
                      </span>
                      {promo.product.dimensions && (
                        <span className="text-[#c8f542] bg-[#c8f542]/10 px-2 py-0.5 rounded font-bold">
                          {promo.product.dimensions}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-display leading-snug">
                      <Link href={`/product/${promo.product_id}`} className="hover:text-[#f59e0b] transition-colors">
                        {promo.product.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                      {promo.title}
                    </p>

                    {/* Ratings & material snippet */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <div className="flex items-center gap-1 text-[#f59e0b] font-bold">
                        <span>? 4.9</span>
                        <span className="text-white/40 font-normal">(95+ orders)</span>
                      </div>
                      <span className="text-white/30">?</span>
                      <span className="text-white/60 truncate">
                        {promo.product.material || "Matte Non-Toxic PLA"}
                      </span>
                    </div>
                  </div>

                  {/* Price & Savings */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-display text-[#c8f542]">
                          {formatCurrency(promo.sale_price)}
                        </span>
                        <span className="text-xs font-mono text-white/40 line-through">
                          {formatCurrency(promo.product.reference_price)}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#f59e0b] block mt-0.5">
                        Save {formatCurrency(savings)} ({savingsPercent}% OFF)
                      </span>
                    </div>

                    {/* Countdown Timer Badge */}
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] font-mono text-white/50 flex items-center sm:justify-end gap-1 mb-0.5">
                        <Clock className="w-3 h-3 text-[#f59e0b]" />
                        <span>TIME REMAINING</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-md inline-block">
                        {timeRemaining[promo.id] || "Calculating..."}
                      </span>
                    </div>
                  </div>

                  {/* Action Triggers */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md text-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Claim Deal on WhatsApp</span>
                    </a>

                    <Link
                      href={`/product/${promo.product_id}`}
                      className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors text-center shrink-0"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}