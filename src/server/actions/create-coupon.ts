"use server";

import { db } from "~/server/db";
import { coupons, products, productVariants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { env } from "~/env";
import { Resend } from "resend";

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
  mobile: string;
  email?: string;
  productId: number;
  variantId: number;
  lockedPrice: string;
}) {
  // Server-side validation
  const isPhone = /^\d{10}$/.test(data.mobile.trim());
  const isEmail = data.email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) : true;

  if (!isPhone) {
    throw new Error("Invalid mobile number. Please provide a 10-digit number.");
  }
  if (!isEmail) {
    throw new Error("Invalid email address.");
  }

  const contactInfo = data.email ? `${data.mobile}|${data.email}` : data.mobile;
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
      contact_info: contactInfo,
      product_id: data.productId,
      variant_id: data.variantId,
      locked_price: data.lockedPrice,
      expires_at: expiresAt,
    })
    .returning({ id: coupons.id, code: coupons.code, expires_at: coupons.expires_at });

  revalidatePath("/admin/coupons");

  // Send Emails if Resend is configured
  if (env.RESEND_API_KEY) {
    const resend = new Resend(env.RESEND_API_KEY);
    const adminEmail = env.RESEND_ADMIN_EMAIL ?? "sailesh.davey@gmail.com";

    // Fetch product info for the email
    const [productInfo] = await db
      .select({ name: products.name, brand: products.brand, color: productVariants.color_name })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.product_id, products.id))
      .where(eq(productVariants.id, data.variantId))
      .limit(1);

    const productName = productInfo ? `${productInfo.brand} ${productInfo.name} (${productInfo.color})` : "your bicycle";
    const formattedDate = expiresAt.toLocaleDateString();
    const roundedPrice = Math.round(parseFloat(data.lockedPrice));
    const fromAddress = "B. M. Davey & Co. <admin@bmdavey.in>"; // Custom verified domain

    // If user provided an email, send them a confirmation
    if (data.email) {
      await resend.emails.send({
        from: fromAddress,
        to: data.email,
        subject: "Your Exclusive Price Coupon - B. M. Davey & Co.",
        text: `Hey ${data.userName}! Greetings from B. M. Davey & Co.,\n\nYour coupon code ${code} for ${productName} is valid till ${formattedDate}.\n\nLocked Price: ₹ ${roundedPrice}.\n\nWant to know why we reserve prices? Visit: https://bmdavey.in/experience-offline\n\nPlease visit B. M. Davey & Co.'s outlet at https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A.`,
      }).catch(console.error); // Catch errors silently to not break coupon creation
    }

    // Always send an admin notification
    await resend.emails.send({
      from: fromAddress,
      to: adminEmail,
      subject: `New Coupon Generated: ${code}`,
      text: `A new coupon was generated.\n\nUser: ${data.userName}\nMobile: ${data.mobile}\nEmail: ${data.email ?? "N/A"}\nProduct: ${productName}\nLocked Price: ₹ ${roundedPrice}\nCode: ${code}\nExpires: ${formattedDate}\n\nPlease check the admin panel for details.`,
    }).catch(console.error);
  }

  return {
    code: inserted!.code,
    expiresAt: inserted!.expires_at.toISOString(),
  };
}
