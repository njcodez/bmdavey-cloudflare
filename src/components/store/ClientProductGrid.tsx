"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { type ProductWithRelations } from "~/server/db/schema";

import Link from "next/link";

type ClientProductGridProps = {
  products: ProductWithRelations[];
};

export function ClientProductGrid({ products }: ClientProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl p-12 text-center gap-2">
        <p className="text-lg font-semibold text-foreground">No products found.</p>
        <p className="text-sm">Try adjusting your search or filters.</p>
        <Link 
          href="/#products-section" 
          className="mt-4 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Clear all filters
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      layout 
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {products.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
