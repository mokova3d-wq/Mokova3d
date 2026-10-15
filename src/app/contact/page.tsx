"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { CustomModelTelemetry } from "@/components/3d/CustomPrintModelViewer";

const CustomPrintModelViewer = dynamic(
  () => import("@/components/3d/CustomPrintModelViewer").then((m) => m.CustomPrintModelViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/3] sm:aspect-[16/10] bg-[#0c0f14] rounded-3xl flex flex-col items-center justify-center text-white space-y-3 border border-white/10">
        <div className="w-8 h-8 border-2 border-[#5a45ff] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#c8f542]">Initializing Studio 3D Metrology Engine...</span>
      </div>
    ),
  }
);

import {
  Upload,
  MessageCircle,
  Sparkles,
  FileText,
  CheckCircle2,
  Box,
  Layers,
  ShieldCheck,
  Send,
  MapPin,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Check,
  RotateCcw,
  Clock,
  Truck,
  Info,
  Ruler,
  Cpu,
  Package,
} from "lucide-react";
import { Input, Textarea } from "@/components/common/Input";

const MATERIALS = [
  {
    id: "PLA Matte",
    name: "Matte Bio-PLA",
    category: "Standard Precision",
    desc: "Smooth matte finish, biodegradable & non-toxic. Ideal for home décor, figurines, lamps & gifts.",
    layer: "0.16 mm",
    badge: "Most Popular",
  },
  {
    id: "Tough PETG",
    name: "Tough Engineering PETG",
    category: "Functional High-Strength",
    desc: "High impact resistance, chemical & UV resistant, heat deflection to 75°C. For brackets, mounts & outdoor parts.",
    layer: "0.20 mm",
    badge: "Structural",
  },
  {
    id: "High-Res Resin",
    name: "High-Res SLA Resin",
    category: "Liquid Photopolymer",
    desc: "Ultra-fine 0.05mm layer height cured with 405nm UV. Mirror-smooth surfaces for miniatures, jewelry & high tolerances.",
    layer: "0.05 mm",
    badge: "Ultra Detail",
  },
  {
    id: "Flexible TPU",
    name: "Flexible TPU (95A)",
    category: "Elastomeric Rubber",
    desc: "Semi-flexible rubber-like polymer. Wear-resistant & impact dampening for phone cases, gaskets & bumpers.",
    layer: "0.20 mm",
    badge: "Elastic",
  },
];

const COLORS = [
  { id: "#0e0c1d", name: "Midnight Black", hex: "#0e0c1d" },
  { id: "#f4f5f7", name: "Studio White", hex: "#f4f5f7" },
  { id: "#d4d0ee", name: "Marble Stone", hex: "#d4d0ee" },
  { id: "#d4af37", name: "Silk Gold", hex: "#d4af37" },
  { id: "#5a45ff", name: "Mokova Purple", hex: "#5a45ff" },
  { id: "#c8f542", name: "Neon Lime", hex: "#c8f542" },
];

const LAYER_RESOLUTIONS = [
  { id: "0.12", label: "0.12 mm Ultra-Fine", desc: "Museum cosmetic quality, virtually invisible layer lines" },
  { id: "0.16", label: "0.16 mm Studio Standard", desc: "Optimal balance of structural strength and surface finish" },
  { id: "0.20", label: "0.20 mm Rapid Prototype", desc: "Faster production run, ideal for functional iteration" },
];

const INFILL_DENSITIES = [
  { id: "15", label: "15% Gyroid", desc: "Lightweight, ideal for decorative objects" },
  { id: "35", label: "35% Honeycomb", desc: "Balanced strength for handles & functional parts" },
  { id: "60", label: "60% Heavy Duty", desc: "High mechanical load-bearing resistance" },
  { id: "100", label: "100% Solid Core", desc: "Rigid solid plastic for tooling and machining" },
];

