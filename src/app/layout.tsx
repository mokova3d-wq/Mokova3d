import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "@/styles/globals.css";
import { StorefrontShell } from "@/components/layout/StorefrontShell";

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mokova3d.com"),
  title: "Mokova3D | Custom 3D Printing, Décor & Gifts in Delhi NCR",
  description:
    "Shop 3D printed gifts, home décor, collectibles, spiritual figures, lamps, and custom 3D printing from Mokova3D in Delhi & NCR. Direct WhatsApp price enquiries and custom STL printing.",
  keywords: [
    "3D printing in Delhi",
    "custom 3D printing Delhi NCR",
    "3D printed gifts",
    "3D printed home décor",
    "shadow lamps",
    "STL 3D print quote",
    "Mokova3D",
  ],
  icons: {
    icon: "/assets/logo.png",
  },
  openGraph: {
    title: "Mokova3D | Custom 3D Printing, Décor & Gifts in Delhi NCR",
    description: "Shop 3D printed gifts, home décor, collectibles, lamps, and custom 3D printing.",
    url: "https://mokova3d.com",
    siteName: "Mokova3D",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mokova3D | Custom 3D Printing in Delhi NCR",
    description: "Turning ideas into reality with precision 3D printing.",
    images: ["/assets/hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Mokova3D",
    image: "https://mokova3d.com/assets/logo.png",
    telephone: "+918527373680",
    url: "https://mokova3d.com",
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Delhi",
      addressRegion: "Delhi NCR",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.6139,
      longitude: 77.209,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "22:00",
    },
    sameAs: ["https://instagram.com/mokova3d"],
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sora.variable} ${manrope.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-body bg-[#faf9f7] text-[#0e0c1d] antialiased">
        <StorefrontShell>{children}</StorefrontShell>
      </body>
    </html>
  );
}