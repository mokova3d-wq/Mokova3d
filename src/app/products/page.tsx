"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { MOKOVA_PRODUCTS, CatalogProduct } from "@/data/catalog";
import { createWhatsAppProductUrl } from "@/lib/utils";

const OfferModal = dynamic(
  () => import("@/components/negotiation/OfferModal").then((mod) => mod.OfferModal),
  { ssr: false }
);
import {
  Search,
  Box,
  MessageCircle,
  SlidersHorizontal,
  ArrowRight,
  Filter,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", name: "All Products" },
  { id: "cute-fun", name: "Cute & Fun Figures" },
  { id: "home-decor", name: "Home Décor" },
  { id: "spiritual-devotional", name: "Spiritual & Devotional" },
  { id: "lamps-lighting", name: "Lamps & Lighting" },
  { id: "collectibles-miniatures", name: "Collectibles & Miniatures" },
  { id: "custom-3d-printing", name: "Custom 3D Printing" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeOfferProduct, setActiveOfferProduct] = useState<CatalogProduct | null>(null);
  const [productsList, setProductsList] = useState(MOKOVA_PRODUCTS);
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            sku: d.sku,
            name: d.name,
            subtitle: d.description || d.name,
            category: d.category_id,
            categoryId: d.category_id,
            priceDisplay: d.price,
            referencePriceInr: d.reference_price,
            minOfferFloorInr: d.min_offer_floor,
            pricingModel: (d.pricing_model || "FIXED_OR_HAGGLE") as any,
            image: d.image,
            gallery: typeof d.gallery === "string" ? JSON.parse(d.gallery || "[]") : (d.gallery || [d.image]),
            shortDescription: d.description,
            fullOverview: d.full_overview,
            printSpecs: {
              technology: "FDM Precision 3D Printing",
              material: d.material || "PLA Matte",
              layerHeight: d.layer_height || "0.16 mm",
              infillPercentage: d.infill || "20%",
              printTimeHours: d.print_time || "4.5 Hours",
              dimensionsMm: d.dimensions || "90 ? 80 ? 120 mm",
            },
            features: ["Custom color options", "Delhi NCR fast delivery"],
            model3D: {
              id: d.model_3d_type || d.id,
              assetUrl: d.model_3d_path || `/models/${d.id}.glb`,
              format: "glb" as const,
              byteSize: 3200000,
              dracoCompressed: true,
              triangleCount: 42000,
              dimensions: { widthMm: 90, heightMm: 120, depthMm: 80 },
              posterFallbackUrl: d.image,
            },
          }));
          setProductsList(mapped);
        }
      })
      .catch(() => {});

    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategoriesList([
            { id: "all", name: "All Products" },
            ...data.map((c: any) => ({ id: c.id, name: c.name })),
          ]);
        }
      })
      .catch(() => {});
  }, []);


  const filteredProducts = useMemo(() => {
    return productsList.filter((prod) => {
      const matchesCategory =
        selectedCategory === "all" || prod.categoryId === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen pb-24">
      {/* Page Hero */}
      <section className="page-hero py-16 px-4 sm:px-6">
        <div className="wrap text-center max-w-2xl mx-auto space-y-3">
          <div className="kicker">MOKOVA SHOP</div>
          <h1 className="text-4xl sm:text-5xl font-bold font-display text-white">
            Shop 3D Printed Things You’ll Love.
          </h1>
          <p className="text-base text-white/80 leading-relaxed">
            Browse by category, search the collection and open any design to inspect in 3D, ask for
            prices on WhatsApp, or make a counter-offer.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="wrap my-12 space-y-8">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white border border-black/10 rounded-2xl shadow-sm">
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#5a45ff] text-white shadow-sm"
                    : "bg-[#eeedfb]/60 text-[#6a6880] hover:text-[#0e0c1d] hover:bg-[#eeedfb]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6a6880]" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#5a45ff]"
            />
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#6a6880]">
          <span>
            Showing <strong className="text-[#0e0c1d]">{filteredProducts.length}</strong> items in{" "}
            <span className="font-semibold text-[#5a45ff]">
              {categoriesList.find((c) => c.id === selectedCategory)?.name}
            </span>
          </span>
          <span className="font-mono">Delhi &amp; NCR Fast Courier</span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center bg-white border border-black/10 rounded-3xl space-y-3">
            <Box className="w-10 h-10 text-[#6a6880] mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-[#0e0c1d] font-display">
              No matching products found
            </h3>
            <p className="text-xs text-[#6a6880] max-w-sm mx-auto">
              Looking for something specific? Send us a reference photo or STL file on WhatsApp and
              we will print it for you!
            </p>
            <Link href="/contact" className="btn dark text-xs inline-flex mt-2">
              Start Custom 3D Order
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((prod) => {
              const waUrl = createWhatsAppProductUrl(prod.name, prod.priceDisplay);
              const rating = 4.8;
              const reviewCount = Math.floor(Math.random() * 30) + 8;
              const dims = prod.printSpecs?.dimensionsMm || "";

              return (
                <div
                  key={prod.id}
                  className="bg-white border border-black/10 rounded-[22px] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_32px_64px_-24px_rgba(60,40,200,0.28)] group"
                >
                  {/* Image — object-contain on a neutral bg avoids blank space on thin models */}
                  <Link href={`/product/${prod.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-[#f5f4f2]">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#5a45ff] shadow-sm">
                          {prod.category}
                        </span>
                      </div>
                      {dims && (
                        <div className="absolute bottom-2 right-2">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white">
                            {dims}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 flex flex-col flex-1 space-y-2.5">
                    {/* Name */}
                    <h3 className="text-[14px] font-bold text-[#0e0c1d] font-display group-hover:text-[#5a45ff] transition-colors leading-snug">
                      <Link href={`/product/${prod.id}`}>{prod.name}</Link>
                    </h3>

                    {/* Short description */}
                    <p className="text-[11px] text-[#6a6880] line-clamp-2 leading-relaxed">
                      {prod.shortDescription}
                    </p>

                    {/* Rating row */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg key={s} className={`w-3 h-3 ${s <= 4 ? "text-[#f59e0b]" : "text-[#e5e7eb]"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-[#6a6880]">{rating} ({reviewCount})</span>
                    </div>

                    {/* Material pill */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#faf9f7] border border-black/10 text-[#6a6880]">
                        {prod.printSpecs?.material?.split(" ")[0] || "PLA"}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                        Ready to Print
                      </span>
                    </div>

                    {/* Price + actions */}
                    <div className="mt-auto pt-2 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-[#6a6880] block">Price</span>
                          <span className="text-[17px] font-bold font-display text-[#5a45ff]">
                            {prod.priceDisplay}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6a6880] font-mono">from ₹{prod.minOfferFloorInr}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/product/${prod.id}`} className="flex-1">
                          <button className="w-full py-2 px-2.5 rounded-xl border border-black/10 bg-[#faf9f7] hover:bg-[#eeedfb] text-[11px] font-bold text-[#0e0c1d] transition-colors cursor-pointer">
                            View Details
                          </button>
                        </Link>
                        <button
                          onClick={() => setActiveOfferProduct(prod)}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Haggle Price
                        </button>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Ask on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Offer Modal */}
      {activeOfferProduct && (
        <OfferModal
          isOpen={!!activeOfferProduct}
          onClose={() => setActiveOfferProduct(null)}
          product={activeOfferProduct}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="wrap py-24 text-center text-sm font-semibold text-[#6a6880]">Loading Mokova3D Catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}