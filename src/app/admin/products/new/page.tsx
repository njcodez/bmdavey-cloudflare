import { ProductForm } from "~/components/admin/ProductForm";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function NewProductPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page;
  const search = resolvedParams.search;
  const query = new URLSearchParams(Object.fromEntries(Object.entries({ page, search }).filter(([, v]) => v) as [string, string][])).toString();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Product</h1>
        <Link href={`/admin/products${query ? `?${query}` : ""}`}>
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      <ProductForm />
    </div>
  );
}
