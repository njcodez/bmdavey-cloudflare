"use server";

import { db } from "~/server/db";
import { products, productVariants } from "~/server/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { env } from "~/env";

export async function getProducts(search?: string) {
  if (search?.trim()) {
    const q = `%${search.trim()}%`;
    return await db.query.products.findMany({
      where: or(ilike(products.name, q), ilike(products.brand, q)),
      orderBy: products.id,
      with: {
        productVariants: {
          columns: { in_stock: true }
        }
      }
    });
  }
  return await db.query.products.findMany({
    orderBy: products.id,
    with: {
      productVariants: {
        columns: { in_stock: true }
      }
    }
  });
}

export async function toggleDiscountHighlight(id: number, currentStatus: boolean) {
  await db
    .update(products)
    .set({ discount_highlight: !currentStatus })
    .where(eq(products.id, id));
  revalidatePath("/admin/products");
}

export async function toggleIsFeatured(id: number, currentStatus: boolean) {
  await db
    .update(products)
    .set({ is_featured: !currentStatus })
    .where(eq(products.id, id));
  revalidatePath("/admin/products");
}

export async function toggleOutOfStock(id: number, makeOutOfStock: boolean) {
  // If makeOutOfStock is true, set all variants in_stock to false.
  // If false, set all variants in_stock to true.
  await db
    .update(productVariants)
    .set({ in_stock: !makeOutOfStock })
    .where(eq(productVariants.product_id, id));
  revalidatePath("/admin/products");
}

export async function deleteProduct(id: number, masterPass: string) {
  if (masterPass !== env.MASTER_DELETE_PASS) {
    return { success: false, error: "Invalid master password" };
  }

  // Drizzle handles cascading deletes if configured in schema. 
  // We added onDelete: 'cascade' to variants and images.
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  return { success: true };
}
