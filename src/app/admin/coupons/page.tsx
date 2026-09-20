import { getCoupons } from "~/server/actions/coupons";
import { BulkPurgeButton } from "~/components/admin/BulkPurgeButton";
import { ClaimCouponButton } from "~/components/admin/ClaimCouponButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import Link from "next/link";
import { Mail, MessageCircle, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const data = await getCoupons();

  const getMessageTemplate = (name: string, code: string, date: Date, price: string) => {
    const formattedDate = new Date(date).toLocaleString();
    return `Hey ${name}! Greetings from our company, your coupon code ${code} is valid till ${formattedDate}. Locked Price: ₹ ${price}.Please visit B M Davey & Co's outlet at  https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A`;
  };

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
              data.map((row) => {
                const { coupon, product, variant } = row;
                const msg = getMessageTemplate(
                  coupon.user_name,
                  coupon.code,
                  coupon.expires_at,
                  coupon.locked_price
                );
                const encodedMsg = encodeURIComponent(msg);
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coupon.contact_info);
                const isPhone = /^\d{10}$/.test(coupon.contact_info);
                
                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-bold">{coupon.code}</TableCell>
                    <TableCell>{coupon.user_name}</TableCell>
                    <TableCell>{coupon.contact_info}</TableCell>
                    <TableCell>
                      <Link href={`/product/${product.id}`} className="text-primary hover:underline">
                        {product.brand} {product.name} ({variant.color_name})
                      </Link>
                    </TableCell>
                    <TableCell>₹{coupon.locked_price}</TableCell>
                    <TableCell className={new Date() > coupon.expires_at ? "text-destructive" : ""}>
                      {new Date(coupon.expires_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex gap-2">
                          {isEmail && (
                            <a href={`mailto:${coupon.contact_info}?subject=Your Reserved Price Coupon&body=${encodedMsg}`}>
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
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
