import { getProducts } from "~/server/actions/products";
import { logoutAction } from "~/server/actions/admin-auth";
import { ProductRowActions } from "~/components/admin/ProductRowActions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { AdminSearchBar } from "~/components/admin/AdminSearchBar";
import { Suspense } from "react";
import { BackupButton } from "~/components/admin/BackupButton";

const PAGE_SIZE = 25;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams.search ?? "";
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;

  const allProducts = await getProducts(search || undefined);

  // Client-side pagination over the results
  const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const products = allProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleLogout = async () => {
    "use server";
    await logoutAction();
    redirect("/");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products ({allProducts.length})</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/products/new">
            <Button>Create Product</Button>
          </Link>
          <BackupButton />
          <form action={handleLogout}>
            <Button variant="outline" type="submit">Logout</Button>
          </form>
        </div>
      </div>

      {/* Search */}
      <Suspense fallback={<div className="h-10 w-full max-w-md animate-pulse bg-muted rounded-md" />}>
        <AdminSearchBar placeholder="Search by name or brand..." />
      </Suspense>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const isAllOutOfStock = product.productVariants?.length > 0 
                  && product.productVariants.every((v) => !v.in_stock);
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₹{product.base_price}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ProductRowActions
                          id={product.id}
                          discountHighlight={product.discount_highlight}
                          isFeatured={product.is_featured}
                          isAllOutOfStock={!!isAllOutOfStock}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {currentPage > 1 && (
            <Link href={`/admin/products?page=${currentPage - 1}${search ? `&search=${search}` : ""}`}>
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={`/admin/products?page=${currentPage + 1}${search ? `&search=${search}` : ""}`}>
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
