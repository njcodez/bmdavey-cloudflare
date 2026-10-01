import { cache } from "react";
import { db } from "~/server/db";
import { products } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductView } from "~/components/store/ProductView";
import { Header } from "~/components/store/Header";
import type { Metadata } from "next";

const getProduct = cache(async (productId: number) => {
  if (isNaN(productId)) return null;

  return await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: {
      productVariants: {
        with: {
          productImages: {
            orderBy: (imgs, { asc }) => [asc(imgs.order)],
          },
        },
      },
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);
  const product = await getProduct(productId);

  if (!product) {
    return {
      title: "Product Not Found | B. M. Davey & Co.",
    };
  }

  const firstImage = product.productVariants?.[0]?.productImages?.[0]?.url;
  const formattedPrice = Number(product.base_price).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const title = `${product.name} | ${product.brand} | B. M. Davey & Co.`;
  const description = `Buy ${product.name} by ${product.brand} at ${formattedPrice}. Explore specs, features, colors, and book online at B. M. Davey & Co. Chennai.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "B. M. Davey & Co.",
      images: firstImage ? [{ url: firstImage, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
  };
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);

  if (isNaN(productId)) {
    notFound();
  }

  const productData = await getProduct(productId);

  if (!productData) {
    notFound();
  }

  const allImages = productData.productVariants.flatMap((v) =>
    v.productImages.map((img) => img.url)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productData.name,
    image: allImages.length > 0 ? allImages : undefined,
    description: `Buy ${productData.name} by ${productData.brand}. Category: ${productData.category}. Explore specs, colors, and availability at B. M. Davey & Co. Chennai.`,
    brand: {
      "@type": "Brand",
      name: productData.brand,
    },
    offers: {
      "@type": "Offer",
      url: `https://bmdavey.in/product/${productData.id}`,
      priceCurrency: "INR",
      price: productData.base_price,
      availability: productData.productVariants.some((v) => v.in_stock)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "B. M. Davey & Co.",
      },
    },
  };

  return (
    <main className="min-h-screen bg-background relative flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <ProductView product={productData} />
    </main>
  );
}
