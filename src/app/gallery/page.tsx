"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Filter,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ArrowRight,
  Layers,
  Box,
  Compass,
  SlidersHorizontal,
  Share2,
  Eye,
  CheckCircle2,
} from "lucide-react";

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category_id?: string;
  tag?: string;
  sort_order?: number;
  linkedProductId?: string;
  specs?: {
    material: string;
    layerHeight: string;
    infill: string;
    dispatch: string;
  };
}

const CATEGORIES = [
  { id: "ALL", label: "All Works" },
  { id: "lamps-lighting", label: "Lamps & Ambient" },
  { id: "cute-fun", label: "Cute Collectibles" },
  { id: "collectibles-miniatures", label: "Miniatures & Models" },
  { id: "home-decor", label: "Home & Living" },
  { id: "spiritual-devotional", label: "Spiritual & Sacred" },
  { id: "functional-utility", label: "Engineering & Utility" },
];

// Product link resolver for creations matching existing catalog models
const PRODUCT_MAP: Record<string, { id: string; name: string }> = {
  "Ambient Silhouette Shadow Lamp": { id: "lamp", name: "Custom Shadow Lamp" },
  "Custom Lithophane Cylindrical Lamp": { id: "lamp", name: "Custom Shadow Lamp" },
  "Mandala Shadow Projection Lamp": { id: "lamp", name: "Custom Shadow Lamp" },
  "Cute Cat Desk Companion": { id: "cat", name: "Cute Cat Desk Companion" },
  "Roly-Poly Penguin Mascot": { id: "penguin", name: "Roly-Poly Penguin" },
  "Lord Ganesha Sacred Idol (0.16mm)": { id: "ganesha", name: "Sacred Ganesha Figurine" },
  "Blessing Ganesha Desk Figurine": { id: "ganesha", name: "Sacred Ganesha Figurine" },
  "Stylized Character Figurine Collective": { id: "friends", name: "3D Printed Friends" },
  "Articulated Flexible Dragon Fidget": { id: "flexible", name: "Articulated Flexible Characters" },
  "Aerodynamic Supersonic Scale Model": { id: "airplane", name: "Aerodynamic Mini Models" },
  "Precision Aerospace Jet Prototype": { id: "airplane", name: "Aerodynamic Mini Models" },
};

