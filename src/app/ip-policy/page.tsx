import type { Metadata } from "next";
import { PolicyPageTemplate } from "@/components/legal/PolicyPageTemplate";
import { SEED_PAGES } from "@/lib/legal-pages-seed";

export const metadata: Metadata = {
  title: "Intellectual Property & Copyright Policy | Mokova3D",
  description: "Official legal and operational policy document of Mokova3D.",
};

export default function Page() {
  const seed = SEED_PAGES.find((p) => p.slug === "ip-policy") || {
    slug: "ip-policy",
    title: "Intellectual Property & Copyright Policy | Mokova3D",
    category: "Policy",
    summary: "",
    content_html: "<p>Loading document...</p>",
  };

  return (
    <PolicyPageTemplate
      slug="ip-policy"
      defaultTitle={seed.title}
      defaultCategory={seed.category}
      defaultSummary={seed.summary}
      defaultHtml={seed.content_html}
    />
  );
}
