import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Printing FAQ, Materials & Turnaround Times | Mokova3D",
  description:
    "Frequently asked questions about 3D printing in Delhi NCR: PLA, PETG, TPU, resin materials, layer resolution, pricing, shipping speeds, and custom orders.",
  alternates: {
    canonical: "https://mokova3d.com/faq",
  },
  openGraph: {
    title: "3D Printing FAQ, Materials & Delivery | Mokova3D",
    description: "Learn about 3D print materials, tolerances, shipping speeds, and ordering.",
    url: "https://mokova3d.com/faq",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630 }],
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
