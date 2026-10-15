"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import {
  Box,
  Layers,
  Sparkles,
  Sliders,
  DollarSign,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Play,
  Pause,
  Upload,
  Cpu,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, createWhatsAppHaggleUrl } from "@/lib/utils";
import { OfferModal } from "@/components/negotiation/OfferModal";

interface HeroSpecimen {
  id: string;
  sku: string;
  name: string;
  tagline: string;
  category: string;
  priceDisplay: string;
  referencePriceInr: number;
  minOfferFloorInr: number;
  image: string;
  dimensionsMm: string;
  material: string;
  totalLayers: number;
  printTimeHours: string;
  model3DType: "cat" | "penguin" | "lamp" | "figurine";
  accentColor: string;
}

const HERO_SPECIMENS: HeroSpecimen[] = [
  {
    id: "cat",
    sku: "MKV-CAT-01",
    name: "Cute Cat Desk Companion",
    tagline: "Precision dual-tone weighted desktop print with zero seam artifacts",
    category: "Cute & Fun Figures",
    priceDisplay: "?299",
    referencePriceInr: 299,
    minOfferFloorInr: 240,
    image: "/assets/products/cat.jpg",
    dimensionsMm: "65 ? 52 ? 85 mm",
    material: "Matte Bio-PLA",
    totalLayers: 530,
    printTimeHours: "4.5 Hrs",
    model3DType: "cat",
    accentColor: "#5a45ff",
  },
  {
    id: "lamp",
    sku: "MKV-LMP-03",
    name: "Custom Shadow Projection Lamp",
    tagline: "Lithophane-inspired perforated geometric shade with warm room projection",
    category: "Lamps & Lighting",
    priceDisplay: "?799 (Est.)",
    referencePriceInr: 799,
    minOfferFloorInr: 650,
    image: "/assets/products/lamp.jpg",
    dimensionsMm: "120 ? 120 ? 180 mm",
    material: "Heat-Tolerant PETG",
    totalLayers: 1125,
    printTimeHours: "14.0 Hrs",
    model3DType: "lamp",
    accentColor: "#f59e0b",
  },
  {
    id: "penguin",
    sku: "MKV-PNG-02",
    name: "Roly-Poly Wobble Penguin",
    tagline: "Engineered low-center-of-gravity self-righting desktop companion",
    category: "Cute & Fun Figures",
    priceDisplay: "?299",
    referencePriceInr: 299,
    minOfferFloorInr: 240,
    image: "/assets/products/penguin.jpg",
    dimensionsMm: "70 ? 68 ? 90 mm",
    material: "Food-Grade PLA+",
    totalLayers: 560,
    printTimeHours: "5.0 Hrs",
    model3DType: "penguin",
    accentColor: "#c8f542",
  },
  {
    id: "figurine",
    sku: "MKV-CST-09",
    name: "Bespoke Custom 3D Figurine",
    tagline: "Sculpted and printed from client reference sketch or STL file",
    category: "Custom 3D Printing",
    priceDisplay: "?999 (Custom)",
    referencePriceInr: 999,
    minOfferFloorInr: 750,
    image: "/assets/products/figurine.jpg",
    dimensionsMm: "90 ? 90 ? 160 mm",
    material: "High-Detail Resin / Tough PLA",
    totalLayers: 1330,
    printTimeHours: "11.5 Hrs",
    model3DType: "figurine",
    accentColor: "#38bdf8",
  },
];

