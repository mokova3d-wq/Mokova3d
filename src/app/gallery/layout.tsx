import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client 3D Prints Showcase & Gallery | Mokova3D",
  description:
    "See real client 3D prints produced in our Delhi studio. High-detail SLA/FDM prints, custom character statues, lithophane lamps, mechanical brackets, and gifts.",
  alternates: {
    canonical: "https://mokova3d.com/gallery",
  },
  openGraph: {
    title: "Client 3D Prints Showcase & Gallery | Mokova3D",
    description:
      "Explore real client prints produced in our Delhi NCR studio with tuned layer resolution.",
    url: "https://mokova3d.com/gallery",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630 }],
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
