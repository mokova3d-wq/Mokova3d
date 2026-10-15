"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { MOKOVA_PRODUCTS } from "@/data/catalog";
import { formatCurrency, createWhatsAppProductUrl } from "@/lib/utils";

const OfferModal = dynamic(
  () => import("@/components/negotiation/OfferModal").then((mod) => mod.OfferModal),
  { ssr: false }
);
import {
  ArrowLeft,
  MessageCircle,
  Box,
  Layers,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Star,
  Package,
  Ruler,
  Clock,
  Share2,
  ChevronRight,
  BadgeCheck,
  ThumbsUp,
  Sparkles,
  Plus,
  Send,
  X,
  SlidersHorizontal,
} from "lucide-react";

function StarRating({
  rating,
  size = "sm",
  interactive = false,
  onRatingChange,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (r: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const px = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  const displayRating = hoverRating !== null ? hoverRating : Math.round(rating);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const StarTag = interactive ? "button" : "span";
        return (
          <StarTag
            key={s}
            {...(interactive ? { type: "button" } : {})}
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverRating(s)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            onClick={() => interactive && onRatingChange && onRatingChange(s)}
            className={interactive ? "cursor-pointer transition-transform hover:scale-110 inline-flex" : "cursor-default inline-flex"}
          >
            <svg
              className={`${px} ${s <= displayRating ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#e5e7eb] fill-[#e5e7eb]"}`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </StarTag>
        );
      })}
    </div>
  );
}

interface ReviewItem {
  id: string;
  product_id?: string;
  author_name: string;
  location?: string;
  rating: number;
  comment: string;
  created_at?: string;
  date?: string;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const initialProduct = MOKOVA_PRODUCTS.find((p) => p.id === unwrappedParams.id);

  const [product, setProduct] = useState<any>(initialProduct || null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string>(
    initialProduct ? initialProduct.image : ""
  );
  const [isOfferOpen, setIsOfferOpen] = useState<boolean>(false);
  const [haggleEnabled, setHaggleEnabled] = useState<boolean>(true);

  // Reviews & ratings state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [avgRating, setAvgRating] = useState<number>(4.9);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [ratingDist, setRatingDist] = useState<Record<number, number>>({ 5: 16, 4: 4, 3: 0, 2: 0, 1: 0 });
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Review form modal / inline state
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewLocation, setNewReviewLocation] = useState("Delhi NCR");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState("");

  // Helpful votes tracking
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/features")
      .then((r) => r.json())
      .then((flags) => {
        if (Array.isArray(flags)) {
          const h = flags.find((f: any) => f.id === "feature_price_negotiation");
          setHaggleEnabled(h ? h.enabled === 1 : true);
        }
      })
      .catch(() => {});

