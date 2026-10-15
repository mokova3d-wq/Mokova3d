import { Model3DDescriptor } from "@/contracts/3d-viewer.contract";

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  subtitle: string;
  category: string;
  categoryId: string;
  priceDisplay: string;
  referencePriceInr: number;
  minOfferFloorInr: number;
  pricingModel: "FIXED_OR_HAGGLE" | "ASK_WHATSAPP";
  image: string;
  gallery: string[];
  shortDescription: string;
  fullOverview: string;
  printSpecs: {
    technology: string;
    material: string;
    layerHeight: string;
    infillPercentage: string;
    printTimeHours: string;
    dimensionsMm: string;
  };
  features: string[];
  model3D: Model3DDescriptor;
}

export const MOKOVA_PRODUCTS: CatalogProduct[] = [
  {
    id: "cat",
    sku: "MKV-CAT-01",
    name: "Cute Cat Desk Companion",
    subtitle: "Playful black-and-white 3D printed cat collectible",
    category: "Cute & Fun Figures",
    categoryId: "cute-fun",
    priceDisplay: "₹299",
    referencePriceInr: 299,
    minOfferFloorInr: 240,
    pricingModel: "FIXED_OR_HAGGLE",
    image: "/assets/products/cat.webp",
    gallery: [
      "/assets/products/cat.webp",
      "/assets/gallery/WhatsApp Image 2026-09-24 at 10.18.24 AM (3).jpeg",
      "/assets/gallery/WhatsApp Image 2026-09-24 at 10.18.25 AM (3).jpeg",
    ],
    shortDescription:
      "A cheerful dual-tone 3D printed cat figure designed for study desks, bedside tables, or gifting.",
    fullOverview:
      "Printed using premium matte bio-PLA with tuned retraction for razor-sharp contours. Perfectly balanced with smooth contours and weighted base to sit securely on laptops, books, or shelves.",
    printSpecs: {
      technology: "FDM Precision 3D Printing",
      material: "Premium Matte Non-Toxic PLA",
      layerHeight: "0.16 mm fine resolution",
      infillPercentage: "18% Gyroid infill",
      printTimeHours: "4.5 Hours",
      dimensionsMm: "65 × 52 × 85 mm",
    },
    features: [
      "Dual-tone multi-material layer finish",
      "Ergonomic smoothed edges with zero sharp artifacts",
      "Ready to gift in eco-friendly Mokova studio packaging",
    ],
    model3D: {
      id: "mod-cat",
      assetUrl: "/models/cat.glb",
      format: "glb",
      byteSize: 3200000,
      dracoCompressed: true,
      triangleCount: 42000,
      dimensions: { widthMm: 65, heightMm: 85, depthMm: 52 },
      posterFallbackUrl: "/assets/products/cat.webp",
      availableExplodedNodes: ["Base Body", "Collar Accent", "Head Profile"],
    },
  },
  {
    id: "penguin",
    sku: "MKV-PNG-02",
    name: "Roly-Poly Penguin",
    subtitle: "Cute wobble desk companion & gifting piece",
    category: "Cute & Fun Figures",
    categoryId: "cute-fun",
    priceDisplay: "₹299",
    referencePriceInr: 299,
    minOfferFloorInr: 240,
    pricingModel: "FIXED_OR_HAGGLE",
    image: "/assets/products/penguin.webp",
    gallery: [
      "/assets/products/penguin.webp",
      "/assets/gallery/WhatsApp Image 2026-09-24 at 10.18.24 AM (2).jpeg",
      "/assets/gallery/WhatsApp Image 2026-09-24 at 10.18.25 AM (2).jpeg",
    ],
    shortDescription:
      "Adorably styled low-center-of-gravity penguin that wobbles playfully without toppling.",
    fullOverview:
      "One of our most popular gift items! Engineered with an internal hollow ballast cavity allowing it to rock rhythmically. Printed in high-contrast crisp white and midnight filament.",
    printSpecs: {
      technology: "FDM High-Precision Fused Deposition",
      material: "Food-Safe PLA+",
      layerHeight: "0.16 mm adaptive layer height",
      infillPercentage: "25% Concentric heavy-base infill",
      printTimeHours: "5.0 Hours",
      dimensionsMm: "70 × 68 × 90 mm",
    },
    features: [
      "Self-righting rocking physics balance",
      "Matte surface texture minimizing visible seam lines",
      "Custom color variants available on WhatsApp",
    ],
    model3D: {
      id: "mod-penguin",
      assetUrl: "/models/penguin.glb",
      format: "glb",
      byteSize: 2800000,
      dracoCompressed: true,
      triangleCount: 36000,
      dimensions: { widthMm: 70, heightMm: 90, depthMm: 68 },
      posterFallbackUrl: "/assets/products/penguin.webp",
      availableExplodedNodes: ["Weighted Base", "Beak Shell", "Outer Belly"],
    },
  },
  {
    id: "lamp",
    sku: "MKV-LMP-03",
    name: "Custom Shadow Lamp",
    subtitle: "Warm silhouette ambient lamp with geometric projection",
    category: "Lamps & Lighting",
    categoryId: "lamps-lighting",
    priceDisplay: "Ask on WhatsApp (Est. ₹799)",
    referencePriceInr: 799,
    minOfferFloorInr: 650,
    pricingModel: "ASK_WHATSAPP",
    image: "/assets/products/lamp.webp",
    gallery: [
      "/assets/products/lamp.webp",
      "/assets/gallery/WhatsApp Image 2026-09-24 at 10.18.24 AM (1).jpeg",
      "/assets/gallery/WhatsApp Image 2026-09-24 at 10.18.26 AM (6).jpeg",
    ],
    shortDescription:
      "Casts stunning artistic silhouettes across bedroom walls. Available in custom motifs.",
    fullOverview:
      "Features translucent lithophane-inspired perforated panels that transform standard warm LED light into intricate wall projections. Includes modular plug-in lamp socket fixture.",
    printSpecs: {
      technology: "Dual-Wall FDM Architectural Print",
      material: "Heat-Resistant PETG / Translucent White",
      layerHeight: "0.12 mm high-definition micro-layers",
      infillPercentage: "100% Solid optical shell",
      printTimeHours: "14 Hours",
      dimensionsMm: "120 × 120 × 180 mm",
    },
    features: [
      "Compatible with standard E27 / B22 warm LED bulbs",
      "Custom name, constellation, or brand pattern projection",
      "Reinforced base with discreet cable management notch",
    ],
    model3D: {
      id: "mod-lamp",
      assetUrl: "/models/lamp.glb",
      format: "glb",
      byteSize: 8400000,
      dracoCompressed: true,
      triangleCount: 98000,
      dimensions: { widthMm: 120, heightMm: 180, depthMm: 120 },
      posterFallbackUrl: "/assets/products/lamp.webp",
      availableExplodedNodes: ["Lampshade Lattice", "LED Stem Mount", "Base Pedestal"],
    },
  },
  {
    id: "ganesha",
    sku: "MKV-GNS-05",
    name: "Sacred Ganesha Figurine",
    subtitle: "Devotional 3D sculpted deity with fine surface detailing",
    category: "Spiritual & Devotional",
    categoryId: "spiritual-devotional",
    priceDisplay: "Ask on WhatsApp (Est. ₹499)",
    referencePriceInr: 499,
    minOfferFloorInr: 400,
    pricingModel: "ASK_WHATSAPP",
    image: "/assets/products/ganesha.webp",
    gallery: [
      "/assets/products/ganesha.webp",
      "/assets/gallery/WhatsApp Image 2026-09-24 at 10.18.25 AM (28).jpeg",
    ],
    shortDescription:
      "Intricately sculpted Lord Ganesha idol for car dashboards, home mandir, and spiritual gifting.",
    fullOverview:
      "A serene, modern interpretation of Ganesha honoring traditional iconography with clean contemporary geometry. Available in metallic gold, marble stone finish, and pure ivory white.",
    printSpecs: {
      technology: "High-Res SLA Resin & Fine FDM Hybrid",
      material: "Stone-Effect Composite PLA / Resin",
      layerHeight: "0.12 mm fine surface detailing",
      infillPercentage: "30% Solid feel",
      printTimeHours: "7.0 Hours",
      dimensionsMm: "75 × 65 × 110 mm",
    },
    features: [
      "Marble dust tactile feel without fragile ceramic chipping",
      "Stable flat base with optional 3M dashboard adhesive pad",
      "Blessing mudra and detailed trunk crown ornaments",
    ],
    model3D: {
      id: "mod-ganesha",
      assetUrl: "/models/ganesha.glb",
      format: "glb",
      byteSize: 6100000,
      dracoCompressed: true,
      triangleCount: 84000,
      dimensions: { widthMm: 75, heightMm: 110, depthMm: 65 },
      posterFallbackUrl: "/assets/products/ganesha.webp",
      availableExplodedNodes: ["Lotus Base", "Torso & Crown", "Trunk Mudra"],
    },
  },
  {
    id: "friends",
    sku: "MKV-FRN-04",
    name: "3D Printed Friends Collectibles",
    subtitle: "Stylized characters with signature posture and detailing",
    category: "Collectibles & Miniatures",
    categoryId: "collectibles-miniatures",
    priceDisplay: "Ask on WhatsApp (Est. ₹599)",
    referencePriceInr: 599,
    minOfferFloorInr: 480,
    pricingModel: "ASK_WHATSAPP",
    image: "/assets/products/friends.webp",
    gallery: [
      "/assets/products/friends.webp",
      "/assets/gallery/WhatsApp Image 2026-09-24 at 10.18.25 AM (14).jpeg",
    ],
    shortDescription:
      "Hand-calibrated miniature character figurines with expressive poses and smooth surface finish.",
    fullOverview:
      "Designed for collectors, animators, and pop-culture enthusiasts. Each model is post-processed and inspected for uniform layer adhesion and balance.",
    printSpecs: {
      technology: "High-Resolution FDM 3D Print",
      material: "Premium PLA Matte",
      layerHeight: "0.12 mm",
      infillPercentage: "20%",
      printTimeHours: "6.5 Hours",
      dimensionsMm: "80 × 70 × 120 mm",
    },
    features: [
      "Custom color variants available",
      "Stands freely on desks without requiring extra stand",
      "Bespoke batch production",
    ],
    model3D: {
      id: "mod-friends",
      assetUrl: "/models/friends.glb",
      format: "glb",
      byteSize: 5200000,
      dracoCompressed: true,
      triangleCount: 65000,
      dimensions: { widthMm: 80, heightMm: 120, depthMm: 70 },
      posterFallbackUrl: "/assets/products/friends.webp",
      availableExplodedNodes: ["Character Frame", "Accessory Accents"],
    },
  },
  {
    id: "flexible",
    sku: "MKV-FLX-06",
    name: "Articulated Flexible Characters",
    subtitle: "Print-in-place moving joint fidget collectible",
    category: "Cute & Fun Figures",
    categoryId: "cute-fun",
    priceDisplay: "Ask on WhatsApp (Est. ₹349)",
    referencePriceInr: 349,
    minOfferFloorInr: 280,
    pricingModel: "ASK_WHATSAPP",
    image: "/assets/products/flexible.webp",
    gallery: [
      "/assets/products/flexible.webp",
      "/assets/gallery/WhatsApp Image 2026-09-24 at 10.18.26 AM (14).jpeg",
    ],
    shortDescription:
      "Fascinating multi-link articulated character that flexes naturally right off the printer.",
    fullOverview:
      "Features interlocking print-in-place ball-and-socket links that require zero manual assembly. Highly satisfying sensory fidget companion.",
    printSpecs: {
      technology: "Print-In-Place FDM Kinematic Print",
      material: "High-Toughness Silk PLA",
      layerHeight: "0.16 mm",
      infillPercentage: "25%",
      printTimeHours: "5.5 Hours",
      dimensionsMm: "160 × 40 × 30 mm",
    },
    features: [
      "Fully fluid multi-joint spine movement",
      "Silk metallic gloss sheen in rainbow or solid shades",
      "Durable drop-resistant link geometry",
    ],
    model3D: {
      id: "mod-flexible",
      assetUrl: "/models/flexible.glb",
      format: "glb",
      byteSize: 4100000,
      dracoCompressed: true,
      triangleCount: 52000,
      dimensions: { widthMm: 160, heightMm: 30, depthMm: 40 },
      posterFallbackUrl: "/assets/products/flexible.webp",
      availableExplodedNodes: ["Kinematic Joints", "Head Segment"],
    },
  },
  {
    id: "figurine",
    sku: "MKV-CST-09",
    name: "Custom Bespoke 3D Figurine",
    subtitle: "Personalized model from your photo, sketch or STL",
    category: "Custom 3D Printing",
    categoryId: "custom-3d-printing",
    priceDisplay: "Custom Quote on WhatsApp",
    referencePriceInr: 999,
    minOfferFloorInr: 750,
    pricingModel: "ASK_WHATSAPP",
    image: "/assets/products/figurine.webp",
    gallery: [
      "/assets/products/figurine.webp",
      "/assets/gallery/WhatsApp Image 2026-09-24 at 10.18.26 AM (10).jpeg",
    ],
    shortDescription:
      "Send your 3D model, reference photos or idea. We print it with professional grade finish.",
    fullOverview:
      "From custom wedding cake toppers to prototype parts, company mascots and personalized caricature gifts. Send your reference file or picture on WhatsApp to get instant sizing and price options.",
    printSpecs: {
      technology: "Custom Spec (FDM or SLA Resin)",
      material: "PLA / PETG / Tough Resin / TPU Flexible",
      layerHeight: "0.08 mm to 0.20 mm custom choice",
      infillPercentage: "15% - 100% application dependent",
      printTimeHours: "Custom",
      dimensionsMm: "Scale to order up to 300 mm",
    },
    features: [
      "Direct 1-on-1 consultation on WhatsApp with print engineer",
      "Pre-print slicing preview and orientation optimization",
      "Fast turnaround in Delhi NCR with express shipping",
    ],
    model3D: {
      id: "mod-figurine",
      assetUrl: "/models/figurine.glb",
      format: "glb",
      byteSize: 7800000,
      dracoCompressed: true,
      triangleCount: 110000,
      dimensions: { widthMm: 90, heightMm: 160, depthMm: 90 },
      posterFallbackUrl: "/assets/products/figurine.webp",
      availableExplodedNodes: ["Custom Geometry", "Modular Base"],
    },
  },
  {
    id: "airplane",
    sku: "MKV-AIR-08",
    name: "Aerodynamic Mini Models",
    subtitle: "Precision scale model with smooth aerodynamic lines",
    category: "Collectibles & Miniatures",
    categoryId: "collectibles-miniatures",
    priceDisplay: "Ask on WhatsApp (Est. ₹399)",
    referencePriceInr: 399,
    minOfferFloorInr: 320,
    pricingModel: "ASK_WHATSAPP",
    image: "/assets/products/airplane.webp",
    gallery: [
      "/assets/products/airplane.webp",
      "/assets/gallery/WhatsApp Image 2026-09-24 at 10.18.26 AM (20).jpeg",
    ],
    shortDescription:
      "Crisp aerospace miniature display model engineered with thin wing trailing edges.",
    fullOverview:
      "A tribute to classic aeronautics, printed with zero support marks on upper surfaces for a silky smooth finish. Perfect for pilot gifts and aviation desks.",
    printSpecs: {
      technology: "Precision FDM",
      material: "Aero-Grade PLA",
      layerHeight: "0.12 mm",
      infillPercentage: "20%",
      printTimeHours: "4.0 Hours",
      dimensionsMm: "130 × 110 × 45 mm",
    },
    features: [
      "Includes display pedestal mount",
      "Smooth wing airfoil profile without drooping",
      "Available in dual-tone livery",
    ],
    model3D: {
      id: "mod-airplane",
      assetUrl: "/models/airplane.glb",
      format: "glb",
      byteSize: 3900000,
      dracoCompressed: true,
      triangleCount: 48000,
      dimensions: { widthMm: 130, heightMm: 45, depthMm: 110 },
      posterFallbackUrl: "/assets/products/airplane.webp",
      availableExplodedNodes: ["Wing Assembly", "Fuselage", "Display Stand"],
    },
  },
];