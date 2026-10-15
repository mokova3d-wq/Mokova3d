"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, MessageCircle, Mail, ShieldCheck, ArrowUpRight } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/common/InstagramIcon";

export function Footer() {
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/features")
      .then((r) => r.json())
      .then((flags) => {
        if (Array.isArray(flags)) {
          const m = flags.find((f: any) => f.id === "feature_seller_marketplace");
          setMarketplaceEnabled(m ? m.enabled === 1 : false);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="w-full bg-[#090b0e] border-t border-white/10 text-white pt-16 pb-12 mt-20">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Studio Identity (4 cols) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/assets/logo.png"
                alt="Mokova3D - Custom 3D Printing Studio"
                width={112}
                height={36}
                loading="lazy"
                decoding="async"
                className="w-28 h-auto brightness-0 invert"
              />
            </Link>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Mokova3D is a precision 3D printing studio and bilateral price discovery marketplace
              based in Delhi &amp; NCR. High-precision bio-PLA décor, lamps, gifts, and bespoke prototypes.
            </p>

            <div className="space-y-2 pt-1 text-xs text-white/80">
              <div className="flex items-start gap-2 text-white/80">
                <MapPin className="w-4 h-4 text-[#c8f542] shrink-0 mt-0.5" />
                <span>Delhi &amp; NCR · Local Express Delivery &amp; Pan-India Courier</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Mail className="w-4 h-4 text-[#38bdf8] shrink-0" />
                <a href="mailto:contact@mokova3d.com" className="hover:text-white transition-colors">
                  contact@mokova3d.com
                </a>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://wa.me/918527373680"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-[#25D366] text-white transition-colors flex items-center gap-2 text-xs font-bold"
                aria-label="WhatsApp Studio"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +91 8527373680</span>
              </a>

              <a
                href="https://instagram.com/mokova3d"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-[#E1306C] text-white transition-colors"
                aria-label="Instagram Studio"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Shop & Studio Collections (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">
              Studio Collections
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/products" className="hover:text-[#c8f542] transition-colors">
                  All 3D Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-decor" className="hover:text-[#c8f542] transition-colors">
                  Home Décor &amp; Planters
                </Link>
              </li>
              <li>
                <Link href="/products?category=lamps-lighting" className="hover:text-[#c8f542] transition-colors">
                  Shadow Lamps &amp; Ambient Lighting
                </Link>
              </li>
              <li>
                <Link href="/products?category=spiritual-devotional" className="hover:text-[#c8f542] transition-colors">
                  Spiritual &amp; Sacred Figures
                </Link>
              </li>
              <li>
                <Link href="/products?category=cute-fun" className="hover:text-[#c8f542] transition-colors">
                  Cute Desk Companions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#c8f542] transition-colors font-semibold text-white flex items-center gap-1">
                  <span>Custom 3D Printing Studio</span>
                  <ArrowUpRight className="w-3 h-3 text-[#c8f542]" />
                </Link>
              </li>
              <li>
                <Link href="/renderer" className="hover:text-[#c8f542] transition-colors font-semibold text-[#38bdf8] flex items-center gap-1">
                  <span>Browser 3D Viewer</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Desk & Policies (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">
              Customer Desk
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/shipping" className="hover:text-[#c8f542] transition-colors">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#c8f542] transition-colors">
                  Refund &amp; Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#c8f542] transition-colors">
                  Frequently Asked (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#c8f542] transition-colors">
                  Client Prints Gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#c8f542] transition-colors">
                  About Mokova3D
                </Link>
              </li>
              <li>
                <Link href="/negotiation-guide" className="hover:text-[#c8f542] transition-colors">
                  Price Haggle Protocol
                </Link>
              </li>
              {marketplaceEnabled && (
                <li>
                  <Link href="/seller" className="hover:text-[#c8f542] transition-colors font-bold text-[#f59e0b]">
                    Seller &amp; Creator Portal
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Legal & Statutory Compliance (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">
              Legal &amp; Compliance (India)
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/terms" className="hover:text-[#c8f542] transition-colors">
                  Terms &amp; Conditions (IT Act 2000)
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#c8f542] transition-colors">
                  Privacy Policy (DPDP Act 2023)
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-[#c8f542] transition-colors">
                  Cookie &amp; Local Storage Policy
                </Link>
              </li>
              <li>
                <Link href="/buyer-seller-terms" className="hover:text-[#c8f542] transition-colors">
                  Buyer &amp; Seller Terms
                </Link>
              </li>
              <li>
                <Link href="/ip-policy" className="hover:text-[#c8f542] transition-colors">
                  Intellectual Property &amp; Copyright
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="hover:text-[#c8f542] transition-colors">
                  Acceptable Use &amp; Safety Policy
                </Link>
              </li>
              <li>
                <Link href="/grievance" className="hover:text-[#c8f542] transition-colors font-bold text-[#c8f542] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Grievance Officer Details</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Statutory Redressal Note */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/50 pt-2">
          <div>
            &copy; 2026 Mokova3D. All rights reserved. Registered in Delhi &amp; NCR, India.
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/60">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/returns" className="hover:text-white transition-colors">
              Refunds
            </Link>
            <span>•</span>
            <Link href="/grievance" className="hover:text-[#c8f542] font-semibold transition-colors">
              Grievance Redressal
            </Link>
            <span>•</span>
            <a
              href="https://wa.me/918527373680"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:underline"
            >
              WhatsApp Hotline
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}