import type { Metadata } from "next";
import { PolicyPageTemplate } from "@/components/legal/PolicyPageTemplate";
import { SEED_PAGES } from "@/lib/legal-pages-seed";

export const metadata: Metadata = {
  title: "About Us | Mokova3D Studio",
  description: "Official legal and operational policy document of Mokova3D.",
};

export default function Page() {
  const seed = SEED_PAGES.find((p) => p.slug === "about") || {
    slug: "about",
    title: "About Us | Mokova3D Studio",
    category: "Policy",
    summary: "",
    content_html: "<p>Loading document...</p>",
  };

  return (
    <PolicyPageTemplate
      slug="about"
      defaultTitle={seed.title}
      defaultCategory={seed.category}
      defaultSummary={seed.summary}
      defaultHtml={seed.content_html}
    />
  );
}
