"use server";

import { db } from "~/server/db";
import { products } from "~/server/db/schema";
import { eq, ilike } from "drizzle-orm";

export async function searchProductNames(query: string) {
  if (!query.trim()) return [];
  const q = `%${query.trim()}%`;
  
  const results = await db.query.products.findMany({
    where: ilike(products.name, q),
    columns: {
      id: true,
      name: true,
      brand: true,
    },
    limit: 10,
  });
  
  return results;
}

export async function getFullProductForImport(id: number) {
  const productData = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      productVariants: {
        with: {
          productImages: true,
        },
      },
    },
  });

  if (!productData) {
    throw new Error("Product not found");
  }

  // Format the data to match the ProductForm FormValues
  // We purposely strip IDs so it can be merged safely
  return {
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
      color_name: v.color_name,
      color_label: v.color_label,
      color_hex: v.color_hex,
      in_stock: v.in_stock,
      images: v.productImages.map((i) => i.url),
    })),
  };
}
