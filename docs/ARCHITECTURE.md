# Mokova3D — Architecture Specification

## 1. Architectural Philosophy
Mokova3D adheres to strict modularity, high performance, and decoupled service boundaries. The application is built to scale from the Phase 1 architectural foundation into full WebGL 3D rendering (Phase 2), dynamic negotiation routing (Phase 3), and external Google Sheets + SMTP automation (Phase 4) without rewrites or structural churn.

## 2. Technology Stack Selection
- **Framework:** Next.js 16 (App Router with Turbopack support)
- **Language:** TypeScript 5.8+ (Strict mode enabled, zero `any`)
- **Styling & Design Tokens:** Tailwind CSS 4 with custom CSS custom properties (`globals.css`)
- **Component Primitives:** Reusable atomic components (`Button`, `Badge`, `Card`, `Input`, `Modal`, `Tabs`)
- **Iconography:** Lucide React (Clean, vector precision, minimal bundle weight)
- **Test Harness:** Vitest + React Testing Library + JSDOM
- **Build & Verification:** Next.js compiler (`next build`) + TypeScript compiler (`tsc --noEmit`)

## 3. Directory Structure
```text
c:\Users\human-bot\projects\3dmodelsite\
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with Header, Footer, and font configuration
│   │   ├── page.tsx            # Catalog Showcase view with filterable grid
│   │   ├── product/[id]/       # Interactive Product Detail & 3D Viewport view
│   │   ├── requirements/       # Google Sheets synchronizable operations ledger
│   │   └── negotiation-guide/  # Bilateral haggling protocol and policy guide
│   ├── components/
│   │   ├── common/             # Atomic primitives (Button, Badge, Card, Input, Modal, Tabs)
│   │   ├── layout/             # Header, Navigation, Footer, Mobile Drawer
│   │   ├── 3d/                 # ViewportShell, camera controls, wireframe modes
│   │   └── negotiation/        # OfferModal (Haggle engine), QuoteRequestModal
│   ├── contracts/              # Decoupled architectural boundaries (Phase 1 boundary)
│   │   ├── 3d-viewer.contract.ts      # Model3DDescriptor, camera presets, render modes
│   │   ├── email.contract.ts          # PriceQuoteRequestPayload, BuyerCounterOfferPayload
│   │   └── sheets-sync.contract.ts    # RequirementRegisterItem, InquiryLeadRow
│   ├── data/                   # Realistic catalog products with 3D specifications
│   ├── lib/                    # Utilities (cn class merging, currency formatters)
│   └── styles/                 # Tailwind CSS and semantic token variables
├── tests/                      # Automated Vitest test suites
├── docs/                       # Architectural deliverables and product briefs
└── package.json
```

## 4. Integration Boundaries & Service Contracts
Phase 1 deliberately decouples external integrations behind typed contracts:
1. **3D Experience Contract (`src/contracts/3d-viewer.contract.ts`)**:
   - Isolates model telemetry, triangle budgets, dimensions, camera presets, and fallback posters from the canvas engine.
   - Permits seamless injection of Three.js / React Three Fiber / `<model-viewer>` in Phase 2 without modifying catalog or page components.
2. **Email Workflow Contract (`src/contracts/email.contract.ts`)**:
   - Defines strict schema for `BuyerCounterOfferPayload` and `PriceQuoteRequestPayload`.
   - In Phase 1, handled via simulated client dispatch; in Phase 4, wired to SMTP / Resend / SendGrid without altering negotiation dialogs.
3. **Google Sheets Sync Contract (`src/contracts/sheets-sync.contract.ts`)**:
   - Flattens data structures to 1:1 spreadsheet row representations (`RequirementRegisterItem` and `InquiryLeadRow`).
   - Ready for Google Sheets API v4 service account authentication in Phase 4.

## 5. Security & Credential Hygiene
- **Zero Secrets in Code:** No API keys, credentials, or service account JSON files exist in the codebase.
- **Input Sanitization:** All negotiation text fields, email inputs, and price numbers are strictly validated before payload construction.
- **Client Sandboxing:** In Phase 1, no outbound external HTTP calls or spreadsheet modifications are performed.