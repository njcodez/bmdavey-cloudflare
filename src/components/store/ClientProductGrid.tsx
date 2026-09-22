"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ProductCard } from "./ProductCard";
import { type ProductWithRelations } from "~/server/db/schema";

import Link from "next/link";

type ClientProductGridProps = {
  products: ProductWithRelations[];
};

export function ClientProductGrid({ products }: ClientProductGridProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [targetCount, setTargetCount] = useState(8);

  useEffect(() => {
    // Only determine on client mount
    setTargetCount(window.innerWidth < 768 ? 4 : 8);
  }, []);

  // How many products actually have a base image that we will wait for?
  const priorityProducts = products.slice(0, targetCount);
  const expectedImageCount = priorityProducts.filter((p) => {
    const firstVariant = p.productVariants?.[0];
    const images = firstVariant?.productImages?.map((img) => img.url) ?? [];
    return images.length > 0;
  }).length;

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setLoadedCount(0);
    };
    window.addEventListener("start-product-loading", handleStart);
    return () => window.removeEventListener("start-product-loading", handleStart);
  }, []);

  // When products change (Next.js navigation finishes)
  useEffect(() => {
    setLoadedCount(0);
    if (expectedImageCount === 0) {
      setIsLoading(false);
    }
  }, [products, expectedImageCount]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading) {
      if (loadedCount >= expectedImageCount && expectedImageCount > 0) {
        // Add a tiny delay so it feels smooth
        timeout = setTimeout(() => setIsLoading(false), 150);
      } else {
        // Hard 1-second timeout safety valve
        timeout = setTimeout(() => setIsLoading(false), 1000);
      }
    }
    return () => clearTimeout(timeout);
  }, [loadedCount, expectedImageCount, isLoading]);

  const handleImageLoad = () => {
    setLoadedCount((prev) => prev + 1);
  };

  const shouldLoadRemaining = !isLoading;

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
    <div className="relative w-full h-full min-h-[500px]">
      {isLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center pt-32 sm:pt-48 bg-background/80 backdrop-blur-sm rounded-xl">
          <Image src="/cycle1.svg" alt="Loading" width={96} height={96} />
          <p className="mt-6 text-lg font-semibold text-primary animate-pulse">Loading page...</p>
        </div>
      )}
      <motion.div 
        layout 
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full"
      >
      <AnimatePresence mode="popLayout" initial={false}>
        {products.map((product, index) => {
          const isPriority = index < targetCount;
          return (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
            >
              <ProductCard 
                product={product} 
                onImageLoad={isPriority ? handleImageLoad : undefined} 
                shouldLoad={isPriority || shouldLoadRemaining}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
    </div>
  );
}
