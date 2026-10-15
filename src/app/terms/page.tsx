import type { Metadata } from "next";
import { PolicyPageTemplate } from "@/components/legal/PolicyPageTemplate";
import { SEED_PAGES } from "@/lib/legal-pages-seed";

export const metadata: Metadata = {
  title: "Terms & Conditions | Mokova3D",
  description: "Official legal and operational policy document of Mokova3D.",
};

export default function Page() {
  const seed = SEED_PAGES.find((p) => p.slug === "terms") || {
    slug: "terms",
    title: "Terms & Conditions | Mokova3D",
    category: "Policy",
    summary: "",
    content_html: "<p>Loading document...</p>",
  };

  return (
    <PolicyPageTemplate
      slug="terms"
      defaultTitle={seed.title}
      defaultCategory={seed.category}
      defaultSummary={seed.summary}
      defaultHtml={seed.content_html}
    />
  );
}
