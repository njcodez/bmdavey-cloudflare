"use server";

import { db } from "~/server/db";
import { products, productVariants, productImages } from "~/server/db/schema";

import { revalidatePath } from "next/cache";
import { env } from "~/env";

export async function verifyMasterPass(pass: string) {
  return pass === env.MASTER_DELETE_PASS;
}

type VariantData = {
  id?: number;
  color_name: string;
  color_label?: string | null;
  color_hex: string;
  in_stock: boolean;
  images: string[];
};

type ProductData = {
  name: string;
  brand: string;
  base_price: string;
  mrp: string;
  category: string;
  wheel_size_t?: string | null;
  height_min_inches?: number | null;
  height_max_inches?: number | null;
  gears?: number | null;
  target_demographic: string;
  gender?: string | null;
  frame_material?: string | null;
  brakes?: string | null;
  suspension?: string | null;
  age_range?: string | null;
  rim_material?: string | null;
  fork?: string | null;
  key_features?: Record<string, string> | null;
  variants: VariantData[];
};

export async function createProduct(data: ProductData) {
  return await db.transaction(async (tx) => {
    // 1. Insert Product
    const [insertedProduct] = await tx
      .insert(products)
      .values({
        name: data.name,
        brand: data.brand,
        base_price: data.base_price,
        mrp: data.mrp,
        category: data.category,
        wheel_size_t: data.wheel_size_t ?? null,
        height_min_inches: data.height_min_inches ?? null,
        height_max_inches: data.height_max_inches ?? null,
        gears: data.gears ?? null,
        target_demographic: data.target_demographic,
        gender: data.gender ?? null,
        frame_material: data.frame_material ?? null,
        brakes: data.brakes ?? null,
        suspension: data.suspension ?? null,
        age_range: data.age_range ?? null,
        rim_material: data.rim_material ?? null,
        fork: data.fork ?? null,
        key_features: data.key_features ?? null,
      })
      .returning({ id: products.id });

    if (!insertedProduct) {
      throw new Error("Failed to insert product");
    }

    const productId = insertedProduct.id;

    // 2. Insert Variants & Images
    for (const variant of data.variants) {
      const [insertedVariant] = await tx
        .insert(productVariants)
        .values({
          product_id: productId,
          color_name: variant.color_name,
          color_label: variant.color_label ?? null,
          color_hex: variant.color_hex,
          in_stock: variant.in_stock,
        })
        .returning({ id: productVariants.id });

      if (insertedVariant && variant.images.length > 0) {
        const imagesToInsert = variant.images.map((url, index) => ({
          variant_id: insertedVariant.id,
          url,
          order: index,
        }));
        await tx.insert(productImages).values(imagesToInsert);
      }
    }

    revalidatePath("/admin/products");
    return productId;
  });
}
