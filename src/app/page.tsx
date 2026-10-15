"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { StudioReferenceHero } from "@/components/hero/StudioReferenceHero";
import { FlashPromotionsSection } from "@/components/home/FlashPromotionsSection";
import { TrendingSection } from "@/components/home/TrendingSection";
import { CuratedCollectionsSection } from "@/components/home/CuratedCollectionsSection";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import DiscoveryMatrixSection from "@/components/home/DiscoveryMatrixSection";
import { BilateralHaggleDeskSection } from "@/components/home/BilateralHaggleDeskSection";
import { TrustProcessSection } from "@/components/home/TrustProcessSection";
import { RecentlyViewedSection } from "@/components/home/RecentlyViewedSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { CatalogProduct } from "@/data/catalog";

const OfferModal = dynamic(
  () => import("@/components/negotiation/OfferModal").then((mod) => mod.OfferModal),
  { ssr: false }
);

interface HomepageSectionConfig {
  id: string;
  title: string;
  subtitle: string;
  layout_type: string;
  sort_order: number;
  enabled: number;
}

export default function HomePage() {
  const [sections, setSections] = useState<HomepageSectionConfig[]>([]);
  const [activeOfferProduct, setActiveOfferProduct] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    fetch("/api/homepage-sections")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSections(data);
        }
      })
      .catch(() => {});
  }, []);

  const isEnabled = (id: string) => {
    if (sections.length === 0) return true; // Default fallback to true while loading
    const s = sections.find((sec) => sec.id === id);
    return s ? s.enabled === 1 : true;
  };

  const getSectionMeta = (id: string) => {
    return sections.find((sec) => sec.id === id);
  };

  const handleOpenHaggle = (p: any) => {
    const mapped: CatalogProduct = {
      id: p.id,
      sku: p.sku || `MKV-${p.id.toUpperCase()}`,
      name: p.name,
      subtitle: p.description || p.name,
      category: p.category_id || "D?cor & Gifts",
      categoryId: p.category_id || "cute-fun",
      priceDisplay: p.price || "Ask on WhatsApp",
      referencePriceInr: Number(p.reference_price) || 299,
      minOfferFloorInr: Number(p.min_offer_floor) || 240,
      pricingModel: "FIXED_OR_HAGGLE",
      image: p.image,
      gallery: [p.image],
      shortDescription: p.description || "",
      fullOverview: "",
      printSpecs: {
        technology: "FDM Precision 3D Printing",
        material: p.material || "PLA Matte",
        layerHeight: p.layer_height || "0.16 mm",
        infillPercentage: p.infill || "20%",
        printTimeHours: p.print_time || "4.5 Hours",
        dimensionsMm: p.dimensions || "90 ? 80 ? 120 mm",
      },
      features: ["Tuned layer lines", "Delhi NCR fast delivery"],
      model3D: {
        id: p.model_3d_type || p.id,
        assetUrl: `/models/${p.id}.glb`,
        format: "glb",
        byteSize: 3200000,
        dracoCompressed: true,
        triangleCount: 42000,
        dimensions: { widthMm: 90, heightMm: 120, depthMm: 80 },
        posterFallbackUrl: p.image,
      },
    };
    setActiveOfferProduct(mapped);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* 1. Signature Studio Build-Bed Hero */}
      {isEnabled("hero") && <StudioReferenceHero />}

      {/* 2. Studio Batch Flash Allocations */}
      {isEnabled("promotions") && (
        <FlashPromotionsSection
          title={getSectionMeta("promotions")?.title}
          subtitle={getSectionMeta("promotions")?.subtitle}
        />
      )}

      {/* 3. Trending & High-Engagement Prints */}
      {isEnabled("trending") && (
        <TrendingSection
          title={getSectionMeta("trending")?.title}
          subtitle={getSectionMeta("trending")?.subtitle}
          onHaggleClick={handleOpenHaggle}
        />
      )}

      {/* 4. Atelier Curated Collections */}
      {isEnabled("curated_collections") && (
        <CuratedCollectionsSection
          title={getSectionMeta("curated_collections")?.title}
          subtitle={getSectionMeta("curated_collections")?.subtitle}
        />
      )}

      {/* 5. Recent Studio Batch Releases */}
      {isEnabled("new_arrivals") && (
        <NewArrivalsSection
          title={getSectionMeta("new_arrivals")?.title}
          subtitle={getSectionMeta("new_arrivals")?.subtitle}
          onHaggleClick={handleOpenHaggle}
        />
      )}

      {/* 6. Engineered Discovery Matrix */}
      {isEnabled("recommendations") && (
        <DiscoveryMatrixSection
          title={getSectionMeta("recommendations")?.title}
          subtitle={getSectionMeta("recommendations")?.subtitle}
          onHaggleClick={handleOpenHaggle}
        />
      )}

      {/* 7. Bilateral Price Discovery Desk */}
      {isEnabled("price_discovery") && (
        <BilateralHaggleDeskSection
          title={getSectionMeta("price_discovery")?.title}
          subtitle={getSectionMeta("price_discovery")?.subtitle}
        />
      )}

      {/* 8. Studio Craft & Verification Protocol */}
      {isEnabled("trust_process") && (
        <TrustProcessSection
          title={getSectionMeta("trust_process")?.title}
          subtitle={getSectionMeta("trust_process")?.subtitle}
        />
      )}

      {/* 9. Active Inspection Trail */}
      {isEnabled("recently_viewed") && (
        <RecentlyViewedSection
          title={getSectionMeta("recently_viewed")?.title}
          subtitle={getSectionMeta("recently_viewed")?.subtitle}
        />
      )}

      {/* 10. Final Studio Action Band */}
      {isEnabled("final_cta") && (
        <FinalCtaSection
          title={getSectionMeta("final_cta")?.title}
          subtitle={getSectionMeta("final_cta")?.subtitle}
        />
      )}

      {/* Global Interactive Offer Modal */}
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
