"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Layers, Box, MessageCircle } from "lucide-react";
import { formatCurrency, createWhatsAppProductUrl } from "@/lib/utils";

export function NewArrivalsSection({
  title,
  subtitle,
  onHaggleClick,
}: {
  title?: string;
  subtitle?: string;
  onHaggleClick?: (prod: any) => void;
}) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products/new-arrivals?limit=4")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 my-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{title || "RECENT STUDIO BATCH RELEASES"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#0e0c1d] tracking-tight">
            Freshly Sliced &amp; Calibrated Models
          </h2>
          <p className="text-xs sm:text-sm text-[#6a6880] mt-1 max-w-xl">
            {subtitle ||
              "Recently released physical designs, complete with tuned bed adhesion and precision layer metadata."}
          </p>
        </div>

        <Link
          href="/products"
          className="text-xs font-bold text-[#5a45ff] hover:underline flex items-center gap-1"
        >
          <span>Explore All Batch Prints</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => {
          const waUrl = createWhatsAppProductUrl(p.name, p.price);

          return (
            <div
              key={p.id}
              className="bg-white border border-black/10 rounded-[26px] overflow-hidden p-4 flex flex-col justify-between shadow-xs hover:border-[#5a45ff]/40 transition-all group"
            >
              <div>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#faf9f7] mb-3 border border-black/5">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-mono font-bold text-[#5a45ff] shadow-sm">
                    {p.category_id}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#6a6880] block">
                    SKU: {p.sku} • {p.material}
                  </span>
                  <h3 className="font-bold text-base text-[#0e0c1d] font-display line-clamp-1 group-hover:text-[#5a45ff] transition-colors">
                    <Link href={`/product/${p.id}`}>{p.name}</Link>
                  </h3>
                  <p className="text-xs text-[#6a6880] line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-[#faf9f7] text-[10px] font-mono text-[#0e0c1d] flex justify-between items-center">
                  <span>RES: {p.layer_height || "0.16 mm"}</span>
                  <span>•</span>
                  <span>TIME: {p.print_time || "4.5 Hrs"}</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-black/5 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#6a6880]">Reference</span>
                  <span className="text-base font-bold font-display text-[#5a45ff]">
                    {p.price}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>

                  {onHaggleClick && (
                    <button
                      onClick={() => onHaggleClick(p)}
                      className="py-2 px-2.5 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Haggle
                    </button>
                  )}

                  <Link
                    href={`/product/${p.id}`}
                    className="py-2 px-2.5 rounded-xl border border-black/10 bg-[#faf9f7] hover:bg-[#eeedfb] text-[11px] font-bold text-[#0e0c1d] transition-colors"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}