import React from "react";
import { ShieldCheck, Layers, Cpu, Truck, CheckCircle2, MessageCircle } from "lucide-react";

export function TrustProcessSection({ title, subtitle }: { title?: string; subtitle?: string }) {
  const steps = [
    {
      num: "01",
      icon: <Cpu className="w-5 h-5 text-[#5a45ff]" />,
      title: "Watertight Slicing & Orientation",
      desc: "Every model is analyzed in CAD for optimal print angles, avoiding fragile overhangs and layer delamination.",
    },
    {
      num: "02",
      icon: <Layers className="w-5 h-5 text-[#5a45ff]" />,
      title: "Calibrated Layer Deposition",
      desc: "Printed using tuned 0.12mm to 0.16mm layer heights on leveled heated beds with bio-friendly PLA & PETG.",
    },
    {
      num: "03",
      icon: <ShieldCheck className="w-5 h-5 text-[#5a45ff]" />,
      title: "Studio De-burring & Inspection",
      desc: "Support structures are carefully removed, seam lines refined, and dimensional tolerances verified by our print engineer.",
    },
    {
      num: "04",
      icon: <Truck className="w-5 h-5 text-[#5a45ff]" />,
      title: "Local Delhi NCR Courier",
      desc: "Fast local courier delivery across Delhi, Gurgaon, Noida, Faridabad, plus tracked shipping across India.",
    },
  ];

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 my-20">
      <div className="bg-[#0c0f14] text-white rounded-[34px] border border-white/10 p-8 sm:p-14 shadow-2xl space-y-12 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#5a45ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-bold text-[#c8f542] border border-white/10 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{title || "STUDIO CRAFT & VERIFICATION PROTOCOL"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
              How Physical 3D Quality is Built
            </h2>
            <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl">
              {subtitle ||
                "We don't mass-produce generic plastic. Every print is calibrated and inspected right here in Delhi."}
            </p>
          </div>

          <a
            href="https://wa.me/918527373680?text=Hi%20Mokova3D%2C%20I%20have%20questions%20about%20your%203D%20printing%20process%20and%20materials."
            target="_blank"
            rel="noopener noreferrer"
            className="btn wa text-xs font-bold py-2.5 px-4 shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Consult Print Engineer</span>
          </a>
        </div>

        {/* 4 Process Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-6 rounded-2xl bg-[#12161f] border border-white/10 space-y-4 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="font-mono text-xl font-bold text-[#c8f542]">{s.num}</span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white font-display mb-1.5">{s.title}</h3>
                <p className="text-xs text-white/70 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}