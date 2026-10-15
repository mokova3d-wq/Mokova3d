import type { Metadata } from "next";
import { getProductById } from "@/lib/api-db";
import { MOKOVA_PRODUCTS } from "@/data/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  let product: any = null;
  try {
    product = getProductById(id);
  } catch (e) {
    product = null;
  }
  if (!product) {
    product = MOKOVA_PRODUCTS.find((p) => p.id === id);
  }

  if (!product) {
    return {
      title: "Product Not Found | Mokova3D",
    };
  }

  const title = `${product.name} | 3D Printed Collectibles | Mokova3D`;
  const description =
    product.description ||
    `High-precision 3D printed ${product.name}. Crafted with premium matte bio-PLA in Delhi NCR. Custom colors, dimensions, and fast dispatch available.`;

  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `https://mokova3d.com${product.image}`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://mokova3d.com/product/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://mokova3d.com/product/${id}`,
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product: any = null;
  try {
    product = getProductById(id);
  } catch (e) {
    product = null;
  }
  if (!product) {
    product = MOKOVA_PRODUCTS.find((p) => p.id === id);
  }

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            name: product.name,
            image: product.image?.startsWith("http")
              ? product.image
              : `https://mokova3d.com${product.image}`,
            description: product.description,
            sku: product.sku || `MKV-${id.toUpperCase()}`,
            brand: {
              "@type": "Brand",
              name: "Mokova3D",
            },
            offers: {
              "@type": "Offer",
              url: `https://mokova3d.com/product/${id}`,
              priceCurrency: "INR",
              price: product.reference_price || product.referencePriceInr || 299,
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: {
                "@type": "Organization",
                name: "Mokova3D",
              },
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "20",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://mokova3d.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "3D Catalog",
                item: "https://mokova3d.com/products",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: product.name,
                item: `https://mokova3d.com/product/${id}`,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
