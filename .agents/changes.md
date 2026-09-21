# Consolidated Codebase Updates

**Date:** 2026-09-21

This document contains the absolute latest state of all files modified during this session. This consolidated list replaces all previous incremental updates to prevent confusion during syncing.

### Summary of Features Added / Changed:
- **Bugfix (Admin Password):** Updated `deleteProduct` to return an error object instead of throwing an unhandled exception, which prevents the generic Next.js Server Components render error. Added `autoComplete="new-password"` to the master password field and `autoComplete="off"` to the Admin search bar to prevent the browser from falsely identifying the search bar as a username field and autofilling it.

### File: `src/server/actions/products.ts`
```tsx
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
```

### File: `src/components/admin/ProductRowActions.tsx`
```tsx
"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { toggleDiscountHighlight, toggleIsFeatured, deleteProduct, toggleOutOfStock } from "~/server/actions/products";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";

type ProductRowActionsProps = {
  id: number;
  discountHighlight: boolean;
  isFeatured: boolean;
  isAllOutOfStock: boolean;
};

export function ProductRowActions({ id, discountHighlight, isFeatured, isAllOutOfStock }: ProductRowActionsProps) {
  const router = useRouter();
  const [masterPass, setMasterPass] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleToggleD = async () => {
    await toggleDiscountHighlight(id, discountHighlight);
  };

  const handleToggleF = async () => {
    await toggleIsFeatured(id, isFeatured);
  };

  const handleToggleO = async () => {
    await toggleOutOfStock(id, !isAllOutOfStock);
  };

  const handleEdit = () => {
    router.push(`/admin/products/${id}/edit`);
  };

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);
    try {
      const res = await deleteProduct(id, masterPass);
      if (res?.error) {
        setError(res.error);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={discountHighlight ? "default" : "outline"}
        size="sm"
        onClick={handleToggleD}
        className={discountHighlight ? "bg-primary text-primary-foreground" : ""}
      >
        D
      </Button>
      <Button
        variant={isFeatured ? "default" : "outline"}
        size="sm"
        onClick={handleToggleF}
        className={isFeatured ? "bg-primary text-primary-foreground" : ""}
      >
        F
      </Button>
      <Button
        variant={isAllOutOfStock ? "destructive" : "outline"}
        size="sm"
        onClick={handleToggleO}
        title={isAllOutOfStock ? "Currently Out of Stock. Click to make In Stock." : "Click to make all variants Out of Stock."}
      >
        O
      </Button>
      <Button variant="outline" size="sm" onClick={handleEdit}>
        Edit
      </Button>

      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
          Delete
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product, its variants, and images.
              Please enter the master deletion password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Master Password"
              value={masterPass}
              onChange={(e) => setMasterPass(e.target.value)}
              autoComplete="new-password"
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || !masterPass}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

### File: `src/components/admin/AdminSearchBar.tsx`
```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";

export function AdminSearchBar({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") ?? "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      if (query !== initialQuery) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams, initialQuery]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10 h-10"
        autoComplete="off"
      />
    </div>
  );
}
```

### Summary of Features Added / Changed:
- **Coupons:** Added a Reminder Mode toggle to the Admin Panel. When toggled, the generated message format switches to a catchy reminder prompt. 
- **Emails:** Integrated Resend. The storefront now automatically dispatches an email to the customer if an email is provided when claiming a coupon, and dispatches an admin notification to `sailesh.davey@gmail.com` for every new coupon generated.

### File: `src/components/admin/CouponRow.tsx`
```tsx
"use client";

