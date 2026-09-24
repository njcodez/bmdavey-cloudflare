"use server";

import { db } from "~/server/db";
import { products, productVariants, productImages } from "~/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteSupabaseImages } from "~/server/actions/delete-image";

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

export async function updateProduct(id: number, data: ProductData) {
  const urlsToDelete: string[] = [];

  const resultId = await db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({
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
      .where(eq(products.id, id));

    const existingVariants = await tx
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.product_id, id));

    const incomingVariantIds = data.variants
      .map((v) => v.id)
      .filter((vId): vId is number => vId !== undefined);

    const variantsToDelete = existingVariants
      .map((v) => v.id)
      .filter((vId) => !incomingVariantIds.includes(vId));

    if (variantsToDelete.length > 0) {
      const imagesToDelete = await tx
        .select({ url: productImages.url })
        .from(productImages)
        .where(inArray(productImages.variant_id, variantsToDelete));
        
      for (const img of imagesToDelete) {
        urlsToDelete.push(img.url);
      }

      await tx
        .delete(productVariants)
        .where(inArray(productVariants.id, variantsToDelete));
    }

    for (const variant of data.variants) {
      let variantId: number;

      if (variant.id) {
        await tx
          .update(productVariants)
          .set({
            color_name: variant.color_name,
            color_label: variant.color_label ?? null,
            color_hex: variant.color_hex,
            in_stock: variant.in_stock,
          })
          .where(eq(productVariants.id, variant.id));
        
        variantId = variant.id;

        const oldImages = await tx
          .select({ url: productImages.url })
          .from(productImages)
          .where(eq(productImages.variant_id, variantId));
          
        for (const img of oldImages) {
          if (!variant.images.includes(img.url)) {
            urlsToDelete.push(img.url);
          }
        }

        await tx
          .delete(productImages)
          .where(eq(productImages.variant_id, variantId));
      } else {
        const [insertedVariant] = await tx
          .insert(productVariants)
          .values({
            product_id: id,
            color_name: variant.color_name,
            color_label: variant.color_label ?? null,
            color_hex: variant.color_hex,
            in_stock: variant.in_stock,
          })
          .returning({ id: productVariants.id });

        if (!insertedVariant) {
          throw new Error("Failed to insert variant");
        }
        variantId = insertedVariant.id;
      }

      if (variant.images.length > 0) {
        const imagesToInsert = variant.images.map((url, index) => ({
          variant_id: variantId,
          url,
          order: index,
        }));
        await tx.insert(productImages).values(imagesToInsert);
      }
    }

    return id;
  });

  if (urlsToDelete.length > 0) {
    await deleteSupabaseImages(urlsToDelete);
  }

  revalidatePath("/admin/products");
  return resultId;
}
