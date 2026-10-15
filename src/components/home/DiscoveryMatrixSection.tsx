"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Sliders, Box, ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { formatCurrency, createWhatsAppProductUrl } from "@/lib/utils";

const INTENTS = [
  { id: "all", label: "Studio Overview", categoryId: "all" },
  { id: "cute-fun", label: "Desk Companions", categoryId: "cute-fun" },
  { id: "lamps-lighting", label: "Ambient Lighting", categoryId: "lamps-lighting" },
  { id: "spiritual-devotional", label: "Spiritual & Sacred", categoryId: "spiritual-devotional" },
  { id: "collectibles-miniatures", label: "Collectibles & Models", categoryId: "collectibles-miniatures" },
  { id: "custom-3d-printing", label: "Custom Slicing", categoryId: "custom-3d-printing" },
];

export default function DiscoveryMatrixSection({
  title,
  subtitle,
  onHaggleClick,
}: {
  title?: string;
  subtitle?: string;
  onHaggleClick?: (prod: any) => void;
}) {
  const [selectedIntent, setSelectedIntent] = useState("all");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const cat = selectedIntent === "all" ? "" : `?category=${selectedIntent}`;
    fetch(`/api/products/recommendations${cat}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecommendations(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedIntent]);

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 my-20">
      <div className="bg-[#faf9f7] border border-black/10 rounded-[34px] p-6 sm:p-10 shadow-xs space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{title || "ENGINEERED DISCOVERY MATRIX"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#0e0c1d] tracking-tight">
              Curated Parametric Recommendations
            </h2>
            <p className="text-xs sm:text-sm text-[#6a6880] mt-1 max-w-xl">
              {subtitle ||
                "Filter by intended placement and use case. Each recommendation includes verified material and layer resolution metrics."}
            </p>
          </div>

          {/* Intent Tag Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {INTENTS.map((intent) => (
              <button
                key={intent.id}
                onClick={() => setSelectedIntent(intent.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedIntent === intent.id
                    ? "bg-[#5a45ff] text-white shadow-xs"
                    : "bg-white border border-black/10 text-[#6a6880] hover:text-[#0e0c1d]"
                }`}
              >
                {intent.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Specimen Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((prod) => {
            const waUrl = createWhatsAppProductUrl(prod.name, prod.price);

            return (
              <div
                key={prod.id}
                className="bg-white border border-black/10 rounded-2xl overflow-hidden p-5 flex flex-col justify-between shadow-xs hover:border-[#5a45ff]/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#6a6880] pb-2">
                    <span className="font-bold text-[#5a45ff] bg-[#eeedfb] px-2 py-0.5 rounded-full">
                      {prod.category_id}
                    </span>
                    <span>SKU: {prod.sku}</span>
                  </div>

                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#faf9f7] my-3 border border-black/5 relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h3 className="font-bold text-base text-[#0e0c1d] font-display line-clamp-1 group-hover:text-[#5a45ff] transition-colors">
                    <Link href={`/product/${prod.id}`}>{prod.name}</Link>
                  </h3>
                  <p className="text-xs text-[#6a6880] line-clamp-2 mt-1 leading-relaxed">
                    {prod.description}
                  </p>

                  {/* Technical annotation specs */}
                  <div className="mt-3 p-3 bg-[#faf9f7] rounded-xl border border-black/5 text-[11px] font-mono text-[#0e0c1d] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#6a6880]">Dimensions:</span>
                      <span className="font-semibold">{prod.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6a6880]">Material:</span>
                      <span className="font-semibold">{prod.material}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-black/5 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#6a6880] block">
                        Price
                      </span>
                      <span className="text-xl font-bold font-display text-[#5a45ff]">
                        {prod.price}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Delhi NCR Ready
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {onHaggleClick && (
                      <button
                        onClick={() => onHaggleClick(prod)}
                        className="py-2.5 px-3 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Haggle
                      </button>
                    )}

                    <Link
                      href={`/product/${prod.id}`}
                      className="py-2.5 px-3 rounded-xl border border-black/10 bg-[#faf9f7] hover:bg-[#eeedfb] text-xs font-bold text-[#0e0c1d] transition-colors"
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