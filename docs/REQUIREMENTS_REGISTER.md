# Mokova3D — Requirements Register

This register defines the system requirements in a structured row format optimized for direct synchronization with Google Sheets in Phase 4.

| Requirement ID | Category | Title | Priority | Status | Owner Role | Phase | Acceptance Criteria Summary |
|---|---|---|---|---|---|---|---|
| `REQ-ARCH-001` | ARCHITECTURE | Project Scaffolding & Next.js Foundation | P0_CRITICAL | VERIFIED | Software Architect | 1 | Next.js App Router, TypeScript strict, Vitest operational |
| `REQ-DES-002` | DESIGN | Technical Atelier Visual Direction | P0_CRITICAL | VERIFIED | Visual Design Director | 1 | Obsidian/Titanium palette, amber triggers, tabular fonts, zero AI slop |
| `REQ-3D-003` | 3D_EXPERIENCE | Decoupled 3D Viewport Contract | P1_HIGH | VERIFIED | 3D Specialist | 1 | Shaded/Wireframe/Specular modes, exploded node inspection, fallback poster |
| `REQ-NEG-004` | NEGOTIATION | Interactive Price Haggle Engine | P0_CRITICAL | VERIFIED | Product Manager | 1 | Real-time variance calculator, floor safeguards, counter-offer modal |
| `REQ-INT-005` | INTEGRATION | Google Sheets Sync Interface | P1_HIGH | PROPOSED | Integration Architect | 4 | Typed ISheetsSyncAdapter, clean tabular mapping, zero API calls in Phase 1 |
| `REQ-INT-006` | INTEGRATION | Email Dispatch Interface | P1_HIGH | PROPOSED | Integration Architect | 4 | Typed IEmailNotificationService, zero SMTP credentials in Phase 1 |
| `REQ-SEC-007` | SECURITY | Zero-Secret Baseline & Sanitization | P0_CRITICAL | VERIFIED | Security Engineer | 1 | No hardcoded tokens, strict validation of buyer inputs, sandboxed runs |

## Future Google Sheets Columns Mapping:
- Column A: `Requirement ID`
- Column B: `Category`
- Column C: `Title`
- Column D: `Description`
- Column E: `Priority`
- Column F: `Status`
- Column G: `Owner Role`
- Column H: `Target Phase`
- Column I: `Acceptance Criteria`
- Column J: `Last Updated UTC`