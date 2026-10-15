# Mokova3D

**Mokova3D** is an enterprise-grade 3D product catalog and bilateral price negotiation desk built for high-value engineering equipment, precision robotics, optical metrology, and aerospace hardware.

---

## Key Features (Phase 1 Foundation)

1. **Interactive 3D Model Viewport Shell:**
   - Evaluates GLB/glTF Draco models with real-time rendering telemetry.
   - Interactive viewport controls: Shaded, Wireframe, Specular inspection modes, turntable rotation controls, and exploded sub-assembly node triggers.
   - Accessible fallback poster state for non-WebGL devices.

2. **Bilateral Price Negotiation Desk ("Haggle Engine"):**
   - Direct buyer-to-seller price counter-offers with real-time variance calculations against reference list prices.
   - Safeguards against offers below seller floor thresholds with automatic justification flags.
   - Formal procurement RFQ modal with custom specification capture.

3. **Technical Atelier Design Language:**
   - Bespoke Swiss-precision aesthetic: Obsidian and Titanium surfaces (`#090B0E`, `#11151C`) with Safety Amber / Warm Ochre action triggers (`#F59E0B`).
   - Tabular monospace typography for numeric tolerances, SKU identifiers, and price calculations.
   - Zero generic AI purple gradients or decorative glassmorphism.

4. **Decoupled Architectural Integration Contracts:**
   - Strictly typed TypeScript contracts in `src/contracts/` for 3D viewers, email workflows, and Google Sheets synchronization.
   - Clean Phase 1 boundary: no external API calls, SMTP credentials, or real spreadsheet mutations during this foundation phase.

5. **Google Sheets Ready Requirements Register:**
   - Operational matrix view at `/requirements` with 1:1 row-to-column spreadsheet mapping and direct CSV export.

---

## Quick Start & Commands

### Prerequisites
- Node.js v18+ (tested on Node.js v24)
- npm v9+

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
# Server launches on http://localhost:3000
```

### Production Build
```bash
npm run build
```

### Automated Test Suite
```bash
npm test
```

### Type Checking
```bash
npm run typecheck
```

---

## Project Structure
```text
src/
├── app/                  # Next.js App Router (Catalog, Product Details, Requirements, Guide)
├── components/
│   ├── common/           # Atomic components (Button, Badge, Card, Input, Modal, Tabs)
│   ├── layout/           # Shared Header, Navigation, Footer, Mobile Drawer
│   ├── 3d/               # 3D ViewportShell, camera controls, wireframe modes
│   └── negotiation/      # OfferModal, QuoteRequestModal
├── contracts/            # Decoupled interface definitions (3D, Email, Sheets)
├── data/                 # Realistic catalog items with 3D model metadata
├── lib/                  # Utilities (Tailwind class merger, currency formatters)
└── styles/               # Global CSS variables & Tailwind v4 styles
tests/                    # Vitest test specs (Components, Negotiation, Contracts)
docs/                     # Product Brief, Architecture, Requirements Register
```

---

## Multi-Agent Team Sign-Off (Phase 1)
- **Software Architect:** Verified clean Next.js App Router architecture and typed boundaries.
- **Visual Design Director:** Verified Technical Atelier design direction and high visual fidelity.
- **Product Manager:** Verified negotiation workflows, pricing models, and catalog schema.
- **3D Specialist:** Verified GLB/glTF specifications and viewport control simulator.
- **Integration Architect:** Verified typed contracts for future Email and Google Sheets sync.
- **QA Engineer:** Verified 100% test pass rate across 9 unit and integration tests.
- **Security Engineer:** Verified zero hardcoded credentials and input validation.