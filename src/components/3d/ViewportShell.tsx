"use client";

import React, { useState } from "react";
import { Model3DDescriptor } from "@/contracts/3d-viewer.contract";
import { ClientModelCanvas } from "@/components/3d/ClientModelCanvas";
import { Box, Play, Sparkles, Layers } from "lucide-react";

export interface ViewportShellProps {
  model: Model3DDescriptor;
  productName: string;
  posterImage?: string;
  onExploreNode?: (nodeName: string) => void;
  className?: string;
}

export function ViewportShell({
  model,
  productName,
  posterImage,
  onExploreNode,
  className = "",
}: ViewportShellProps) {
  const [is3DActive, setIs3DActive] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {is3DActive ? (
        <ClientModelCanvas
          modelType={model.id || "cat"}
          productName={productName}
          posterImage={posterImage || model.posterFallbackUrl}
          dimensionsMm={`${model.dimensions.widthMm} × ${model.dimensions.heightMm} × ${model.dimensions.depthMm} mm`}
        />
      ) : (
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#0e0c1d] border border-black/10 flex items-center justify-center group">
          <img
            src={posterImage || model.posterFallbackUrl}
            alt={productName}
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center space-y-3">
            <span className="text-xs font-mono font-bold text-[#c8f542] px-3 py-1 rounded-full bg-white/10 backdrop-blur-md">
              On-Demand 3D WebGL Model
            </span>
            <button
              onClick={() => setIs3DActive(true)}
              className="px-6 py-3 rounded-xl bg-[#5a45ff] hover:bg-[#7d6bff] text-white font-bold text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
            >
              <Box className="w-4 h-4" />
              <span>Launch Interactive 3D Model</span>
            </button>
            <p className="text-[11px] text-white/70">
              WebGL client-rendered with orbit rotation, wireframe &amp; inspection tools.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}