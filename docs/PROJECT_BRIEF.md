# Mokova3D — Product Brief

## 1. Product Identity & Purpose
- **Project Name:** Mokova3D (B2B Commercial Edition)
- **Product Vision:** An enterprise-grade, high-fidelity 3D product catalog and bilateral price negotiation desk.
- **Core Value Proposition:** High-value industrial machinery, laboratory metrology equipment, and aerospace hardware rarely feature rigid retail pricing. Mokova3D allows prospective buyers to conduct sub-millimeter spatial 3D inspection of complex assemblies and submit contractual counter-offers or formal quote requests directly to sellers.

## 2. Target Users & Personas
1. **Procurement Directors & Systems Engineers (Buyers):**
   - Need spatial dimensional certainty, CAD specification clarity, and component-level visibility before capital commitment.
   - Want a direct, transparent mechanism to propose custom counter-offers, volume discounts, or academic/grant ceiling pricing without friction.
2. **Industrial Equipment Manufacturers & Dealers (Sellers):**
   - Require a modern digital showroom that highlights craftsmanship and technical precision.
   - Need a structured negotiation inbox capturing qualified buyer leads, target unit prices, and rationales into an operational ledger (ready for Google Sheets integration in Phase 4).

## 3. Core Use Cases & Journeys
- **Journey 1: Spatial Inspection:** Buyer navigates the catalog, filters by engineering domain, and enters the 3D viewport to inspect the model in shaded, wireframe, or specular modes with exploded sub-assembly views.
- **Journey 2: Price Haggle & Counter-Offer:** Buyer clicks "Make an Offer / Haggle Price", adjusts target unit price on an interactive slider with real-time variance calculation against seller floors, provides rationales, and submits.
- **Journey 3: Formal RFQ / Procurement Quote:** Buyer submits project specifications, compliance requirements, and freight destinations for customized enterprise proposals.
- **Journey 4: Operational Management:** Seller monitors requirements, feature status, and lead capture rows through a clean Google Sheets-compatible register.

## 4. Phase 1 Definition of Done & Success Criteria
- [x] Next.js App Router + TypeScript + Tailwind CSS production-grade foundation.
- [x] Technical Atelier design language (Obsidian/Titanium with safety amber accents; zero generic purple AI templates).
- [x] Responsive application shell with desktop & mobile drawer navigation.
- [x] Interactive 3D Viewport shell with camera controls and render mode simulator.
- [x] Bilateral price negotiation calculator with instant variance gauges and floor safeguards.
- [x] Decoupled integration contracts for future 3D engines, email workflows, and Google Sheets sync.
- [x] 100% automated Vitest suite passing and strict TypeScript build passing.

## 5. Production Grade Verification & Hardening Sign-Off
- [x] **Data Pipeline & Concurrency:** SQLite upgraded with Write-Ahead Logging (`WAL`), 30-second busy timeout (`PRAGMA busy_timeout = 30000`), normal synchronous mode, and dynamic non-expiring promotional seed data.
- [x] **Security & RBAC:**
  - Password hashing upgraded from plaintext to cryptographic `scrypt` with per-user salt and timing-safe comparison (`crypto.timingSafeEqual`).
  - IP-based brute force protection and account lockout (5 failed attempts locks login for 15 minutes).
  - Directory traversal prevention in temporary 3D file conversion storage (`/data/temp-3d-conversions`).
  - HTML tag stripping and review rate limiting (maximum 5 reviews per 5 minutes per IP).
  - Hardened HTTP security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`, and `Permissions-Policy`.
- [x] **SEO & Schema.org Rich Results:**
  - Standardized all unicode strings, removing character encoding mojibake (`Décor`, `₹`).
  - Dynamic `sitemap.xml` expanded to index all products, categories, legal pages, and the 3D renderer studio.
  - Hardened `robots.txt` disallowing internal admin endpoints while facilitating public search crawl.
  - Structured data expanded to include `LocalBusiness`, `Product`, and `BreadcrumbList` schemas.
- [x] **3D Engine & Image Pipelines:**
  - Client-side WebGL canvas with graceful fallback to high-resolution inspection poster if WebGL is unavailable or fails.
  - Image optimization pipeline converting uploaded PNG/JPEG assets to WebP with multi-variant thumb/card/full generation.
  - Client-side and server-side STL/OBJ/GLB/3MF parser and converter with automatic 1-hour expiration purge.
- [x] **End-to-End Browser & Test Verification:**
  - 53 automated Vitest tests passing across 11 test suites.
  - Production build (`next build`) generating 50 static and dynamic routes with zero warnings.
  - Full browser verification across Storefront, 3D Viewport, Negotiation Desk, 3D Renderer Studio, and Admin CMS.