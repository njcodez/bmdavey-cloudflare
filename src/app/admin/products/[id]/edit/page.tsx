import { ProductForm } from "~/components/admin/ProductForm";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";
import { products } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const productId = parseInt(resolvedParams.id);
  const page = resolvedSearchParams.page;
  const search = resolvedSearchParams.search;
  const query = new URLSearchParams(Object.fromEntries(Object.entries({ page, search }).filter(([, v]) => v) as [string, string][])).toString();

  if (isNaN(productId)) {
    notFound();
  }

  // Fetch product data with variants and images
  const productData = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: {
      productVariants: {
        with: {
          productImages: true,
        },
      },
    },
  });

  if (!productData) {
    notFound();
  }

  const formattedInitialData = {
    id: productData.id,
    name: productData.name,
    brand: productData.brand,
    base_price: productData.base_price,
    mrp: productData.mrp,
    category: productData.category,
    wheel_size_t: productData.wheel_size_t ?? undefined,
    height_min_inches: productData.height_min_inches ?? undefined,
    height_max_inches: productData.height_max_inches ?? undefined,
    gears: productData.gears ?? undefined,
    target_demographic: productData.target_demographic,
    gender: productData.gender ?? undefined,
    frame_material: productData.frame_material ?? undefined,
    brakes: productData.brakes ?? undefined,
    suspension: productData.suspension ?? undefined,
    age_range: productData.age_range ?? undefined,
    rim_material: productData.rim_material ?? undefined,
    fork: productData.fork ?? undefined,
    key_features: (productData.key_features as Record<string, string>) ?? undefined,
    variants: productData.productVariants.map((v) => ({
      id: v.id,
      color_name: v.color_name,
      color_label: v.color_label,
      color_hex: v.color_hex,
      in_stock: v.in_stock,
      images: v.productImages.map((i) => i.url),
    })),
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <Link href={`/admin/products${query ? `?${query}` : ""}`}>
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      <ProductForm initialData={formattedInitialData} />
    </div>
  );
}
