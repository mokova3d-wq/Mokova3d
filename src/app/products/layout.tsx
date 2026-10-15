import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Printed Catalog & Shop | Mokova3D Delhi NCR",
  description:
    "Explore our complete collection of 3D printed desk collectibles, cute animal figurines, lithophane shadow lamps, spiritual figures, and home decor crafted in Delhi NCR.",
  alternates: {
    canonical: "https://mokova3d.com/products",
  },
  openGraph: {
    title: "3D Printed Catalog & Shop | Mokova3D Delhi NCR",
    description:
      "Explore 3D printed desk collectibles, animal figurines, shadow lamps, and home decor crafted in Delhi NCR.",
    url: "https://mokova3d.com/products",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630 }],
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
