"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { History, ArrowRight } from "lucide-react";

export function RecentlyViewedSection({ title, subtitle }: { title?: string; subtitle?: string }) {
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mokova_recent_views");
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        if (Array.isArray(ids) && ids.length > 0) {
          fetch("/api/products?all=true")
            .then((r) => r.json())
            .then((all) => {
              if (Array.isArray(all)) {
                const filtered = ids
                  .map((id) => all.find((p: any) => p.id === id))
                  .filter(Boolean)
                  .slice(0, 5);
                setRecentProducts(filtered);
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {}
  }, []);

  if (recentProducts.length === 0) return null;

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 my-16">
      <div className="flex items-center justify-between pb-6 border-b border-black/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff] mb-2">
            <History className="w-3.5 h-3.5" />
            <span>{title || "YOUR ACTIVE INSPECTION TRAIL"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0e0c1d] tracking-tight">
            Continue Where You Left Off
          </h2>
          <p className="text-xs text-[#6a6880] mt-0.5">
            {subtitle || "Recently examined studio prints stored privately in your browser."}
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("mokova_recent_views");
            setRecentProducts([]);
          }}
          className="text-xs font-semibold text-[#6a6880] hover:text-red-600 transition-colors cursor-pointer"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-6">
        {recentProducts.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="p-3 bg-white border border-black/10 rounded-2xl group hover:border-[#5a45ff]/40 transition-all shadow-xs block"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-[#faf9f7] mb-2 border border-black/5">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <strong className="block text-xs font-bold text-[#0e0c1d] font-display truncate">
              {p.name}
            </strong>
            <span className="text-[11px] font-bold text-[#5a45ff] font-mono block mt-0.5">
              {p.price}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}