export default function EditorialGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"curated" | "alpha">("curated");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch real database items
  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: GalleryItem[] = data.map((d: any, index: number) => {
            const prod = PRODUCT_MAP[d.title];
            return {
              id: d.id || `gal-${index}`,
              src: d.src || "/assets/hero.jpg",
              title: d.title || "Studio Creation",
              category_id: d.category_id || "collectibles-miniatures",
              tag: d.tag || "Studio Print",
              sort_order: d.sort_order || index,
              linkedProductId: prod ? prod.id : undefined,
              specs: {
                material: "Premium Matte Bio-PLA",
                layerHeight: "0.16 mm Resolution",
                infill: "20% Gyroid Core",
                dispatch: "Delhi NCR Studio Craft",
              },
            };
          });
          setItems(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Filter & Search logic
  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory !== "ALL") {
      result = result.filter(
        (item) =>
          item.category_id?.toLowerCase() === selectedCategory.toLowerCase() ||
          item.tag?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.tag?.toLowerCase().includes(q) ||
          item.category_id?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "alpha") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result = [...result].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }

    return result;
  }, [items, selectedCategory, searchQuery, sortBy]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const activeLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="min-h-screen pb-28 bg-[#faf9f7] text-[#0e0c1d]">
      {/* ── EDITORIAL ATELIER HERO ──────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0c0f14] via-[#121622] to-[#0c0f14] text-white pt-16 pb-20 px-4 sm:px-8 border-b border-white/10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#5a45ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#eeedfb]/15 text-xs font-mono font-bold text-[#c8f542] border border-[#c8f542]/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#c8f542]" />
              <span>DELHI NCR PHYSICAL ATELIER</span>
            </span>
            <span className="text-xs font-mono text-white/50">
              • Visual Survey of Real Studio Builds
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight leading-[1.08]">
                Curated 3D Print <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
                  Retrospective Archive.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
                An artistic visual collection of physical commissions, warm shadow lamps, articulated collectibles, and precision prototypes crafted layer-by-layer right here in Delhi.
              </p>
            </div>

            {/* Atelier Key Telemetry Chips */}
            <div className="lg:col-span-4 flex flex-wrap lg:flex-col gap-2.5 lg:items-end text-xs font-mono">
              <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/90 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>60 Verified Physical Pieces</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80">
                0.16 mm Precision Resolution
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80">
                Matte Bio-PLA • Tough PETG • Resin
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CURATION CONTROLS BAR (SEARCH, CATEGORIES & SORT) ──────── */}
      <section className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-black/10 py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#0e0c1d] text-white shadow-xs"
                    : "bg-[#faf9f7] text-[#6a6880] hover:text-[#0e0c1d] hover:bg-[#eeedfb]/60 border border-black/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input & Sort Selector */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6a6880]" />
              <input
                type="text"
                placeholder="Search creations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#faf9f7] border border-black/10 text-xs font-semibold text-[#0e0c1d] focus:outline-none focus:border-[#5a45ff]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6a6880] hover:text-[#0e0c1d]"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-[#faf9f7] border border-black/10 text-xs font-bold text-[#0e0c1d] focus:outline-none cursor-pointer"
            >
              <option value="curated">Curated Order</option>
              <option value="alpha">Title A–Z</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL DISCOVERY GRID ────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 my-10 space-y-10">
        <div className="flex items-center justify-between text-xs text-[#6a6880] font-mono">
          <span>
            SHOWING <strong className="text-[#0e0c1d]">{filteredItems.length}</strong> CURATED CREATIONS
          </span>
          <span className="hidden sm:inline">Click any piece to open full-resolution darkroom inspection</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-black/10 space-y-3">
            <p className="text-sm font-bold text-[#0e0c1d]">No studio creations found matching your filter.</p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
              className="text-xs font-bold text-[#5a45ff] hover:underline cursor-pointer"
            >
              Clear filters and view all works →
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Spotlight Hero Banner (Featured 1st Item when viewing All) */}
            {selectedCategory === "ALL" && !searchQuery && filteredItems[0] && (
              <div className="rounded-[32px] overflow-hidden bg-gradient-to-br from-[#0c0f14] via-[#121622] to-[#0c0f14] text-white border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-stretch group">
                <div
                  onClick={() => setLightboxIndex(0)}
                  className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto overflow-hidden bg-black/60 cursor-pointer min-h-[300px]"
                >
                  <img
                    src={filteredItems[0].src}
                    alt={filteredItems[0].title}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#f59e0b] text-[#0e0c1d] text-[11px] font-mono font-bold shadow-md">
                    ATELIER SPOTLIGHT
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#c8f542]">
                      {filteredItems[0].tag || "Featured Studio Piece"}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-white leading-tight">
                      {filteredItems[0].title}
                    </h2>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Custom manufactured with tuned retraction and precision matte PLA. Exhibits crisp contour transitions and smooth layer consistency.
                    </p>

                    <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono text-white/80">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[9px] text-white/40 block">LAYER HEIGHT</span>
                        <strong>0.16 mm Precision</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[9px] text-white/40 block">MATERIAL</span>
                        <strong>Matte Bio-PLA</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setLightboxIndex(0)}
                      className="px-4 py-2.5 rounded-xl bg-white text-[#0e0c1d] font-bold text-xs flex items-center gap-1.5 transition-all hover:bg-[#faf9f7] cursor-pointer shadow-sm"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Inspect Creation</span>
                    </button>

                    {filteredItems[0].linkedProductId && (
                      <Link
                        href={`/product/${filteredItems[0].linkedProductId}`}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>View Catalog Specimen</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Asymmetric Staggered Visual Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.slice(selectedCategory === "ALL" && !searchQuery ? 1 : 0).map((item, idx) => {
                const actualIndex = selectedCategory === "ALL" && !searchQuery ? idx + 1 : idx;
                const isWide = actualIndex % 7 === 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => setLightboxIndex(actualIndex)}
                    className={`group relative rounded-3xl overflow-hidden bg-white border border-black/10 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                      isWide ? "sm:col-span-2" : ""
                    }`}
                  >
                    {/* Visual Media Frame with Varied Aspect Proportions */}
                    <div
                      className={`relative overflow-hidden bg-[#faf9f7] ${
                        isWide ? "aspect-[16/9]" : actualIndex % 3 === 0 ? "aspect-[4/5]" : "aspect-square"
                      }`}
                    >
                      <img
                        src={item.src}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 text-white">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-[#c8f542] border border-white/10">
                            {item.tag || "Studio Build"}
                          </span>
                          <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[11px] font-mono text-white/70">
                            Delhi Studio • 0.16mm Layer
                          </p>
                          <h4 className="text-base font-bold font-display text-white line-clamp-1">
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Curatorial Card Footer */}
                    <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-white border-t border-black/5">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono uppercase text-[#6a6880] tracking-wider block">
                          {item.tag || "Custom 3D Print"}
                        </span>
                        <h3 className="text-sm font-bold font-display text-[#0e0c1d] truncate group-hover:text-[#5a45ff] transition-colors mt-0.5">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          title="Open Darkroom Lightbox"
                          className="p-2 rounded-xl bg-[#faf9f7] hover:bg-[#eeedfb] text-[#0e0c1d] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ATELIER CUSTOM PRINT COMMISSION INVITATION ─────────── */}
        <section className="rounded-[32px] p-8 sm:p-12 bg-gradient-to-br from-[#0c0f14] via-[#121622] to-[#0c0f14] text-white border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mt-16">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-mono font-bold text-[#c8f542] uppercase tracking-wider block">
              HAVE A UNIQUE DIGITAL MODEL OR CONCEPT?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white leading-tight">
              Commission a Custom Print in Our Delhi Studio.
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Upload your own STL, OBJ, or 3MF file to inspect dimensions and request an exact quote, or send a napkin sketch for custom CAD modeling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-xl bg-[#5a45ff] hover:bg-[#4330e6] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all"
            >
              <span>Open Custom Print Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/renderer"
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
            >
              <Compass className="w-4 h-4 text-[#c8f542]" />
              <span>3D Model Workspace</span>
            </Link>
          </div>
        </section>
      </main>

      {/* ── DARKROOM LIGHTBOX MODAL ─────────────────────────────── */}
      {activeLightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[92vh] bg-[#0c0f14] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row text-white"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Visual Media Viewer */}
            <div className="relative md:flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[420px]">
              <img
                src={activeLightboxItem.src}
                alt={activeLightboxItem.title}
                className="max-h-[80vh] w-auto max-w-full object-contain p-2"
              />

              {/* Prev / Next Controls */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Previous Creation (ArrowLeft)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Next Creation (ArrowRight)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Curatorial Details Sidebar */}
            <div className="w-full md:w-80 lg:w-96 p-6 sm:p-8 flex flex-col justify-between space-y-6 border-t md:border-t-0 md:border-l border-white/10 bg-[#121622]">
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#c8f542] block">
                    {activeLightboxItem.tag || "Studio Build"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                    {activeLightboxItem.title}
                  </h3>
                  <p className="text-xs text-white/60 font-mono mt-0.5">
                    Crafted in Delhi NCR • Verified Studio Finished
                  </p>
                </div>

                {/* Print Specifications Bento */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Print Medium:</span>
                    <strong className="text-white">Matte Bio-PLA</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Layer Resolution:</span>
                    <strong className="text-white">0.16 mm Micron</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Infill Architecture:</span>
                    <strong className="text-white">20% Gyroid Core</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Quality Audit:</span>
                    <strong className="text-emerald-400">100% Watertight</strong>
                  </div>
                </div>

                {activeLightboxItem.linkedProductId && (
                  <Link
                    href={`/product/${activeLightboxItem.linkedProductId}`}
                    className="p-3 rounded-xl bg-[#5a45ff]/15 border border-[#5a45ff]/40 text-[#5a45ff] hover:bg-[#5a45ff]/25 flex items-center justify-between text-xs font-bold transition-colors"
                  >
                    <span>View Catalog Product Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4 border-t border-white/10">
                <a
                  href={`https://wa.me/918527373680?text=${encodeURIComponent(
                    `Hi Mokova3D! I'm viewing this creation in your gallery: "${activeLightboxItem.title}". Can you provide details and pricing for this print in Delhi NCR?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire Print on WhatsApp</span>
                </a>

                <Link
                  href="/renderer"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors text-center"
                >
                  <Box className="w-3.5 h-3.5 text-[#c8f542]" />
                  <span>Inspect in 3D Studio</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
