import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browser 3D Model Renderer & STL/OBJ Inspector | Mokova3D",
  description:
    "100% Client-side browser 3D model viewer. Inspect STL and OBJ files with 3D turntable, overhead top plate view, wireframe, bounding box dimensions, and volume telemetry.",
  alternates: {
    canonical: "https://mokova3d.com/renderer",
  },
  openGraph: {
    title: "Browser 3D Model Renderer & STL/OBJ Inspector | Mokova3D",
    description:
      "Inspect local 3D models with true 3D orbit, top plate view, and weight estimations.",
    url: "https://mokova3d.com/renderer",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630 }],
  },
};

export default function RendererLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
