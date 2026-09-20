import { ProductForm } from "~/components/admin/ProductForm";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Product</h1>
        <Link href="/admin/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      <ProductForm />
    </div>
  );
}
