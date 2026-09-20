import { db } from "~/server/db";
import { products } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductView } from "~/components/store/ProductView";

import { Header } from "~/components/store/Header";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);

  if (isNaN(productId)) {
    notFound();
  }

  const productData = await db.query.products.findFirst({
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

  if (!productData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background relative flex flex-col">
      <Header />

      <ProductView product={productData} />
    </main>
  );
}