export default function CustomPrintStudioPage() {
  const [inputMode, setInputMode] = useState<"upload-3d" | "reference-photo">("upload-3d");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sampleModel, setSampleModel] = useState<"bracket" | "gear" | "vase" | null>("bracket");

  // Manufacturing configuration state
  const [selectedMaterial, setSelectedMaterial] = useState("PLA Matte");
  const [selectedColor, setSelectedColor] = useState("#5a45ff");
  const [selectedLayer, setSelectedLayer] = useState("0.16");
  const [selectedInfill, setSelectedInfill] = useState("35");
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<CustomModelTelemetry | null>(null);

  // Client form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Delhi NCR");
  const [projectNotes, setProjectNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submissionResult, setSubmissionResult] = useState<{
    id: string;
    referenceCode: string;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setUploadedFile(f);
      setSampleModel(null);
      setSubmissionResult(null);
      setSubmitError("");
    }
  };

  const handleSelectSample = (type: "bracket" | "gear" | "vase") => {
    setUploadedFile(null);
    setSampleModel(type);
    setSubmissionResult(null);
    setSubmitError("");
  };

  const handleWhatsAppQuote = () => {
    const dimText = telemetry
      ? `${telemetry.widthMm} × ${telemetry.depthMm} × ${telemetry.heightMm} mm (~ ${telemetry.estimatedWeightGrams}g)`
      : "Custom Dimensions";

    const fileName = uploadedFile ? uploadedFile.name : `Sample ${sampleModel} model`;

    const text = encodeURIComponent(
      `Hi Mokova3D Studio! I would like a custom 3D printing manufacturing quote.\n` +
        `• Client Name: ${name || "Client"}\n` +
        `• Model File: ${fileName}\n` +
        `• Bounding Size: ${dimText}\n` +
        `• Material: ${selectedMaterial} (${COLORS.find((c) => c.id === selectedColor)?.name})\n` +
        `• Layer Height: ${selectedLayer} mm\n` +
        `• Infill Density: ${selectedInfill}%\n` +
        `• Quantity: ${quantity} unit(s)\n` +
        `• Delivery Location: ${city}\n` +
        `• Special Requirements: ${projectNotes || "Ready to send 3D file for slicing review!"}`
    );

    window.open(`https://wa.me/918527373680?text=${text}`, "_blank");
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setSubmitError("Please provide your name and contact phone number.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const fileName = uploadedFile
        ? uploadedFile.name
        : sampleModel
        ? `Studio Sample (${sampleModel})`
        : "Custom Reference Idea";

      const dimString = telemetry
        ? `${telemetry.widthMm}x${telemetry.depthMm}x${telemetry.heightMm}mm (~ ${telemetry.estimatedWeightGrams}g)`
        : "TBD";

      const rationaleText =
        `Material: ${selectedMaterial}, Color: ${COLORS.find((c) => c.id === selectedColor)?.name}, ` +
        `Layer: ${selectedLayer}mm, Infill: ${selectedInfill}%, Dimensions: ${dimString}, City: ${city}. ` +
        `Notes: ${projectNotes || "None"}`;

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CUSTOM_PRINT",
          product_name: `Custom Print: ${fileName}`,
          quantity,
          buyer_name: name,
          buyer_phone: phone,
          rationale: rationaleText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionResult({
          id: data.id,
          referenceCode: data.referenceCode || data.id,
          message: data.message,
        });
      } else {
        setSubmitError(data.error || "Failed to submit request.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Network error. Please try again or inquire via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-28 bg-[#faf9f7] text-[#0e0c1d]">
      {/* ── ATELIER INTRO HERO ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0c0f14] via-[#121622] to-[#0c0f14] text-white pt-16 pb-20 px-4 sm:px-8 border-b border-white/10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#5a45ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#c8f542]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#c8f542]/15 text-xs font-mono font-bold text-[#c8f542] border border-[#c8f542]/30 flex items-center gap-1.5 shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-[#c8f542]" />
              <span>DELHI NCR BESPOKE 3D MANUFACTURING ATELIER</span>
            </span>
            <span className="text-xs font-mono text-white/50">
              • Direct Physical Fabrication Service
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight leading-[1.08]">
                Turn Digital 3D Models <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
                  Into Precision Physical Objects.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
                Inspect your 3D geometry in our interactive browser metrology viewer, select production materials, and receive a verified engineering quotation from our Delhi studio team.
              </p>
            </div>

            {/* Atelier Manufacturing Workflow Pills */}
            <div className="lg:col-span-4 flex flex-col gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-[#c8f542] uppercase font-bold block">4-Phase Production Pipeline</span>
                <div className="text-white/80 space-y-0.5 text-[11px]">
                  <p>1. In-Browser Geometry Pre-Flight Check</p>
                  <p>2. Bambu / Prusa Slicing &amp; Wall Validation</p>
                  <p>3. High-Precision FDM / SLA 3D Printing</p>
                  <p>4. Post-Curing &amp; Express NCR Dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GUIDED CONFIGURATION WORKSPACE (4 STEPS) ─────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 my-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3D Geometry Metrology & Viewport (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Geometry Input Selection */}
            <div className="bg-white border border-black/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#5a45ff] text-white flex items-center justify-center text-xs font-bold font-mono">
                    1
                  </span>
                  <h2 className="font-bold text-base font-display text-[#0e0c1d]">
                    Provide Your 3D Geometry
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-[#faf9f7] rounded-xl border border-black/5 text-xs">
                  <button
                    type="button"
                    onClick={() => setInputMode("upload-3d")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      inputMode === "upload-3d"
                        ? "bg-[#5a45ff] text-white shadow-xs"
                        : "text-[#6a6880] hover:text-[#0e0c1d]"
                    }`}
                  >
                    3D Model (.STL / .OBJ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("reference-photo")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      inputMode === "reference-photo"
                        ? "bg-[#5a45ff] text-white shadow-xs"
                        : "text-[#6a6880] hover:text-[#0e0c1d]"
                    }`}
                  >
                    Photo / Idea
                  </button>
                </div>
              </div>

              {inputMode === "upload-3d" ? (
                <div className="space-y-4">
                  {/* File Upload Dropzone */}
                  {!uploadedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#5a45ff]/40 hover:border-[#5a45ff] rounded-2xl p-6 sm:p-8 bg-[#faf9f7] hover:bg-[#eeedfb]/20 text-center cursor-pointer transition-all group"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".stl,.obj,.3mf,.ply,.gltf,.glb"
                        className="hidden"
                      />
                      <div className="w-12 h-12 bg-[#eeedfb] text-[#5a45ff] group-hover:scale-110 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform shadow-xs">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-sm text-[#0e0c1d] font-display">
                        Select or Drag 3D File (.STL, .OBJ, .3MF, .GLB)
                      </h3>
                      <p className="text-xs text-[#6a6880] mt-1 max-w-sm mx-auto">
                        Rendered 100% locally in your browser. Files remain strictly private on your device until quote submission.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#faf9f7] border border-black/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0e0c1d] text-white flex items-center justify-center">
                          <Box className="w-5 h-5 text-[#c8f542]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0e0c1d] truncate max-w-[200px] sm:max-w-xs">
                            {uploadedFile.name}
                          </p>
                          <p className="text-[11px] font-mono text-[#6a6880]">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadedFile.name.split(".").pop()?.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-[#eeedfb] text-xs font-bold transition-colors cursor-pointer"
                      >
                        Change File
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".stl,.obj,.3mf,.ply,.gltf,.glb"
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* Calibration Specimen Presets */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <span className="font-bold text-[#6a6880] flex items-center gap-1.5 text-[11px] uppercase font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-[#5a45ff]" />
                      <span>Or test with studio specimen:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectSample("bracket")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          sampleModel === "bracket" && !uploadedFile
                            ? "bg-[#5a45ff] text-white shadow-xs"
                            : "bg-[#faf9f7] text-[#0e0c1d] hover:bg-[#eeedfb] border border-black/5"
                        }`}
                      >
                        Angle Bracket
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample("gear")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          sampleModel === "gear" && !uploadedFile
                            ? "bg-[#5a45ff] text-white shadow-xs"
                            : "bg-[#faf9f7] text-[#0e0c1d] hover:bg-[#eeedfb] border border-black/5"
                        }`}
                      >
                        Precision Gear
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample("vase")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          sampleModel === "vase" && !uploadedFile
                            ? "bg-[#5a45ff] text-white shadow-xs"
                            : "bg-[#faf9f7] text-[#0e0c1d] hover:bg-[#eeedfb] border border-black/5"
                        }`}
                      >
                        Parametric Vase
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#faf9f7] border border-black/10 space-y-3 text-xs">
                  <h4 className="font-bold text-sm text-[#0e0c1d]">No 3D Model? We Can Model It For You</h4>
                  <p className="text-[#6a6880] leading-relaxed">
                    If you only have a napkin sketch, reference photo, or Pinterest image, our Delhi CAD engineers will model your concept in Fusion360/Blender. Enter your project notes in Step 4 below and attach photos via WhatsApp!
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Interactive 3D Metrology Viewport & Slicing Pre-Flight Check */}
            {inputMode === "upload-3d" && (
              <div className="bg-white border border-black/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#5a45ff] text-white flex items-center justify-center text-xs font-bold font-mono">
                      2
                    </span>
                    <h2 className="font-bold text-base font-display text-[#0e0c1d]">
                      Interactive 3D Metrology &amp; Pre-Flight Check
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-[#6a6880]">250×250×250mm Envelope</span>
                </div>

                {/* 3D Canvas Viewport */}
                <CustomPrintModelViewer
                  file={uploadedFile}
                  sampleType={sampleModel}
                  materialType={selectedMaterial}
                  materialColor={selectedColor}
                  onTelemetryCalculated={setTelemetry}
                />

                {/* Live Metrology Telemetry & Pre-Flight Analysis */}
                {telemetry && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                      <div className="p-3 bg-[#faf9f7] rounded-xl border border-black/5">
                        <span className="text-[10px] text-[#6a6880] uppercase block">BOUNDING SIZE</span>
                        <strong className="text-[#0e0c1d] block mt-0.5">
                          {telemetry.widthMm} × {telemetry.depthMm} × {telemetry.heightMm} mm
                        </strong>
                      </div>

                      <div className="p-3 bg-[#faf9f7] rounded-xl border border-black/5">
                        <span className="text-[10px] text-[#6a6880] uppercase block">EST. FILAMENT</span>
                        <strong className="text-[#5a45ff] block mt-0.5">
                          ~{telemetry.estimatedWeightGrams} grams
                        </strong>
                      </div>

                      <div className="p-3 bg-[#faf9f7] rounded-xl border border-black/5">
                        <span className="text-[10px] text-[#6a6880] uppercase block">MESH VOLUME</span>
                        <strong className="text-[#0e0c1d] block mt-0.5">
                          {telemetry.volumeCm3} cm³
                        </strong>
                      </div>

                      <div className="p-3 bg-[#faf9f7] rounded-xl border border-black/5">
                        <span className="text-[10px] text-[#6a6880] uppercase block">TRIANGLES</span>
                        <strong className="text-[#0e0c1d] block mt-0.5">
                          {telemetry.triangleCount.toLocaleString()} Tris
                        </strong>
                      </div>
                    </div>

                    {/* Pre-Flight Build Envelope Validation Banner */}
                    <div
                      className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        telemetry.fitsBuildPlate
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {telemetry.fitsBuildPlate ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <span className="font-semibold">{telemetry.clearanceNotice}</span>
                      </div>
                      <span className="text-[10px] font-mono shrink-0">Bambu / Prusa Studio Bed</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Manufacturing Specs & Quote Submission (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 3: Manufacturing Specifications */}
            <div className="bg-white border border-black/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#5a45ff] text-white flex items-center justify-center text-xs font-bold font-mono">
                  3
                </span>
                <h2 className="font-bold text-base font-display text-[#0e0c1d]">
                  Manufacturing Specifications
                </h2>
              </div>

              {/* Material Selection Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0e0c1d]">
                  Select Engineering Material
                </label>
                <div className="space-y-2">
                  {MATERIALS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMaterial(m.id)}
                      className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        selectedMaterial === m.id
                          ? "border-[#5a45ff] bg-[#eeedfb]/60 shadow-xs"
                          : "border-black/10 hover:border-black/20 bg-[#faf9f7]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-[#0e0c1d]">{m.name}</strong>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/5 text-[#5a45ff]">
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6a6880] mt-1 leading-snug">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filament Color Swatches */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0e0c1d]">
                    Filament Color (Updates 3D Viewport)
                  </label>
                  <span className="text-xs font-mono text-[#5a45ff] font-bold">
                    {COLORS.find((c) => c.id === selectedColor)?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.id)}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedColor === c.id
                          ? "scale-125 border-[#5a45ff] shadow-md"
                          : "border-black/20 hover:scale-110"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Layer Resolution & Infill */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Layer Resolution</label>
                  <select
                    value={selectedLayer}
                    onChange={(e) => setSelectedLayer(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#5a45ff] cursor-pointer"
                  >
                    {LAYER_RESOLUTIONS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0e0c1d] mb-1">Infill Density</label>
                  <select
                    value={selectedInfill}
                    onChange={(e) => setSelectedInfill(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf9f7] border border-black/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#5a45ff] cursor-pointer"
                  >
                    {INFILL_DENSITIES.map((inf) => (
                      <option key={inf.id} value={inf.id}>
                        {inf.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between p-3.5 bg-[#faf9f7] rounded-2xl border border-black/5">
                <div>
                  <span className="text-xs font-bold text-[#0e0c1d] block">Batch Quantity</span>
                  <span className="text-[10px] text-[#6a6880]">Units to fabricate</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-black/10 text-sm font-bold flex items-center justify-center hover:bg-[#eeedfb]"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm text-[#0e0c1d]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(200, q + 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-black/10 text-sm font-bold flex items-center justify-center hover:bg-[#eeedfb]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4: Transparent Quote Review & Submission */}
            <div className="bg-white border border-black/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#5a45ff] text-white flex items-center justify-center text-xs font-bold font-mono">
                  4
                </span>
                <h2 className="font-bold text-base font-display text-[#0e0c1d]">
                  Review &amp; Request Quote
                </h2>
              </div>

              {/* Transparent Pricing Notice */}
              <div className="p-3.5 bg-[#eeedfb]/60 rounded-2xl border border-[#5a45ff]/20 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#0e0c1d]">
                  <Info className="w-3.5 h-3.5 text-[#5a45ff] shrink-0" />
                  <span>Transparent Studio Pricing Policy</span>
                </div>
                <p className="text-[11px] text-[#6a6880] leading-relaxed">
                  We never generate fake instant price guesses. Our Delhi manufacturing team analyzes your geometry in slicer software to calculate exact machine runtime and weight, replying on WhatsApp within 1–2 hours.
                </p>
              </div>

              {/* Success Result Card */}
              {submissionResult ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <strong className="text-sm font-display font-bold">Print Request Received!</strong>
                  </div>
                  <p className="text-xs leading-relaxed">{submissionResult.message}</p>

                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs font-mono space-y-1">
                    <span className="text-[10px] text-[#6a6880] block">STUDIO TRACKING REFERENCE:</span>
                    <strong className="text-emerald-800 text-sm font-bold block">{submissionResult.referenceCode}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleWhatsAppQuote}
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Config Direct to Studio on WhatsApp</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Your Name *"
                      placeholder="e.g. Rohan Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="WhatsApp Phone Number *"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <Input
                    label="Delivery Location / Pincode"
                    placeholder="Delhi, Noida, Gurugram, etc."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />

                  <Textarea
                    label="Special Manufacturing Requirements"
                    placeholder="e.g. Needs threaded brass heat-set inserts, high-temperature resistance, or smooth sanded finish..."
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    rows={2}
                  />

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Submission Action Buttons */}
                  <div className="space-y-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#0e0c1d] hover:bg-[#5a45ff] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 text-[#c8f542]" />
                      <span>{isSubmitting ? "Logging Request..." : "Submit Custom Print Request"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWhatsAppQuote}
                      className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Or Get Priority Quote via WhatsApp →</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Clearly Disclosed File Retention Policy */}
              <div className="pt-3 border-t border-black/5 text-[11px] text-[#6a6880] space-y-1 leading-relaxed">
                <span className="font-bold text-[#0e0c1d] block">Atelier File Retention Policy:</span>
                <p>
                  Files inspected in our 3D preview remain 100% in your local browser sandbox. Files submitted with your print quote request are held in our private engineering queue solely for wall analysis, slicing, and order fulfillment. They are never published, indexed, or shared with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