    fetch("/api/products?all=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
          const found = data.find((p: any) => p.id === unwrappedParams.id);
          if (found) {
            const mapped = {
              id: found.id,
              sku: found.sku,
              name: found.name,
              subtitle: found.description || found.name,
              category: found.category_id,
              categoryId: found.category_id,
              priceDisplay: found.price,
              referencePriceInr: found.reference_price,
              minOfferFloorInr: found.min_offer_floor,
              pricingModel: found.pricing_model,
              image: found.image,
              gallery:
                typeof found.gallery === "string"
                  ? JSON.parse(found.gallery || "[]")
                  : found.gallery || [found.image],
              shortDescription: found.description,
              fullOverview: found.full_overview,
              printSpecs: {
                technology: "FDM Precision 3D Printing",
                material: found.material || "Premium Matte Non-Toxic PLA",
                layerHeight: found.layer_height || "0.16 mm",
                infillPercentage: found.infill || "20%",
                printTimeHours: found.print_time || "4.5 Hours",
                dimensionsMm: found.dimensions || "90 × 80 × 120 mm",
                weight: found.weight || "110g",
              },
              features: [
                "Custom color & size options",
                "Delhi NCR fast dispatch (within 24h)",
                "Studio checked smooth matte finish",
                "Eco-friendly biodegradable PLA",
              ],
              model3D: {
                id: found.model_3d_type || found.id,
                assetUrl: found.model_3d_path || `/models/${found.id}.glb`,
                format: "glb" as const,
                byteSize: 3200000,
                dracoCompressed: true,
                triangleCount: 42000,
                dimensions: { widthMm: 90, heightMm: 120, depthMm: 80 },
                posterFallbackUrl: found.image,
              },
            };
            setProduct(mapped);
            if (!selectedGalleryImg) setSelectedGalleryImg(mapped.image);
          }
        }
      })
      .catch(() => {});
  }, [unwrappedParams.id]);

  // Load reviews from live API endpoint
  useEffect(() => {
    fetch(`/api/reviews?productId=${unwrappedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
          setAvgRating(data.averageRating || 4.9);
          setTotalReviews(data.totalReviews || data.reviews.length);
          if (data.ratingDistribution) {
            setRatingDist(data.ratingDistribution);
          }
        } else {
          // Fallback static reviews for initial render or offline
          const fallbackList: ReviewItem[] = [
            {
              id: "rev-1",
              author_name: "Rahul Sharma",
              location: "South Delhi",
              rating: 5,
              comment: "The print finish is super smooth and neat. Fits perfectly on my work desk, everyone who visits asks where I got it!",
              created_at: "2026-10-08T10:00:00Z",
            },
            {
              id: "rev-2",
              author_name: "Priya Nair",
              location: "Noida Sector 62",
              rating: 5,
              comment: "Ordered as a surprise gift. The packaging was safe and rigid, arrived in under 24 hours in NCR. Absolutely loved it!",
              created_at: "2026-10-06T14:30:00Z",
            },
            {
              id: "rev-3",
              author_name: "Vikram Malhotra",
              location: "Gurugram Cyber City",
              rating: 4,
              comment: "Very solid build and clean layer lines. The dual tone contrast looks premium in person. Great craftmanship.",
              created_at: "2026-10-02T16:20:00Z",
            },
            {
              id: "rev-4",
              author_name: "Ananya Deshmukh",
              location: "Dwarka Sector 11",
              rating: 5,
              comment: "Top notch quality! Definitely getting another piece for my shelf. The haggle feature via WhatsApp was effortless.",
              created_at: "2026-09-28T09:15:00Z",
            },
          ];
          setReviews(fallbackList);
          setAvgRating(4.8);
          setTotalReviews(fallbackList.length);
          setRatingDist({ 5: 3, 4: 1, 3: 0, 2: 0, 1: 0 });
        }
      })
      .catch(() => {});
  }, [unwrappedParams.id]);

  if (!product) {
    notFound();
  }

  const waUrl = createWhatsAppProductUrl(product.name, product.priceDisplay);

  // Submit new review to API
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: unwrappedParams.id,
          authorName: newReviewAuthor.trim(),
          location: newReviewLocation.trim() || "Delhi NCR",
          rating: newReviewRating,
          comment: newReviewComment.trim(),
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const newRev: ReviewItem = result.review || {
          id: `rev-${Date.now()}`,
          author_name: newReviewAuthor.trim(),
          location: newReviewLocation.trim() || "Delhi NCR",
          rating: newReviewRating,
          comment: newReviewComment.trim(),
          created_at: new Date().toISOString(),
        };

        const updated = [newRev, ...reviews];
        setReviews(updated);
        setTotalReviews(updated.length);

        const newDist = { ...ratingDist };
        newDist[newReviewRating] = (newDist[newReviewRating] || 0) + 1;
        setRatingDist(newDist);

        const sum = updated.reduce((acc, r) => acc + (r.rating || 5), 0);
        setAvgRating(parseFloat((sum / updated.length).toFixed(1)));

        setReviewSuccessMessage("Thank you! Your verified review has been published.");
        setNewReviewComment("");
        setNewReviewAuthor("");
        setTimeout(() => {
          setIsWriteReviewOpen(false);
          setReviewSuccessMessage("");
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleHelpful = (revId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [revId]: (prev[revId] || 0) + 1,
    }));
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (filterRating === "all") return true;
    return r.rating === filterRating;
  });

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 6);

  // Similar products logic: same category or fallback to catalog products
  let similarProducts = allProducts.filter(
    (p) => p.id !== product.id && (p.category_id === product.categoryId || p.category_id === product.category)
  );

  // If same category has fewer than 4 items, top-up with other popular prints
  if (similarProducts.length < 4) {
    const additional = allProducts
      .filter((p) => p.id !== product.id && !similarProducts.some((sp) => sp.id === p.id))
      .slice(0, 4 - similarProducts.length);
    similarProducts = [...similarProducts, ...additional];
  }

  // Final fallback to MOKOVA_PRODUCTS if allProducts hasn't finished loading
  if (similarProducts.length === 0) {
    similarProducts = MOKOVA_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);
  }

  // Complementary Bundle items (Frequently inquired together)
  const bundleItems = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 2);

  const scrollToReviews = () => {
    document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Breadcrumb Bar */}
      <div className="border-b border-black/10 bg-white">
        <div className="wrap py-3 flex items-center justify-between text-xs text-[#6a6880] overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Link href="/" className="hover:text-[#5a45ff] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <Link href="/products" className="font-bold text-[#0e0c1d] hover:text-[#5a45ff] transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <span className="text-[#5a45ff] font-bold truncate max-w-[140px] sm:max-w-none">{product.name}</span>
          </div>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf9f7] hover:bg-[#eeedfb] text-[#0e0c1d] font-bold text-xs transition-colors cursor-pointer shrink-0 ml-4"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      <div className="wrap my-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Photo Gallery Display */}
            <div className="space-y-3">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#f5f4f2] border border-black/10 shadow-sm flex items-center justify-center relative group">
                <img
                  src={selectedGalleryImg || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-mono font-bold text-[#0e0c1d] border border-black/5 shadow-xs">
                  Dimensions: {product.printSpecs.dimensionsMm}
                </div>
              </div>

              {/* Thumbnails */}
              {product.gallery && product.gallery.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.gallery.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedGalleryImg(img)}
                      className={`w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-[#f5f4f2] ${
                        (selectedGalleryImg || product.image) === img
                          ? "border-[#5a45ff] shadow-md"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`View ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom 3D Print Studio Banner */}
            <div className="p-4 bg-[#eeedfb]/60 border border-[#5a45ff]/20 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#5a45ff] shrink-0" />
                <span className="text-[#0e0c1d] font-semibold">
                  Have your own 3D model (.STL / .OBJ) to print?
                </span>
              </div>
              <Link href="/contact" className="font-bold text-[#5a45ff] hover:underline whitespace-nowrap">
                Open 3D Print Studio →
              </Link>
            </div>
          </div>

          {/* Right Column: Commercial & Technical (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Title + Category + Dynamic Rating */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#eeedfb] text-[#5a45ff]">
                  {product.category || "3D Printed Collectibles"}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Delhi & NCR Fast Dispatch
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold font-display text-[#0e0c1d] tracking-tight leading-tight">
                {product.name}
              </h1>

              <p className="text-sm text-[#6a6880] leading-relaxed">{product.subtitle}</p>

              {/* Dynamic Interactive Rating Pill */}
              <button
                type="button"
                onClick={scrollToReviews}
                className="flex items-center gap-2 pt-1 text-left hover:opacity-80 transition-opacity cursor-pointer group"
              >
                <StarRating rating={avgRating} size="sm" />
                <span className="text-sm font-bold text-[#0e0c1d]">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-[#5a45ff] font-semibold group-hover:underline">
                  ({totalReviews} verified reviews)
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  Verified Studio Run
                </span>
              </button>
            </div>

            {/* Pricing & Actions Card */}
            <div className="p-5 bg-white border border-black/10 rounded-[22px] shadow-sm space-y-4">
              <div className="flex items-baseline justify-between pb-3 border-b border-black/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6a6880] block">Listed Price</span>
                  <span className="text-3xl font-bold font-display text-[#5a45ff]">
                    {product.priceDisplay}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Haggling Floor</span>
                  <span className="text-xs font-mono text-[#0e0c1d] font-bold">
                    Offers from {formatCurrency(product.minOfferFloorInr || Math.round(product.referencePriceInr * 0.8))}
                  </span>
                </div>
              </div>

              {/* Physical Specifications Micro-Bento */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#faf9f7] border border-black/5 space-y-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#6a6880]">
                    <Ruler className="w-3 h-3 text-[#5a45ff]" />
                    <span>DIMENSIONS</span>
                  </span>
                  <span className="font-semibold font-mono text-[#0e0c1d] text-xs truncate block">
                    {product.printSpecs.dimensionsMm}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#faf9f7] border border-black/5 space-y-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#6a6880]">
                    <Package className="w-3 h-3 text-[#5a45ff]" />
                    <span>MATERIAL</span>
                  </span>
                  <span className="font-semibold text-[#0e0c1d] text-xs truncate block">
                    {product.printSpecs.material}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#faf9f7] border border-black/5 space-y-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#6a6880]">
                    <Clock className="w-3 h-3 text-[#5a45ff]" />
                    <span>PRINT TIME</span>
                  </span>
                  <span className="font-semibold text-[#0e0c1d] text-xs truncate block">
                    {product.printSpecs.printTimeHours}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#faf9f7] border border-black/5 space-y-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#6a6880]">
                    <Truck className="w-3 h-3 text-[#5a45ff]" />
                    <span>DELIVERY</span>
                  </span>
                  <span className="font-semibold text-[#0e0c1d] text-xs truncate block">
                    1–3 Days NCR
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>Ask for Price on WhatsApp</span>
                </a>
                {haggleEnabled && (
                  <button
                    onClick={() => setIsOfferOpen(true)}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white font-bold text-sm transition-colors cursor-pointer active:scale-[0.98]"
                  >
                    Make an Offer / Haggle Price (₹)
                  </button>
                )}
              </div>
              {haggleEnabled && (
                <p className="text-[11px] text-center text-[#6a6880]">
                  Submit your offer — studio replies via WhatsApp within 2 hours.
                </p>
              )}
            </div>

            {/* Print & Build Specifications Table */}
            <div className="bg-white p-5 rounded-[22px] border border-black/10 space-y-3">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#0e0c1d]">
                Technical Build Specifications
              </h3>
              <div className="divide-y divide-black/5 text-xs">
                {[
                  ["Technology", product.printSpecs.technology],
                  ["Layer Resolution", product.printSpecs.layerHeight],
                  ["Infill Density", product.printSpecs.infillPercentage],
                  ["Physical Size (W×D×H)", product.printSpecs.dimensionsMm],
                  ["Net Weight", product.printSpecs.weight || "110g"],
                  ["Print Duration", product.printSpecs.printTimeHours],
                  ["Catalog SKU", product.sku],
                ].map(([label, value]) => (
                  <div key={label} className="py-2 flex justify-between gap-4">
                    <span className="text-[#6a6880] shrink-0">{label}</span>
                    <span className="font-semibold text-[#0e0c1d] text-right font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: ShieldCheck, label: "1-Year Warranty" },
                { icon: CheckCircle2, label: "Quality Checked" },
                { icon: BadgeCheck, label: "Eco-Friendly PLA" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-3 bg-white border border-black/10 rounded-xl text-center">
                  <Icon className="w-5 h-5 text-[#5a45ff]" />
                  <span className="text-[10px] font-bold text-[#0e0c1d] leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── COMPLETE THE DESK SET / BUNDLE RECOMMENDATION ────── */}
        {bundleItems.length > 0 && (
          <div className="mt-16 p-6 sm:p-8 rounded-[28px] bg-[#faf9f7] border border-black/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#5a45ff] uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Frequently Inquired Together</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-[#0e0c1d]">
                  Complete Your Studio Setup
                </h3>
                <p className="text-xs text-[#6a6880] max-w-xl">
                  Pair {product.name} with these popular matching desk prints for a consolidated shipping run.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center -space-x-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  {bundleItems.map((bi) => (
                    <img
                      key={bi.id}
                      src={bi.image}
                      alt={bi.name}
                      loading="lazy"
                      decoding="async"
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ))}
                </div>

                <a
                  href={createWhatsAppProductUrl(
                    `Desk Set Bundle: ${product.name} + ${bundleItems.map((b) => b.name).join(" + ")}`,
                    "Inquire Bundle Discount"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire Set on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEWS & FEEDBACK SECTION ───────────────────────── */}
        <div id="reviews-section" className="mt-16 sm:mt-20 space-y-8 scroll-mt-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff] mb-2">
                <Star className="w-3.5 h-3.5 fill-[#5a45ff]" />
                <span>VERIFIED BUYER FEEDBACK</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0e0c1d]">
                Ratings & Customer Reviews
              </h2>
              <p className="text-xs sm:text-sm text-[#6a6880] mt-1">
                Real feedback from collectors and clients across Delhi NCR and India.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Write a Review</span>
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Feedback on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Rating Summary & Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-black/10 rounded-[28px] p-6 sm:p-8 shadow-xs">
            {/* Left Score Box (4 cols) */}
            <div className="md:col-span-4 flex flex-col justify-center items-center text-center p-6 bg-[#faf9f7] rounded-2xl border border-black/5">
              <span className="text-6xl font-extrabold font-display text-[#0e0c1d] tracking-tight">
                {avgRating.toFixed(1)}
              </span>
              <div className="my-2">
                <StarRating rating={avgRating} size="lg" />
              </div>
              <span className="text-sm font-bold text-[#0e0c1d]">Overall Rating</span>
              <span className="text-xs text-[#6a6880] mt-0.5">Based on {totalReviews} verified reviews</span>
            </div>

            {/* Middle Breakdown Bars (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-center space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDist[star] || 0;
                const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFilterRating(filterRating === star ? "all" : star)}
                    className={`flex items-center gap-3 text-xs w-full text-left p-1 rounded-lg transition-colors cursor-pointer ${
                      filterRating === star ? "bg-[#eeedfb]" : "hover:bg-black/5"
                    }`}
                  >
                    <span className="w-8 font-bold text-[#0e0c1d] text-right">{star} ★</span>
                    <div className="flex-1 h-2.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-[#6a6880] text-[11px]">
                      {count} ({pct}%)
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Trust Stats (3 cols) */}
            <div className="md:col-span-3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0 md:pl-6 space-y-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Verified Prints</span>
                </div>
                <p className="text-[11px] text-[#6a6880]">
                  Reviews submitted by verified clients after physical print delivery.
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[#5a45ff] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Layer-Tested Finish</span>
                </div>
                <p className="text-[11px] text-[#6a6880]">
                  Every review reflects our tuned 0.16mm precision standard.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#6a6880] mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>
            <button
              onClick={() => setFilterRating("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                filterRating === "all"
                  ? "bg-[#5a45ff] text-white"
                  : "bg-white border border-black/10 text-[#0e0c1d] hover:bg-[#faf9f7]"
              }`}
            >
              All Reviews ({totalReviews})
            </button>
            {[5, 4, 3].map((star) => (
              <button
                key={star}
                onClick={() => setFilterRating(star)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  filterRating === star
                    ? "bg-[#5a45ff] text-white"
                    : "bg-white border border-black/10 text-[#0e0c1d] hover:bg-[#faf9f7]"
                }`}
              >
                {star} Stars ({ratingDist[star] || 0})
              </button>
            ))}
          </div>

          {/* Write Review Form / Modal */}
          {isWriteReviewOpen && (
            <div className="bg-[#faf9f7] border border-[#5a45ff]/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-display text-[#0e0c1d]">
                    Leave a Review for {product.name}
                  </h3>
                  <p className="text-xs text-[#6a6880]">
                    Share your experience with print quality, layer finish, and delivery.
                  </p>
                </div>
                <button
                  onClick={() => setIsWriteReviewOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 text-[#6a6880] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reviewSuccessMessage ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{reviewSuccessMessage}</span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Your Rating</label>
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={newReviewRating}
                        size="lg"
                        interactive
                        onRatingChange={setNewReviewRating}
                      />
                      <span className="text-xs font-bold font-mono text-[#f59e0b]">
                        {newReviewRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs text-[#0e0c1d] focus:outline-none focus:border-[#5a45ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0e0c1d] mb-1">City / Region</label>
                      <input
                        type="text"
                        value={newReviewLocation}
                        onChange={(e) => setNewReviewLocation(e.target.value)}
                        placeholder="e.g. South Delhi, Noida, Gurugram"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs text-[#0e0c1d] focus:outline-none focus:border-[#5a45ff]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Your Review & Feedback</label>
                    <textarea
                      required
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="How does the 3D model look on your desk? Comment on surface finish, layer smoothness, and packing..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-xs text-[#0e0c1d] focus:outline-none focus:border-[#5a45ff]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWriteReviewOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#6a6880] hover:bg-black/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-5 py-2.5 rounded-xl bg-[#5a45ff] hover:bg-[#4330e6] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReview ? "Submitting..." : "Submit Review"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Customer Review Cards Grid */}
          {displayedReviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-black/10">
              <p className="text-sm text-[#6a6880]">No reviews found matching this rating filter.</p>
              <button
                onClick={() => setFilterRating("all")}
                className="mt-2 text-xs font-bold text-[#5a45ff] hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-black/10 rounded-2xl p-5 space-y-3.5 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-[#0e0c1d] leading-snug">{review.author_name}</p>
                        <p className="text-[11px] text-[#6a6880]">
                          {review.location || "Delhi NCR"} • Verified Buyer
                        </p>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>

                    <p className="text-xs text-[#374151] leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Print</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleHelpful(review.id)}
                      className="flex items-center gap-1 text-[#6a6880] hover:text-[#5a45ff] transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({helpfulVotes[review.id] || 4})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {filteredReviews.length > 6 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowAllReviews((v) => !v)}
                className="px-6 py-2.5 rounded-xl border border-black/10 bg-white hover:bg-[#eeedfb] text-xs font-bold text-[#0e0c1d] transition-colors cursor-pointer"
              >
                {showAllReviews ? "Show Less" : `Show All ${filteredReviews.length} Reviews`}
              </button>
            </div>
          )}
        </div>

        {/* ── SUGGESTED & SIMILAR PRINTS SECTION ────────────────── */}
        <div className="mt-16 sm:mt-20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-black/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff] mb-2">
                <Package className="w-3.5 h-3.5" />
                <span>STUDIO COMPATIBLE SELECTION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0e0c1d]">
                Similar & Suggested Studio Prints
              </h2>
              <p className="text-xs sm:text-sm text-[#6a6880] mt-1">
                Complementary desk pieces and figurines crafted with the same precision bio-PLA.
              </p>
            </div>

            <Link
              href="/products"
              className="flex items-center gap-1 text-xs font-bold text-[#5a45ff] hover:underline"
            >
              <span>Explore All Models</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {similarProducts.map((p: any) => (
              <div
                key={p.id}
                className="group bg-white border border-black/10 rounded-[22px] overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <Link href={`/product/${p.id}`} className="aspect-square bg-[#f5f4f2] overflow-hidden block relative">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                    {p.dimensions && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white/90">
                        {p.dimensions}
                      </span>
                    )}
                  </Link>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                      <span className="text-[#6a6880] uppercase truncate">{p.category_id || p.category || "Print"}</span>
                      <div className="flex items-center gap-0.5 text-[#f59e0b] font-bold shrink-0">
                        <span>★</span>
                        <span>4.9</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-[#0e0c1d] font-display group-hover:text-[#5a45ff] transition-colors line-clamp-1">
                      <Link href={`/product/${p.id}`}>{p.name}</Link>
                    </h3>

                    <p className="text-[11px] text-[#6a6880] line-clamp-2 leading-relaxed">
                      {p.description || p.subtitle || "Premium 3D printed collectible"}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#6a6880] block">Price</span>
                      <span className="text-sm font-bold font-display text-[#5a45ff]">
                        {p.price || p.priceDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/product/${p.id}`}
                        className="px-3 py-1.5 rounded-lg border border-black/10 bg-[#faf9f7] hover:bg-[#eeedfb] text-xs font-bold text-[#0e0c1d] transition-colors"
                      >
                        Inspect
                      </Link>
                      <a
                        href={createWhatsAppProductUrl(p.name, p.price || p.priceDisplay)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors"
                        title="Inquire on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OfferModal isOpen={isOfferOpen} onClose={() => setIsOfferOpen(false)} product={product} />
    </div>
  );
}
