"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, MessageCircle } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const pathname = usePathname();

  const categories = [
    { id: "home-decor", name: "Home Décor" },
    { id: "spiritual-devotional", name: "Spiritual & Devotional" },
    { id: "lamps-lighting", name: "Lamps & Lighting" },
    { id: "gifts-keychains", name: "Gifts & Keychains" },
    { id: "cute-fun", name: "Cute & Fun Figures" },
    { id: "collectibles-miniatures", name: "Collectibles & Miniatures" },
    { id: "custom-3d-printing", name: "Custom 3D Printing" },
    { id: "functional-utility", name: "Functional & Utility" },
  ];

  return (
    <header className="sticky top-3 z-50 mx-auto w-[min(calc(100%-28px),1240px)]">
      <div className="w-full min-h-[64px] px-4 sm:px-6 flex items-center justify-between gap-4 bg-white/85 backdrop-blur-xl border border-black/10 rounded-[20px] shadow-[0_12px_40px_-20px_rgba(14,12,29,0.25)]">
        {/* Brand logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/assets/logo.png"
            alt="Mokova3D - Custom 3D Printing Studio"
            width={96}
            height={32}
            loading="eager"
            decoding="async"
            className="w-[84px] sm:w-[96px] h-auto mix-blend-multiply"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-[14px] font-semibold text-[#6a6880]">
          <Link
            href="/"
            className={`px-3 py-2 rounded-xl transition-colors hover:text-[#0e0c1d] hover:bg-[#eeedfb] ${
              pathname === "/" ? "text-[#0e0c1d] bg-[#eeedfb]" : ""
            }`}
          >
            Home
          </Link>

          {/* Categories dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCategoryDropdownOpen(true)}
            onMouseLeave={() => setCategoryDropdownOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-2 rounded-xl transition-colors hover:text-[#0e0c1d] hover:bg-[#eeedfb] cursor-pointer"
            >
              <span>Categories</span>
              <ChevronDown className="w-4 h-4 opacity-70" />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 w-64 p-2 bg-white border border-black/10 rounded-2xl shadow-[0_40px_80px_-40px_rgba(60,40,200,0.35)] animate-in fade-in zoom-in-95 duration-150">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    className="block px-3 py-2 text-xs font-semibold text-[#0e0c1d] hover:bg-[#eeedfb] rounded-xl transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/products"
            className={`px-3 py-2 rounded-xl transition-colors hover:text-[#0e0c1d] hover:bg-[#eeedfb] ${
              pathname === "/products" ? "text-[#0e0c1d] bg-[#eeedfb]" : ""
            }`}
          >
            Shop
          </Link>

          <Link
            href="/gallery"
            className={`px-3 py-2 rounded-xl transition-colors hover:text-[#0e0c1d] hover:bg-[#eeedfb] ${
              pathname === "/gallery" ? "text-[#0e0c1d] bg-[#eeedfb]" : ""
            }`}
          >
            Gallery
          </Link>

          <Link
            href="/renderer"
            className={`px-3 py-2 rounded-xl transition-colors hover:text-[#0e0c1d] hover:bg-[#eeedfb] font-bold text-[#5a45ff] ${
              pathname === "/renderer" ? "bg-[#eeedfb]" : ""
            }`}
          >
            3D Viewer
          </Link>

          <Link
            href="/contact"
            className={`px-3 py-2 rounded-xl transition-colors hover:text-[#0e0c1d] hover:bg-[#eeedfb] ${
              pathname === "/contact" ? "text-[#0e0c1d] bg-[#eeedfb]" : ""
            }`}
          >
            Custom 3D Print
          </Link>

          <Link
            href="/faq"
            className={`px-3 py-2 rounded-xl transition-colors hover:text-[#0e0c1d] hover:bg-[#eeedfb] ${
              pathname === "/faq" ? "text-[#0e0c1d] bg-[#eeedfb]" : ""
            }`}
          >
            FAQ
          </Link>




        </nav>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-[#0e0c1d] hover:bg-[#eeedfb]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-5 bg-white border border-black/10 rounded-2xl shadow-xl space-y-2 animate-in slide-in-from-top-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#0e0c1d] hover:bg-[#eeedfb] rounded-xl"
          >
            Home
          </Link>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#0e0c1d] hover:bg-[#eeedfb] rounded-xl"
          >
            Shop Products
          </Link>
          <Link
            href="/gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#0e0c1d] hover:bg-[#eeedfb] rounded-xl"
          >
            Gallery
          </Link>
          <Link
            href="/renderer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-[#5a45ff] hover:bg-[#eeedfb] rounded-xl"
          >
            Browser 3D Viewer
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#0e0c1d] hover:bg-[#eeedfb] rounded-xl"
          >
            Custom 3D Printing
          </Link>
          <Link
            href="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#0e0c1d] hover:bg-[#eeedfb] rounded-xl"
          >
            FAQ
          </Link>



          <div className="pt-3 border-t border-black/10">
            <a
              href="https://wa.me/918527373680"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with Mokova on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}