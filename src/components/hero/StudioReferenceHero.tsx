"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Truck, Leaf, Shield, Star, ArrowRight } from "lucide-react";

interface HeroData {
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string;
  altText: string;
  focalPosition: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
  trustBadges: Array<{ icon: string; label: string }>;
}

export function StudioReferenceHero() {
  const [hero, setHero] = useState<HeroData>({
    title: "Small Things\nBig Happiness",
    subtitle:
      "Discover playful, eco-friendly 3D printed toys crafted with care.\nDesigned to delight, built to last.",
    image: "/assets/hero-banner.png",
    mobileImage: "",
    altText: "Small Things Big Happiness - 3D Printed Cat and Penguin Collectibles",
    focalPosition: "center",
    primaryBtnText: "Shop Now",
    primaryBtnLink: "/products",
    secondaryBtnText: "Custom Print",
    secondaryBtnLink: "/contact",
    trustBadges: [
      { icon: "truck", label: "Free Shipping" },
      { icon: "leaf", label: "100% Biodegradable PLA" },
      { icon: "shield", label: "1-Year Warranty" },
      { icon: "star", label: "2K+ Happy Customers" },
    ],
  });

  useEffect(() => {
    fetch("/api/site-config")
      .then((res) => res.json())
      .then((cfg) => {
        if (cfg) {
          let badges = hero.trustBadges;
          if (cfg.heroTrustBadges) {
            try {
              badges = JSON.parse(cfg.heroTrustBadges);
            } catch (e) {}
          }

          setHero((prev) => ({
            ...prev,
            title: cfg.heroTitle || prev.title,
            subtitle: cfg.heroSubtitle || prev.subtitle,
            image: cfg.heroImage || prev.image,
            mobileImage: cfg.heroMobileImage || "",
            altText: cfg.heroAltText || prev.altText,
            focalPosition: cfg.heroFocalPosition || "center",
            primaryBtnText: cfg.heroPrimaryBtnText || prev.primaryBtnText,
            primaryBtnLink: cfg.heroPrimaryBtnLink || prev.primaryBtnLink,
            secondaryBtnText: cfg.heroSecondaryBtnText || prev.secondaryBtnText,
            secondaryBtnLink: cfg.heroSecondaryBtnLink || prev.secondaryBtnLink,
            trustBadges: badges,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const renderBadgeIcon = (icon: string) => {
    switch (icon) {
      case "truck":
        return <Truck className="w-3.5 h-3.5 text-[#18181b]" />;
      case "leaf":
        return <Leaf className="w-3.5 h-3.5 text-[#16a34a]" />;
      case "shield":
        return <Shield className="w-3.5 h-3.5 text-[#2563eb]" />;
      case "star":
        return <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />;
      default:
        return <Star className="w-3.5 h-3.5 text-[#f59e0b]" />;
    }
  };

  return (
    <section className="relative w-full pt-4 sm:pt-6 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-[1360px] mx-auto overflow-hidden">
      {/* Warm Ambient Atmospheric Shapes matching reference image */}
      <div className="absolute top-12 left-1/4 w-[500px] h-[350px] bg-[#FEF3C7]/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-[420px] h-[400px] bg-[#FDE68A]/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Typography, CTAs & Trust Strip (6 cols) */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-7 z-10">
          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-bold font-display text-[#111827] tracking-tight leading-[1.08] whitespace-pre-line">
            {hero.title}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg text-[#4b5563] leading-relaxed max-w-xl whitespace-pre-line font-medium">
            {hero.subtitle}
          </p>

          {/* Pill Action Buttons matching reference image */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href={hero.primaryBtnLink || "/products"}
              className="inline-flex items-center justify-center px-8 sm:px-9 py-3.5 sm:py-4 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-[#111827] font-bold text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-100"
            >
              <span>{hero.primaryBtnText || "Shop Now"}</span>
            </Link>

            <Link
              href={hero.secondaryBtnLink || "/contact"}
              className="inline-flex items-center justify-center px-8 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-[#FAF9F7] text-[#111827] font-bold text-sm sm:text-base border border-black/15 hover:border-black/30 transition-all duration-200 shadow-xs hover:scale-[1.02] active:scale-100"
            >
              <span>{hero.secondaryBtnText || "Custom Print"}</span>
            </Link>
          </div>

          {/* Trust Badges Strip matching reference image */}
          <div className="pt-4 flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-semibold text-[#374151]">
            {hero.trustBadges.map((badge, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white/70 backdrop-blur-xs shadow-xs"
              >
                {renderBadgeIcon(badge.icon)}
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Studio Imagery matching reference image (6 cols) */}
        <div className="lg:col-span-6 relative flex items-center justify-center z-10">
          <div className="relative w-full max-w-[620px] aspect-[16/10] sm:aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl shadow-amber-900/10 border border-white/60 bg-gradient-to-b from-white/60 to-transparent">
            {/* Preload critical LCP image when hero renders */}
            <link rel="preload" as="image" href={hero.image || "/assets/hero-banner.png"} fetchPriority="high" />

            {/* Responsive picture element supporting separate mobile image if configured */}
            <picture className="w-full h-full block">
              {hero.mobileImage && (
                <source media="(max-width: 640px)" srcSet={hero.mobileImage} />
              )}
              <img
                src={hero.image || "/assets/hero-banner.png"}
                alt={hero.altText || "Small Things Big Happiness 3D Prints"}
                style={{ objectPosition: hero.focalPosition || "center" }}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </picture>

            {/* Subtle bottom studio shadow vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}