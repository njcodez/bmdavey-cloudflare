"use server";

import { db } from "~/server/db";
import { coupons } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 to avoid confusion
  let code = "BMD";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createCoupon(data: {
  userName: string;
  contactInfo: string;
  productId: number;
  variantId: number;
  lockedPrice: string;
}) {
  // Generate unique code with retry
  let code = generateCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await db
      .select({ id: coupons.id })
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);

    if (existing.length === 0) break;
    code = generateCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error("Failed to generate unique code. Please try again.");
  }

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

  const [inserted] = await db
    .insert(coupons)
    .values({
      code,
      user_name: data.userName,
      contact_info: data.contactInfo,
      product_id: data.productId,
      variant_id: data.variantId,
      locked_price: data.lockedPrice,
      expires_at: expiresAt,
    })
    .returning({ id: coupons.id, code: coupons.code, expires_at: coupons.expires_at });

  revalidatePath("/admin/coupons");

  return {
    code: inserted!.code,
    expiresAt: inserted!.expires_at.toISOString(),
  };
}
