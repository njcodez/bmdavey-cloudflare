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
