"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

export function StorefrontShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <div className="min-h-screen bg-[#faf9f7] text-[#0e0c1d]">{children}</div>;
  }

  return (
    <>
      <div className="announcement">
        Custom orders available — send your idea, sketch or STL on WhatsApp.
      </div>
      <div className="topbar">
        IDEAS. DESIGNED. PRINTED. · CUSTOM 3D PRINTING · DELHI &amp; NCR
      </div>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}