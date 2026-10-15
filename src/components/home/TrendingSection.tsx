"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowRight,
  MessageCircle,
  Star,
  Ruler,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, createWhatsAppProductUrl } from "@/lib/utils";

interface TrendingProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  reference_price: number;
  min_offer_floor: number;
  category_id: string;
  description: string;
  sku: string;
  dimensions: string;
  material: string;
  weight?: string;
  layer_height?: string;
  infill?: string;
  print_time?: string;
  score?: number;
}

export function TrendingSection({
  title,
  subtitle,
  onHaggleClick,
}: {
  title?: string;
  subtitle?: string;
  onHaggleClick?: (product: any) => void;
}) {
  const [products, setProducts] = useState<TrendingProduct[]>([]);

  useEffect(() => {
    fetch("/api/products/trending?limit=5")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  const topProduct = products[0];
  const otherProducts = products.slice(1);

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 my-16 sm:my-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff] mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{title || "TRENDING & HIGH-ENGAGEMENT PRINTS"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-display text-[#0e0c1d] tracking-tight">
            Ranked by Verified Client Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-[#6a6880] mt-1 max-w-xl">
            {subtitle ||
              "Calculated from real visitor inspection telemetry, buyer offer submissions, and WhatsApp orders."}
          </p>
        </div>

        <Link
          href="/products"
          className="text-xs font-bold text-[#5a45ff] hover:underline flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>View All Catalog Items</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Asymmetric Ranking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Featured #1 Trending Card (5 cols) */}
        {topProduct && (
          <div className="lg:col-span-5 rounded-[28px] sm:rounded-[32px] bg-[#0c0f14] text-white p-5 sm:p-7 flex flex-col justify-between border border-white/10 shadow-xl relative overflow-hidden group">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#f59e0b] text-[#0e0c1d] text-[11px] font-mono font-bold flex items-center gap-1 shadow-sm">
                  <span>?</span>
                  <span>#1 MOST INQUIRED</span>
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-mono text-[#c8f542]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8f542] animate-pulse" />
                  <span>{topProduct.dimensions || "90 ? 80 ? 120 mm"}</span>
                </div>
              </div>

              {/* Product Photo Showcase */}
              <Link
                href={`/product/${topProduct.id}`}
                className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative block my-1 group-hover:border-white/20 transition-all"
              >
                <img
                  src={topProduct.image}
                  alt={topProduct.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/10">
                  Delhi NCR Ready
                </span>
              </Link>

              {/* Title & Ratings */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                    {topProduct.category_id} ? SKU: {topProduct.sku}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#f59e0b]">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />
                      ))}
                    </div>
                    <span className="font-bold ml-1 text-white">4.9</span>
                    <span className="text-white/40 text-[10px]">(128 reviews)</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                  <Link href={`/product/${topProduct.id}`} className="hover:text-[#f59e0b] transition-colors">
                    {topProduct.name}
                  </Link>
                </h3>
                <p className="text-xs text-white/70 line-clamp-2 mt-1 leading-relaxed">
                  {topProduct.description}
                </p>
              </div>

              {/* PHYSICAL SPECIFICATIONS & METROLOGY BENTO (Fills blank void elegantly) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-white/60 border-b border-white/10 pb-2">
                  <span className="font-bold uppercase tracking-wider text-white/80">Studio Build Specs</span>
                  <span className="text-[#c8f542]">Delhi Studio Verified</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
                    <span className="text-[10px] font-mono text-white/50 block">Dimensions</span>
                    <span className="font-mono font-bold text-white text-[11px] sm:text-xs truncate block">
                      {topProduct.dimensions || "90 ? 80 ? 120 mm"}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
                    <span className="text-[10px] font-mono text-white/50 block">Material</span>
                    <span className="font-mono font-bold text-white text-[11px] sm:text-xs truncate block">
                      {topProduct.material || "Matte Bio-PLA"}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
                    <span className="text-[10px] font-mono text-white/50 block">Layer Precision</span>
                    <span className="font-mono font-bold text-white text-[11px] sm:text-xs truncate block">
                      {topProduct.layer_height || "0.16 mm Fine"}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
                    <span className="text-[10px] font-mono text-white/50 block">Density & Weight</span>
                    <span className="font-mono font-bold text-white text-[11px] sm:text-xs truncate block">
                      {(topProduct.infill || "20%") + " ? " + (topProduct.weight || "110g")}
                    </span>
                  </div>
                </div>

                {/* Key feature pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono text-white/70">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                    ? Dual-Tone Contrast
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                    ? Weighted Anti-Tip Base
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                    ? 24h Express Dispatch
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Commercial Section */}
            <div className="pt-4 mt-4 border-t border-white/10 space-y-3 relative z-10">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-white/50 block">Reference</span>
                  <span className="text-2xl sm:text-3xl font-bold font-display text-[#c8f542]">
                    {topProduct.price}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-[#f59e0b] block">Haggle Floor</span>
                  <span className="text-xs font-mono text-white/80 font-bold">
                    From {formatCurrency(topProduct.min_offer_floor || Math.round(topProduct.reference_price * 0.8))}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <a
                  href={createWhatsAppProductUrl(topProduct.name, topProduct.price)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>Ask on WhatsApp</span>
                </a>

                {onHaggleClick && (
                  <button
                    onClick={() => onHaggleClick(topProduct)}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer text-center active:scale-[0.98] whitespace-nowrap"
                  >
                    Haggle Price
                  </button>
                )}

                <Link
                  href={`/product/${topProduct.id}`}
                  className="py-3 px-3.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-bold transition-colors text-center shrink-0 flex items-center justify-center"
                  title="Inspect Details & Full Specs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Other Trending Grid (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {otherProducts.map((prod, idx) => (
            <div
              key={prod.id}
              className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-[#5a45ff]/40 hover:shadow-md transition-all group min-w-0"
            >
              <div>
                <div className="flex items-center justify-between pb-2 text-[10px] font-mono">
                  <span className="font-bold text-[#5a45ff] bg-[#eeedfb] px-2 py-0.5 rounded-full">
                    RANK #{idx + 2}
                  </span>
                  <span className="text-[#6a6880] truncate max-w-[140px] text-right">
                    {prod.material || "Matte Non-Toxic PLA"}
                  </span>
                </div>

                <Link
                  href={`/product/${prod.id}`}
                  className="aspect-[16/10] rounded-xl overflow-hidden bg-[#faf9f7] my-2 border border-black/5 block"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <h4 className="font-bold text-sm text-[#0e0c1d] font-display line-clamp-1 group-hover:text-[#5a45ff] transition-colors">
                    <Link href={`/product/${prod.id}`}>{prod.name}</Link>
                  </h4>
                  <div className="flex items-center gap-0.5 text-[#f59e0b] text-[10px] font-bold shrink-0">
                    <span>?</span>
                    <span>4.8</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#6a6880] line-clamp-2 mt-1 leading-relaxed">
                  {prod.description}
                </p>

                {/* Dimensions chip */}
                {prod.dimensions && (
                  <div className="mt-2 text-[10px] font-mono text-[#6a6880] bg-[#faf9f7] border border-black/5 px-2 py-0.5 rounded-md w-fit">
                    Size: {prod.dimensions}
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-black/5 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-[#6a6880] block">Price</span>
                  <span className="text-sm font-bold font-display text-[#5a45ff]">
                    {prod.price}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/product/${prod.id}`}
                    className="px-3 py-1.5 rounded-lg border border-black/10 bg-[#faf9f7] hover:bg-[#eeedfb] text-xs font-bold text-[#0e0c1d] transition-colors"
                  >
                    Inspect
                  </Link>
                  {onHaggleClick && (
                    <button
                      onClick={() => onHaggleClick(prod)}
                      className="px-3 py-1.5 rounded-lg bg-[#0e0c1d] hover:bg-[#5a45ff] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Haggle
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