import { useState } from "react";
import { Mail, MessageCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { TableCell, TableRow } from "~/components/ui/table";
import { ClaimCouponButton } from "~/components/admin/ClaimCouponButton";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";

type CouponRowProps = {
  coupon: {
    id: number;
    code: string;
    user_name: string;
    contact_info: string;
    locked_price: string;
    expires_at: Date;
  };
  product: {
    id: number;
    name: string;
    brand: string;
  };
  variant: {
    color_name: string;
  };
};

export function CouponRow({ coupon, product, variant }: CouponRowProps) {
  const [isReminder, setIsReminder] = useState(false);

  const productName = `${product.brand} ${product.name}`;
  const formattedDate = new Date(coupon.expires_at).toLocaleDateString();
  const roundedPrice = Math.round(parseFloat(coupon.locked_price));

  const standardMsg = `Hey ${coupon.user_name}! Greetings from *B. M. Davey & Co.* , \n\nYour coupon code ${coupon.code} for ${productName} is valid till ${formattedDate}. \n\nLocked Price: ₹ ${roundedPrice}. Please visit B. M. Davey & Co.'s outlet at  https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A.`;

  const reminderMsg = `⏳ *Reminder!! You have only 24 hours to claim the coupon!* ⏳ \n\nHey ${coupon.user_name}! Greetings from *B. M. Davey & Co.*, \n\nDon't miss out on your exclusive price! Your coupon code *${coupon.code}* for *${productName}* is valid until ${formattedDate}. \n\nLocked Price: ₹ ${roundedPrice}. \n\nPlease visit B. M. Davey & Co.'s outlet soon at https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A before it expires!`;

  const msg = isReminder ? reminderMsg : standardMsg;
  const encodedMsg = encodeURIComponent(msg);

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coupon.contact_info);
  const isPhone = /^\d{10}$/.test(coupon.contact_info);
  const isExpired = new Date() > new Date(coupon.expires_at);

  return (
    <TableRow>
      <TableCell className="font-bold">{coupon.code}</TableCell>
      <TableCell>{coupon.user_name}</TableCell>
      <TableCell>{coupon.contact_info}</TableCell>
      <TableCell>
        <Link href={`/product/${product.id}`} className="text-primary hover:underline">
          {productName} ({variant.color_name})
        </Link>
      </TableCell>
      <TableCell>₹{coupon.locked_price}</TableCell>
      <TableCell className={isExpired ? "text-destructive" : ""}>
        {new Date(coupon.expires_at).toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-2 items-center">
              {isEmail && (
                <a href={`mailto:${coupon.contact_info}?subject=Your Exclusive Price Coupon&body=${encodedMsg}`}>
                  <Mail className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              )}
              {isPhone && (
                <>
                  <a href={`sms:${coupon.contact_info}?body=${encodedMsg}`}>
                    <MessageSquare className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  </a>
                  <a href={`https://wa.me/91${coupon.contact_info}?text=${encodedMsg}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="w-5 h-5 text-green-500 hover:text-green-600 transition-colors" />
                  </a>
                </>
              )}
            </div>
            <ClaimCouponButton couponId={coupon.id} />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              id={`reminder-${coupon.id}`}
              checked={isReminder}
              onCheckedChange={setIsReminder}
            />
            <Label htmlFor={`reminder-${coupon.id}`} className="text-xs text-muted-foreground cursor-pointer">
              Reminder Mode
            </Label>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
```

### File: `src/app/admin/coupons/page.tsx`
```tsx
import { getCoupons } from "~/server/actions/coupons";
import { BulkPurgeButton } from "~/components/admin/BulkPurgeButton";
import { CouponRow } from "~/components/admin/CouponRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const data = await getCoupons();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Active Coupons</h1>
        <BulkPurgeButton />
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Locked Price</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No active coupons found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <CouponRow
                  key={row.coupon.id}
                  coupon={row.coupon}
                  product={row.product}
                  variant={row.variant}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

### File: `src/server/actions/create-coupon.ts`
```tsx
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

  // Send Emails if Resend is configured
  if (env.RESEND_API_KEY) {
    const resend = new Resend(env.RESEND_API_KEY);
    const adminEmail = env.RESEND_ADMIN_EMAIL || "sailesh.davey@gmail.com";
    
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
    const fromAddress = "onboarding@resend.dev"; // Default Resend testing address

    // If user provided an email, send them a confirmation
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactInfo);
    if (isEmail) {
      await resend.emails.send({
        from: fromAddress,
        to: data.contactInfo,
        subject: "Your exclusive Price Coupon - B. M. Davey & Co.",
        text: `Hey ${data.userName}! Greetings from B. M. Davey & Co.,\n\nYour coupon code ${code} for ${productName} is valid till ${formattedDate}.\n\nLocked Price: ₹ ${roundedPrice}.\n\nPlease visit B. M. Davey & Co.'s outlet at https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A.`,
      }).catch(console.error); // Catch errors silently to not break coupon creation
    }

    // Always send an admin notification
    await resend.emails.send({
      from: fromAddress,
      to: adminEmail,
      subject: `New Coupon Generated: ${code}`,
      text: `A new coupon was generated.\n\nUser: ${data.userName}\nContact: ${data.contactInfo}\nProduct: ${productName}\nLocked Price: ₹ ${roundedPrice}\nCode: ${code}\nExpires: ${formattedDate}\n\nPlease check the admin panel for details.`,
    }).catch(console.error);
  }

  return {
    code: inserted!.code,
    expiresAt: inserted!.expires_at.toISOString(),
  };
}
```

### File: `src/env.js`
```tsx
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ADMIN_USER: z.string().min(1).default("admin"),
    ADMIN_PASS: z.string().min(1).default("admin"),
    MASTER_DELETE_PASS: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_ADMIN_EMAIL: z.string().email().optional(),
  },

  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    ADMIN_USER: process.env.ADMIN_USER,
    ADMIN_PASS: process.env.ADMIN_PASS,
    MASTER_DELETE_PASS: process.env.MASTER_DELETE_PASS,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_ADMIN_EMAIL: process.env.RESEND_ADMIN_EMAIL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
```

### UI Update: Reminder Toggle as a Button Column
- Extracted the reminder toggle into its own column before Actions.
- Converted the switch into a cleaner button.

### File: `src/components/admin/CouponRow.tsx`
```tsx
"use client";

import { useState } from "react";
import { Mail, MessageCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { TableCell, TableRow } from "~/components/ui/table";
import { ClaimCouponButton } from "~/components/admin/ClaimCouponButton";
import { Button } from "~/components/ui/button";

type CouponRowProps = {
  coupon: {
    id: number;
    code: string;
    user_name: string;
    contact_info: string;
    locked_price: string;
    expires_at: Date;
  };
  product: {
    id: number;
    name: string;
    brand: string;
  };
  variant: {
    color_name: string;
  };
};

export function CouponRow({ coupon, product, variant }: CouponRowProps) {
  const [isReminder, setIsReminder] = useState(false);

  const productName = `${product.brand} ${product.name}`;
  const formattedDate = new Date(coupon.expires_at).toLocaleDateString();
  const roundedPrice = Math.round(parseFloat(coupon.locked_price));

  const standardMsg = `Hey ${coupon.user_name}! Greetings from *B. M. Davey & Co.* , \n\nYour coupon code ${coupon.code} for ${productName} is valid till ${formattedDate}. \n\nLocked Price: ₹ ${roundedPrice}. Please visit B. M. Davey & Co.'s outlet at  https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A.`;

  const reminderMsg = `*Reminder!! You have only 24 hours to claim the coupon!*  \n\nHey ${coupon.user_name}! Greetings from *B. M. Davey & Co.*, \n\nDon't miss out on your exclusive price! Your coupon code *${coupon.code}* for *${productName}* is valid until ${formattedDate}. \n\nLocked Price: ₹ ${roundedPrice}. \n\nPlease visit B. M. Davey & Co.'s outlet soon at https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A before it expires!`;

  const msg = isReminder ? reminderMsg : standardMsg;
  const encodedMsg = encodeURIComponent(msg);

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coupon.contact_info);
  const isPhone = /^\d{10}$/.test(coupon.contact_info);
  const isExpired = new Date() > new Date(coupon.expires_at);

  return (
    <TableRow>
      <TableCell className="font-bold">{coupon.code}</TableCell>
      <TableCell>{coupon.user_name}</TableCell>
      <TableCell>{coupon.contact_info}</TableCell>
      <TableCell>
        <Link href={`/product/${product.id}`} className="text-primary hover:underline">
          {productName} ({variant.color_name})
        </Link>
      </TableCell>
      <TableCell>₹{coupon.locked_price}</TableCell>
      <TableCell className={isExpired ? "text-destructive" : ""}>
        {new Date(coupon.expires_at).toLocaleString()}
      </TableCell>
      <TableCell>
        <Button
          variant={isReminder ? "default" : "outline"}
          size="sm"
          onClick={() => setIsReminder(!isReminder)}
          className={isReminder ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
        >
          {isReminder ? "Reminder On" : "Reminder Off"}
        </Button>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-3">
          <div className="flex gap-2 items-center">
            {isEmail && (
              <a href={`mailto:${coupon.contact_info}?subject=Your exclusive Price Coupon&body=${encodedMsg}`}>
                <Mail className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
            )}
            {isPhone && (
              <>
                <a href={`sms:${coupon.contact_info}?body=${encodedMsg}`}>
                  <MessageSquare className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
                <a href={`https://wa.me/91${coupon.contact_info}?text=${encodedMsg}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="w-5 h-5 text-green-500 hover:text-green-600 transition-colors" />
                </a>
              </>
            )}
          </div>
          <ClaimCouponButton couponId={coupon.id} />
        </div>
      </TableCell>
    </TableRow>
  );
}
```

### File: `src/app/admin/coupons/page.tsx`
```tsx
import { getCoupons } from "~/server/actions/coupons";
import { BulkPurgeButton } from "~/components/admin/BulkPurgeButton";
import { CouponRow } from "~/components/admin/CouponRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const data = await getCoupons();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Active Coupons</h1>
        <BulkPurgeButton />
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Locked Price</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Reminder</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No active coupons found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <CouponRow
                  key={row.coupon.id}
                  coupon={row.coupon}
                  product={row.product}
                  variant={row.variant}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

### Security Fix: Admin Route Protection
- Updated `middleware.ts` to enforce the `admin-session` cookie on all `/admin/*` routes except the login page, properly redirecting unauthorized users.

### File: `src/middleware.ts`
```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect all /admin routes except the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get('admin-session');
    
    if (session?.value !== 'authenticated') {
      // Redirect unauthenticated users to the login page
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

### Reserve Price Modal Update
- Updated `ReservePriceModal.tsx` to split contact info into mandatory `mobile` and optional `email`.
- Added `max-h-[90vh] overflow-y-auto` to the modal to ensure it is mobile responsive.
- Updated `createCoupon` server action in `create-coupon.ts` to accept separate mobile and email, and combine them into `contact_info` as `mobile|email`.
- Updated `CouponRow.tsx` in the admin panel to parse the `mobile|email` string and render appropriate action buttons (SMS/WhatsApp for mobile, Mail for email).

### Server-Side Validation Update
- Added regex validation for mobile number (10 digits) and email in `src/server/actions/create-coupon.ts` as an additional security measure against invalid inputs.

### ESLint Error Fixes (Part 2)
- Fixed remaining `||` to `??` in `CouponRow.tsx`.

### SEO Enhancements
- Added `metadataBase` to `layout.tsx`.
- Created dynamic `sitemap.ts` listing all active products.
- Created `robots.ts` to block crawlers from admin routes and point to sitemap.

### Communication Updates
- Appended the `/experience-offline` link to customer emails sent via Resend (`create-coupon.ts`).
- Appended the `/experience-offline` link to WhatsApp and SMS templates in the Admin Panel (`CouponRow.tsx`).

### Email Sender Update
- Updated the Resend `from` address in `create-coupon.ts` to use the custom domain `B. M. Davey & Co. <admin@bmdavey.in>` instead of the onboarding testing address.
