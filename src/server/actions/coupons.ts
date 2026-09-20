"use server";

import { db } from "~/server/db";
import { coupons, products, productVariants } from "~/server/db/schema";
import { eq, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCoupons() {
  const data = await db
    .select({
      coupon: coupons,
      product: products,
      variant: productVariants,
    })
    .from(coupons)
    .innerJoin(products, eq(coupons.product_id, products.id))
    .innerJoin(productVariants, eq(coupons.variant_id, productVariants.id))
    .orderBy(coupons.expires_at);
  
  return data;
}

export async function purgeExpiredCoupons() {
  const now = new Date();
  await db.delete(coupons).where(lt(coupons.expires_at, now));
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: number) {
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}
