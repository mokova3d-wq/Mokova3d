import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom 3D Printing Quote & STL Upload | Mokova3D Delhi NCR",
  description:
    "Upload your 3D model (.STL / .OBJ) for instant slicing estimates and WhatsApp quote. Fast delivery across Delhi, Noida, Gurugram, and pan-India courier.",
  alternates: {
    canonical: "https://mokova3d.com/contact",
  },
  openGraph: {
    title: "Custom 3D Printing Quote & STL Upload | Mokova3D",
    description:
      "Upload your 3D files for instant estimates and custom 3D printing in Delhi NCR.",
    url: "https://mokova3d.com/contact",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630 }],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
