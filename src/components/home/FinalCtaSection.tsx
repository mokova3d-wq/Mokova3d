import React from "react";
import Link from "next/link";
import { ArrowRight, Box, MessageCircle, Upload } from "lucide-react";

export function FinalCtaSection({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 my-20">
      <div className="dark rounded-[36px] p-8 sm:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden border border-white/10">
        <div className="space-y-4 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-bold text-[#c8f542] border border-white/10">
            <Box className="w-3.5 h-3.5" />
            <span>{title || "BESPOKE 3D PRINTING & SLICING"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight leading-tight">
            Can’t find the exact model you need?
          </h2>

          <p className="text-sm text-white/80 leading-relaxed">
            {subtitle ||
              "Drop your own .STL / .OBJ file into our interactive client-side 3D Print Studio, or send a reference photo on WhatsApp. We provide exact millimeter measurements and instant quotes for Delhi & NCR."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0 w-full md:w-auto">
          <Link
            href="/contact"
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#c8f542] hover:bg-[#b5e032] text-[#0e0c1d] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Upload className="w-4 h-4" />
            <span>Launch 3D Print Studio</span>
          </Link>

          <a
            href="https://wa.me/918527373680?text=Hi%20Mokova3D!%20I%20have%20a%20custom%203D%20printing%20request."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Send File on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}