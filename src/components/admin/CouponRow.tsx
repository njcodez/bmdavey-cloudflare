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

  const standardMsg = `Hey ${coupon.user_name}! Greetings from *B. M. Davey & Co.* , \n\nYour coupon code ${coupon.code} for ${productName} is valid till ${formattedDate}. \n\nLocked Price: ₹ ${roundedPrice}. \n\nWant to know why we reserve prices? Visit: https://bmdavey.in/experience-offline \n\nPlease visit B. M. Davey & Co.'s outlet at  https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A.`;

  const reminderMsg = `*Reminder!! You have only 24 hours to claim the coupon!*  \n\nHey ${coupon.user_name}! Greetings from *B. M. Davey & Co.*, \n\nDon't miss out on your exclusive price! Your coupon code *${coupon.code}* for *${productName}* is valid until ${formattedDate}. \n\nLocked Price: ₹ ${roundedPrice}. \n\nWant to know why we reserve prices? Visit: https://bmdavey.in/experience-offline \n\nPlease visit B. M. Davey & Co.'s outlet soon at https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A before it expires!`;

  const msg = isReminder ? reminderMsg : standardMsg;
  const encodedMsg = encodeURIComponent(msg);

  // Parse contact info which might be "phone|email" or legacy
  let phoneStr = "";
  let emailStr = "";
  if (coupon.contact_info.includes("|")) {
    const parts = coupon.contact_info.split("|");
    phoneStr = parts[0] ?? "";
    emailStr = parts[1] ?? "";
  } else {
    // Legacy support
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coupon.contact_info)) {
      emailStr = coupon.contact_info;
    } else {
      phoneStr = coupon.contact_info;
    }
  }

  const isEmail = !!emailStr;
  const isPhone = !!phoneStr;
  const isExpired = new Date() > new Date(coupon.expires_at);

  return (
    <TableRow>
      <TableCell className="font-bold">{coupon.code}</TableCell>
      <TableCell>{coupon.user_name}</TableCell>
      <TableCell>
        <div className="flex flex-col text-sm">
          {phoneStr && <span>{phoneStr}</span>}
          {emailStr && <span className="text-muted-foreground">{emailStr}</span>}
        </div>
      </TableCell>
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
              <a href={`mailto:${emailStr}?subject=Your Reserved Price Coupon&body=${encodedMsg}`}>
                <Mail className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
            )}
            {isPhone && (
              <>
                <a href={`sms:${phoneStr}?body=${encodedMsg}`}>
                  <MessageSquare className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
                <a href={`https://wa.me/91${phoneStr}?text=${encodedMsg}`} target="_blank" rel="noreferrer">
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
