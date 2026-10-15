"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Minus, MessageCircle, ArrowRight } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Can I request a custom design?",
    a: "Yes. Send a photo, sketch, STL file, product link or just describe the idea on WhatsApp. We'll confirm size, material, colour and price before printing anything.",
  },
  {
    q: "What can I send as a reference for custom printing?",
    a: "Any of these works: a photo, a hand sketch, an STL/OBJ model, a product link or a rough description with dimensions. More detail means a faster, more accurate quote.",
  },
  {
    q: "Do you print prototypes and functional parts?",
    a: "Yes. We print prototypes, brackets, holders, replacement parts and other functional pieces. Tell us what the part does so we can suggest the right material and strength.",
  },
  {
    q: "How do I place an order or ask for prices?",
    a: "Open any product and tap Ask on WhatsApp or click Make an Offer / Haggle Price on the website. We confirm the price and delivery, then start printing after your approval.",
  },
  {
    q: "Can I choose custom colours?",
    a: "For most products, yes! Available colours include matte black, white, stone marble, silk gold, pastel tones and transparent shades.",
  },
  {
    q: "What materials do you print with?",
    a: "Mostly PLA, tough PETG, and high-detail Resin, which suit home décor, gifts and everyday functional use.",
  },
  {
    q: "How long does delivery take in Delhi & NCR?",
    a: "Ready designs usually take 1–3 business days. Custom or multi-part models take 3–5 days. We give you a clear timeline when we confirm the order.",
  },
  {
    q: "Do you deliver outside Delhi & NCR?",
    a: "Yes! While we are based in Delhi NCR, we ship across all states in India via tracked courier partners.",
  },
  {
    q: "Can I order in bulk or for event gifting?",
    a: "Yes! We specialize in corporate gifting, wedding return gifts and batch orders with volume discounts.",
  },
  {
    q: "How do I pay?",
    a: "We accept UPI (GPay, PhonePe, Paytm) and direct bank transfer.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqList, setFaqList] = useState(FAQ_ITEMS);

  useEffect(() => {
    fetch("/api/faqs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqList(data.map((f: any) => ({
            q: f.question,
            a: f.answer,
          })));
        }
      })
      .catch(() => {});
  }, []);


  return (
    <div className="min-h-screen pb-24">
      {/* Page Hero */}
      <section className="page-hero py-16 px-4 sm:px-6">
        <div className="wrap text-center max-w-2xl mx-auto space-y-3">
          <div className="kicker">FAQ &amp; SUPPORT</div>
          <h1 className="text-4xl sm:text-5xl font-bold font-display text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-white/80 leading-relaxed">
            Everything you need to know about 3D printing orders, custom requests, pricing,
            materials and delivery in Delhi &amp; NCR.
          </p>
        </div>
      </section>

      <main className="wrap my-12 max-w-3xl space-y-4">
        {faqList.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="bg-white border border-black/10 rounded-2xl overflow-hidden transition-all shadow-xs"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm text-[#0e0c1d] flex items-center justify-between gap-4 cursor-pointer hover:bg-[#faf9f7] transition-colors"
              >
                <span>{item.q}</span>
                {isOpen ? (
                  <Minus className="w-4 h-4 text-[#5a45ff] shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-[#6a6880] shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs text-[#6a6880] leading-relaxed border-t border-black/5 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}

        {/* Still have questions banner */}
        <div className="cta-band rounded-[30px] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl mt-12">
          <div>
            <div className="kicker">STILL HAVE A QUESTION?</div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Chat with Mokova on WhatsApp.
            </h2>
            <p className="text-xs text-white/80 mt-1">
              We respond promptly with materials, sizes and instant quotes.
            </p>
          </div>

          <a
            href="https://wa.me/918527373680"
            target="_blank"
            rel="noopener noreferrer"
            className="btn wa text-xs font-bold whitespace-nowrap shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp (+91 8527373680)</span>
          </a>
        </div>
      </main>
    </div>
  );
}