"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Clock, FileText, ArrowLeft, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";

interface PolicyPageTemplateProps {
  slug: string;
  defaultTitle: string;
  defaultCategory: string;
  defaultSummary: string;
  defaultHtml: string;
}

export function PolicyPageTemplate({
  slug,
  defaultTitle,
  defaultCategory,
  defaultSummary,
  defaultHtml,
}: PolicyPageTemplateProps) {
  const [pageData, setPageData] = useState<{
    title: string;
    category: string;
    summary: string;
    content_html: string;
    last_updated: string;
    version: number;
    legal_review_flagged: number;
  }>({
    title: defaultTitle,
    category: defaultCategory,
    summary: defaultSummary,
    content_html: defaultHtml,
    last_updated: "2026-10-11",
    version: 1,
    legal_review_flagged: 1,
  });

  useEffect(() => {
    fetch(`/api/pages?slug=${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res && res.page) {
          setPageData({
            title: res.page.title,
            category: res.page.category,
            summary: res.page.summary || defaultSummary,
            content_html: res.page.content_html,
            last_updated: res.page.last_updated ? res.page.last_updated.slice(0, 10) : "2026-10-11",
            version: res.page.version || 1,
            legal_review_flagged: res.page.legal_review_flagged !== undefined ? res.page.legal_review_flagged : 1,
          });
        }
      })
      .catch(() => {});
  }, [slug, defaultSummary]);

  return (
    <article className="min-h-screen pb-24 bg-[#faf9f7] text-[#0e0c1d]">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-black/10 bg-white py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-[#6a6880]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-bold text-[#0e0c1d] hover:text-[#5a45ff] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </Link>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>VERSION {pageData.version}.0</span>
            <span>?</span>
            <span>UPDATED: {pageData.last_updated}</span>
          </div>
        </div>
      </div>

      {/* Main Content Chassis */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 my-10 space-y-8">
        {/* Header Block */}
        <header className="space-y-4 pb-8 border-b border-black/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#eeedfb] text-xs font-mono font-bold text-[#5a45ff]">
              {pageData.category.toUpperCase()}
            </span>

            {pageData.legal_review_flagged === 1 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-mono font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Statutory Draft ? Flagged for Final Indian Legal Counsel Review</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-display text-[#0e0c1d] tracking-tight leading-tight">
            {pageData.title}
          </h1>

          {pageData.summary && (
            <p className="text-base text-[#4b5563] leading-relaxed max-w-3xl font-medium">
              {pageData.summary}
            </p>
          )}
        </header>

        {/* Rich-Text Body Rendered from SQLite */}
        <div
          className="prose-legal text-sm sm:text-base leading-relaxed text-[#374151] space-y-6 [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:font-display [&_h2]:text-[#0e0c1d] [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#0e0c1d] [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:leading-relaxed [&_strong]:text-[#0e0c1d] [&_strong]:font-bold [&_.notice-box]:p-5 [&_.notice-box]:rounded-2xl [&_.notice-box]:bg-[#eeedfb]/60 [&_.notice-box]:border [&_.notice-box]:border-[#5a45ff]/20 [&_.notice-box]:text-xs [&_.notice-box]:text-[#0e0c1d] [&_.legal-table]:w-full [&_.legal-table]:text-xs [&_.legal-table]:border [&_.legal-table]:border-black/10 [&_.legal-table]:rounded-xl [&_.legal-table]:overflow-hidden [&_.legal-table_td]:p-3 [&_.legal-table_td]:border-b [&_.legal-table_td]:border-black/10"
          dangerouslySetInnerHTML={{ __html: pageData.content_html }}
        />

        {/* Assistance & Redressal Box */}
        <footer className="mt-16 p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold font-display text-base text-[#0e0c1d]">
                Questions or Statutory Clarifications?
              </h3>
              <p className="text-xs text-[#6a6880] mt-0.5">
                Our Grievance Redressal and Compliance Desk responds promptly within statutory Indian timelines.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://wa.me/918527373680?text=Hi%20Mokova3D%2C%20I%20have%20a%20legal%20or%20policy%20enquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="btn wa text-xs font-bold py-2.5 px-4 shadow-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Desk</span>
              </a>

              <Link
                href="/grievance"
                className="px-4 py-2.5 rounded-xl border border-black/10 bg-[#faf9f7] hover:bg-[#eeedfb] text-xs font-bold text-[#0e0c1d] transition-colors"
              >
                Grievance Officer
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}