export function SignatureStudioHero() {
  const [selectedSpecimen, setSelectedSpecimen] = useState<HeroSpecimen>(HERO_SPECIMENS[0]);
  const [layerProgress, setLayerProgress] = useState<number>(75); // 0 to 100%
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<"shaded" | "wireframe" | "specular">("shaded");

  // Negotiation slider states inside hero
  const [targetOffer, setTargetOffer] = useState<number>(
    Math.round(HERO_SPECIMENS[0].referencePriceInr * 0.9)
  );
  const [offerQty, setOfferQty] = useState<number>(1);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState<boolean>(false);

  // Three.js Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const materialListRef = useRef<THREE.Material[]>([]);

  // Update target offer when specimen changes
  useEffect(() => {
    setTargetOffer(Math.round(selectedSpecimen.referencePriceInr * 0.9));
  }, [selectedSpecimen]);

  // Three.js build-plate setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (renderErr) {
      console.error("WebGLRenderer initialization failed in SignatureStudioHero:", renderErr);
      return;
    }

    // Studio lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfff7ed, 2.5);
    key.position.set(4, 8, 4);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x7d6bff, 1.8);
    rim.position.set(-4, 3, -3);
    scene.add(rim);

    // Build Plate Heated Grid (10mm squares)
    const grid = new THREE.GridHelper(4.5, 30, 0xf59e0b, 0x222a38);
    grid.position.y = -0.01;
    scene.add(grid);

    // Build Plate Aluminum Bed outline
    const bedGeo = new THREE.BoxGeometry(4.6, 0.05, 4.6);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x0f131a, roughness: 0.8 });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.position.y = -0.035;
    scene.add(bedMesh);

    // Model assembly
    const group = new THREE.Group();
    modelGroupRef.current = group;
    materialListRef.current = [];

    const createMat = (color: number, roughness = 0.35) => {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness: 0.1,
        wireframe: renderMode === "wireframe",
      });
      materialListRef.current.push(mat);
      return mat;
    };

    if (selectedSpecimen.model3DType === "cat") {
      const bodyGeo = new THREE.CylinderGeometry(0.5, 0.7, 1.2, 32);
      const bodyMesh = new THREE.Mesh(bodyGeo, createMat(0x181824));
      bodyMesh.position.y = 0.6;
      group.add(bodyMesh);

      const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
      const headMesh = new THREE.Mesh(headGeo, createMat(0xf8fafc));
      headMesh.position.y = 1.45;
      group.add(headMesh);

      const earGeo = new THREE.ConeGeometry(0.2, 0.35, 16);
      const earL = new THREE.Mesh(earGeo, createMat(0x5a45ff));
      earL.position.set(-0.25, 1.95, 0.1);
      earL.rotation.z = 0.2;
      group.add(earL);

      const earR = new THREE.Mesh(earGeo, createMat(0x5a45ff));
      earR.position.set(0.25, 1.95, 0.1);
      earR.rotation.z = -0.2;
      group.add(earR);
    } else if (selectedSpecimen.model3DType === "lamp") {
      const baseGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.25, 32);
      const baseMesh = new THREE.Mesh(baseGeo, createMat(0x181824));
      baseMesh.position.y = 0.12;
      group.add(baseMesh);

      const shadeGeo = new THREE.CylinderGeometry(0.55, 0.7, 1.4, 8, 8, true);
      const shadeMesh = new THREE.Mesh(shadeGeo, createMat(0xffedd5, 0.1));
      shadeMesh.position.y = 1.1;
      group.add(shadeMesh);

      const bulbGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const bulbMesh = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      bulbMesh.position.y = 0.9;
      group.add(bulbMesh);
    } else if (selectedSpecimen.model3DType === "penguin") {
      const bodyGeo = new THREE.SphereGeometry(0.8, 32, 32);
      bodyGeo.scale(1, 1.3, 1);
      const bodyMesh = new THREE.Mesh(bodyGeo, createMat(0x181824));
      bodyMesh.position.y = 0.9;
      group.add(bodyMesh);

      const bellyGeo = new THREE.SphereGeometry(0.65, 32, 32);
      bellyGeo.scale(0.85, 1.1, 0.5);
      const bellyMesh = new THREE.Mesh(bellyGeo, createMat(0xffffff));
      bellyMesh.position.set(0, 0.85, 0.45);
      group.add(bellyMesh);

      const beakGeo = new THREE.ConeGeometry(0.12, 0.25, 16);
      const beakMesh = new THREE.Mesh(beakGeo, createMat(0xf59e0b));
      beakMesh.position.set(0, 1.25, 0.8);
      beakMesh.rotation.x = Math.PI / 2;
      group.add(beakMesh);
    } else {
      const knotGeo = new THREE.TorusKnotGeometry(0.65, 0.22, 64, 16);
      const knotMesh = new THREE.Mesh(knotGeo, createMat(0x38bdf8));
      knotMesh.position.y = 1.0;
      group.add(knotMesh);

      const standGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.2, 32);
      const standMesh = new THREE.Mesh(standGeo, createMat(0x181824));
      standMesh.position.y = 0.1;
      group.add(standMesh);
    }

    scene.add(group);

    // Mouse drag rotation
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !group) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      group.rotation.y += dx * 0.008;
      group.rotation.x += dy * 0.008;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (group && isRotating && !isDragging) {
        group.rotation.y += 0.006;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [selectedSpecimen, isRotating]);

  // Update wireframe / shader mode
  useEffect(() => {
    for (const mat of materialListRef.current) {
      if ("wireframe" in mat) {
        (mat as any).wireframe = renderMode === "wireframe";
      }
      if ("roughness" in mat) {
        (mat as any).roughness = renderMode === "specular" ? 0.05 : 0.35;
      }
    }
  }, [renderMode]);

  // Variance calculation
  const variancePercent =
    ((targetOffer - selectedSpecimen.referencePriceInr) / selectedSpecimen.referencePriceInr) * 100;
  const isBelowFloor = targetOffer < selectedSpecimen.minOfferFloorInr;

  let assessment = {
    color: "text-emerald-400 bg-emerald-950/40 border-emerald-500/30",
    label: "Feasible Offer ? High Acceptance SLA (<1 Hr)",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  };

  if (variancePercent < -22) {
    assessment = {
      color: "text-red-400 bg-red-950/40 border-red-500/30",
      label: "Deep Discount ? Subject to Batch Quantity",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
    };
  } else if (variancePercent < -12) {
    assessment = {
      color: "text-amber-400 bg-amber-950/40 border-amber-500/30",
      label: "Competitive Offer ? Evaluated on Infill & Lead Time",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
    };
  }

  const currentLayerNumber = Math.round((layerProgress / 100) * selectedSpecimen.totalLayers);

  const handleWhatsAppLock = () => {
    const url = createWhatsAppHaggleUrl(
      selectedSpecimen.name,
      targetOffer,
      offerQty,
      `Inspected on build plate (Layer ${currentLayerNumber}, Material: ${selectedSpecimen.material}). Ready to order in Delhi NCR!`
    );
    window.open(url, "_blank");
  };

  return (
    <section className="relative w-full pt-4 pb-12 px-4 sm:px-6 max-w-[1320px] mx-auto">
      {/* 1. Master Technical Chassis Container */}
      <div className="relative rounded-[32px] bg-[#090b0e] border border-white/10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Subtle grid lines background */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* 2. Top Precision Telemetry Strip */}
        <div className="px-6 py-3.5 border-b border-white/10 bg-[#11151c]/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-white/70">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[#c8f542] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#c8f542] animate-pulse" />
              MOKOVA3D ATELIER
            </span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span className="hidden sm:inline text-white/80">DELHI &amp; NCR STUDIO PRINTERS</span>
          </div>

          <div className="flex items-center gap-4 text-[10px] sm:text-[11px]">
            <span className="inline-flex items-center gap-1 text-white/90">
              <Flame className="w-3 h-3 text-[#f59e0b]" />
              <span>BED: 60?C</span>
            </span>
            <span className="inline-flex items-center gap-1 text-white/90">
              <Cpu className="w-3 h-3 text-[#38bdf8]" />
              <span>NOZZLE: 215?C</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[#c8f542] font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>TOLERANCE: ?0.05 mm</span>
            </span>
          </div>
        </div>

        {/* 3. Main Split Stage: Interactive Build Plate (Left) & Price Discovery Console (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px] lg:min-h-[620px]">
          {/* Left Column: Interactive Build Plate Inspection Stage (7 cols) */}
          <div className="lg:col-span-7 relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 p-5 sm:p-7">
            {/* Viewport Top Bar Controls */}
            <div className="flex items-center justify-between gap-3 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-mono font-bold text-[#f59e0b] border border-white/10">
                  ACTIVE BUILD BED
                </span>
                <span className="text-xs font-mono text-white/80 font-bold truncate max-w-[180px] sm:max-w-none">
                  {selectedSpecimen.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsRotating(!isRotating)}
                  title={isRotating ? "Pause Turntable" : "Start Turntable"}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    if (modelGroupRef.current) modelGroupRef.current.rotation.set(0, 0, 0);
                  }}
                  title="Reset Bed View"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Shaders */}
                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 ml-1">
                  <button
                    onClick={() => setRenderMode("shaded")}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      renderMode === "shaded" ? "bg-[#5a45ff] text-white" : "text-white/60"
                    }`}
                  >
                    Solid
                  </button>
                  <button
                    onClick={() => setRenderMode("wireframe")}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      renderMode === "wireframe" ? "bg-[#c8f542] text-[#0e0c1d]" : "text-white/60"
                    }`}
                  >
                    Wire
                  </button>
                </div>
              </div>
            </div>

            {/* Central WebGL Build Bed Canvas */}
            <div
              ref={containerRef}
              className="relative w-full flex-1 min-h-[320px] sm:min-h-[380px] flex items-center justify-center cursor-grab active:cursor-grabbing my-2"
            >
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Build Bed Dimensional Caliper Callout */}
              <div className="absolute bottom-3 left-3 bg-[#11151c]/90 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-mono text-white/80 backdrop-blur-md space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-white/50">BOUNDING:</span>
                  <span className="font-bold text-white">{selectedSpecimen.dimensionsMm}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span>BUILD TIME:</span>
                  <span className="text-[#c8f542] font-semibold">{selectedSpecimen.printTimeHours}</span>
                </div>
              </div>

              {/* Quick Drop File Target Hint */}
              <Link
                href="/contact"
                className="absolute top-3 right-3 bg-white/10 hover:bg-[#5a45ff] text-white border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md"
              >
                <Upload className="w-3 h-3 text-[#c8f542]" />
                <span>Drop Your STL onto Bed ?</span>
              </Link>
            </div>

            {/* Layer Height Slicer Scrubber (Signature Interaction) */}
            <div className="bg-[#11151c]/90 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md space-y-2 z-10">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-white/70">
                  <Layers className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>SLICER INSPECTION SCRUBBER:</span>
                </span>
                <span className="text-white font-bold">
                  Layer <span className="text-[#c8f542]">{currentLayerNumber}</span> /{" "}
                  {selectedSpecimen.totalLayers} (0.16 mm Resolution)
                </span>
              </div>

              <input
                type="range"
                min={10}
                max={100}
                value={layerProgress}
                onChange={(e) => setLayerProgress(Number(e.target.value))}
                className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
              />

              <div className="flex items-center justify-between text-[10px] text-white/50 font-mono">
                <span>Build Plate Base (0mm)</span>
                <span>Drag to simulate physical print layers</span>
                <span>Top Finish Cap</span>
              </div>
            </div>

            {/* Specimen Dock: 4 Real Studio Products */}
            <div className="pt-4 mt-2 border-t border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 block">
                Select Specimen to Inspect on Build Plate:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HERO_SPECIMENS.map((spec) => {
                  const isSelected = selectedSpecimen.id === spec.id;
                  return (
                    <button
                      key={spec.id}
                      onClick={() => setSelectedSpecimen(spec)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? "bg-white/15 border-[#f59e0b] shadow-md"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <img
                        src={spec.image}
                        alt={spec.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10"
                      />
                      <div className="min-w-0">
                        <strong className="block text-[11px] font-bold text-white truncate">
                          {spec.name}
                        </strong>
                        <span className="text-[10px] font-mono text-[#f59e0b]">
                          {spec.priceDisplay}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Integrated Bilateral Negotiation & Discovery Console (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#0c0f14]/60">
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                  DIRECT PRICE NEGOTIATION DESK
                </span>
                <span className="text-[11px] font-mono text-white/50">SKU: {selectedSpecimen.sku}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight leading-tight">
                Inspect spatial detail. <br />
                <span className="text-[#f59e0b]">Haggle the price directly.</span>
              </h2>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                {selectedSpecimen.tagline}. High-value 3D prints are rarely rigid retail items.
                Adjust your target unit price below to test real-time acceptance feasibility.
              </p>
            </div>

            {/* The Live Haggle Calculator Card */}
            <div className="p-5 rounded-2xl bg-[#12161f] border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-baseline justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-mono text-white/50 block">
                    Reference Price
                  </span>
                  <span className="text-2xl font-bold font-display text-white">
                    {formatCurrency(selectedSpecimen.referencePriceInr)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-[#f59e0b] block">
                    Floor Threshold
                  </span>
                  <span className="text-xs font-mono text-white/80 font-bold">
                    Offers from {formatCurrency(selectedSpecimen.minOfferFloorInr)}
                  </span>
                </div>
              </div>

              {/* Target Price input & quantity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-white/70">
                  <span>Propose Target Unit Price:</span>
                  <span className="text-white font-bold">
                    Variance: {variancePercent > 0 ? "+" : ""}
                    {variancePercent.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#f59e0b]">
                      ?
                    </span>
                    <input
                      type="number"
                      min={Math.round(selectedSpecimen.referencePriceInr * 0.6)}
                      max={selectedSpecimen.referencePriceInr * 1.5}
                      step={10}
                      value={targetOffer}
                      onChange={(e) => setTargetOffer(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 bg-[#090b0e] border border-white/15 rounded-xl text-base font-bold font-mono text-white focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={offerQty}
                      onChange={(e) => setOfferQty(Math.max(1, Number(e.target.value)))}
                      placeholder="Qty"
                      title="Quantity"
                      className="w-full px-3 py-2.5 bg-[#090b0e] border border-white/15 rounded-xl text-xs font-mono text-center font-bold text-white focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>
                </div>

                {/* Quick slider */}
                <input
                  type="range"
                  min={Math.round(selectedSpecimen.referencePriceInr * 0.65)}
                  max={selectedSpecimen.referencePriceInr}
                  step={10}
                  value={targetOffer}
                  onChange={(e) => setTargetOffer(Number(e.target.value))}
                  className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-[#f59e0b] mt-1"
                />
              </div>

              {/* Live Feasibility Gauge */}
              <div
                className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${assessment.color}`}
              >
                {assessment.icon}
                <span className="text-[11px] font-semibold">{assessment.label}</span>
              </div>
            </div>

            {/* Direct Primary Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleWhatsAppLock}
                className="w-full py-3.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  Lock Offer ({formatCurrency(targetOffer * offerQty)}) on WhatsApp ?
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Log Offer on Site
                </button>

                <Link
                  href={`/product/${selectedSpecimen.id}`}
                  className="py-2.5 px-3 rounded-xl bg-[#5a45ff] hover:bg-[#7d6bff] text-white font-bold text-xs transition-colors text-center"
                >
                  Full Specs &amp; Gallery ?
                </Link>
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/50 font-mono pt-1">
                <span>Delhi &amp; NCR Fast Courier</span>
                <span>?</span>
                <span>In-Stock Studio Filament Swatches</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {isOfferModalOpen && (
        <OfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          product={{
            id: selectedSpecimen.id,
            sku: selectedSpecimen.sku,
            name: selectedSpecimen.name,
            subtitle: selectedSpecimen.tagline,
            category: selectedSpecimen.category,
            categoryId: "cute-fun",
            priceDisplay: selectedSpecimen.priceDisplay,
            referencePriceInr: selectedSpecimen.referencePriceInr,
            minOfferFloorInr: selectedSpecimen.minOfferFloorInr,
            pricingModel: "FIXED_OR_HAGGLE",
            image: selectedSpecimen.image,
            gallery: [selectedSpecimen.image],
            shortDescription: selectedSpecimen.tagline,
            fullOverview: "",
            printSpecs: {
              technology: "FDM Precision 3D Printing",
              material: selectedSpecimen.material,
              layerHeight: "0.16 mm",
              infillPercentage: "20%",
              printTimeHours: selectedSpecimen.printTimeHours,
              dimensionsMm: selectedSpecimen.dimensionsMm,
            },
            features: [],
            model3D: {
              id: selectedSpecimen.model3DType,
              assetUrl: `/models/${selectedSpecimen.id}.glb`,
              format: "glb" as const,
              byteSize: 3200000,
              dracoCompressed: true,
              triangleCount: 42000,
              dimensions: { widthMm: 90, heightMm: 120, depthMm: 80 },
              posterFallbackUrl: selectedSpecimen.image,
            },
          }}
        />
      )}
    </section>
  );
}
