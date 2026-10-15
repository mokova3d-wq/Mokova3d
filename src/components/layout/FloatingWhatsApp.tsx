"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export function FloatingWhatsApp() {
  const whatsappUrl =
    "https://wa.me/918527373680?text=Hi%20Mokova3D%2C%20I%20have%20an%20enquiry%20about%20custom%203D%20printing%20or%20products.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-wa"
      aria-label="Chat with Mokova on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 fill-current" />
      <span>Chat with Mokova</span>
      <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded-full">↗</span>
    </a>
  );
}