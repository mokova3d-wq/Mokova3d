"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";

export function CuratedCollectionsSection({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 my-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff] mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>{title || "ATELIER CURATED COLLECTIONS"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#0e0c1d] tracking-tight">
            Explore Collections by Form &amp; Function
          </h2>
          <p className="text-xs sm:text-sm text-[#6a6880] mt-1 max-w-xl">
            {subtitle ||
              "Editorial groupings curated by physical application, material density, and spatial aesthetic."}
          </p>
        </div>

        <Link
          href="/products"
          className="text-xs font-bold text-[#5a45ff] hover:underline flex items-center gap-1.5"
        >
          <span>All 8 Collections</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[220px]">
        {/* Large Bento Card */}
        {categories[0] && (
          <Link
            href={`/products?category=${categories[0].id}`}
            className="category-bento-card sm:col-span-2 sm:row-span-2 relative group overflow-hidden"
            style={{
              backgroundImage: `url('${categories[0].image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all" />
            <div className="relative z-10">
              <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-[#c8f542] mb-1">
                SIGNATURE STUDIO COLLECTION
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-display mb-1">
                {categories[0].name}
              </h3>
              <p className="text-xs text-white/80 max-w-md">{categories[0].description}</p>
            </div>
          </Link>
        )}

        {/* Other categories */}
        {categories.slice(1, 7).map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className="category-bento-card relative group overflow-hidden"
            style={{
              backgroundImage: `url('${cat.image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent group-hover:from-black/95 transition-all" />
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white font-display mb-1">{cat.name}</h3>
              <p className="text-[11px] text-white/75 line-clamp-1">{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}