"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";
import { type ProductWithRelations } from "~/server/db/schema";

type ProductCardProps = {
  product: ProductWithRelations;
  onImageLoad?: () => void;
  shouldLoad?: boolean;
};

export function ProductCard({ product, onImageLoad, shouldLoad = true }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isAllOutOfStock = product.productVariants && product.productVariants.length > 0 
    && product.productVariants.every((v) => !v.in_stock);

  // Extract all images across variants, or just the first variant's images
  // Usually, a product card displays the first variant's images.
  const firstVariant = product.productVariants?.[0];
  const images = firstVariant?.productImages?.map((img) => img.url) ?? [];
  
  // We only care about the first 3 images for the hover carousel
  const displayImages = images.slice(0, 3);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && !isAllOutOfStock && displayImages.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
      }, 1500); // cycle every 1.5s
    } else {
      setCurrentIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, displayImages.length, isAllOutOfStock]);

  return (
    <Link href={`/product/${product.id}`}>
      <Card
        className="group overflow-hidden rounded-none border border-transparent bg-card transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(0,143,239,0.3)] cursor-pointer h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square w-full bg-muted/20 overflow-hidden border-b border-black">
          {product.discount_highlight && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-blue-600/90 text-white z-20 flex items-center justify-center font-bold text-[10px] uppercase tracking-widest backdrop-blur-sm shadow-[0_0_15px_rgba(0,143,239,0.8)]">
              Special Discount
            </div>
          )}

          {/* Base Image (Always Rendered) */}
          {displayImages.length > 0 ? (
            shouldLoad ? (
              <img
                src={displayImages[0]}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isAllOutOfStock ? 'grayscale opacity-75' : ''} ${
                  isHovered && !isAllOutOfStock && displayImages.length > 1 && currentIndex !== 0 ? "opacity-0" : "opacity-100"
                }`}
                onLoad={onImageLoad}
                onError={onImageLoad}
              />
            ) : null
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}

          {/* Hover Images (Bandwidth Optimized: Only mounts when hovered) */}
          {isHovered && !isAllOutOfStock && displayImages.length > 1 && (
            <>
              {displayImages.slice(1).map((url: string, idx: number) => {
                const actualIndex = idx + 1;
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={actualIndex}
                    src={url}
                    alt={`${product.name} view ${actualIndex}`}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isAllOutOfStock ? 'grayscale opacity-75' : ''} ${
                      currentIndex === actualIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                );
              })}
            </>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 flex flex-col gap-1 flex-grow bg-white">
          <div className="flex items-start justify-between w-full mb-4">
            <div className="flex flex-col text-left">
              <div className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {product.brand}
              </div>
              <h3 className="font-semibold text-sm sm:text-base md:text-lg leading-tight line-clamp-2 mt-0.5 text-black">
                {product.name}
              </h3>
              {isAllOutOfStock && (
                <span className="mt-1 text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-wider">
                  Out of Stock
                </span>
              )}
            </div>
            
            <div className="flex flex-col items-end text-right shrink-0 pl-4">
              <span className="text-base sm:text-lg md:text-2xl font-black text-[#008FEF]">
                ₹{Math.round(parseFloat(product.base_price))}
              </span>
              {parseFloat(product.mrp) > parseFloat(product.base_price) && (
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground line-through decoration-1 mt-0.5">
                  ₹{Math.round(parseFloat(product.mrp))}
                </span>
              )}
              {parseFloat(product.mrp) > parseFloat(product.base_price) && (
                <span className="text-[10px] sm:text-xs font-bold text-[#00b341] mt-0.5">
                  {Math.round(((parseFloat(product.mrp) - parseFloat(product.base_price)) / parseFloat(product.mrp)) * 100)}% OFF
                </span>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-black/10 w-full mt-auto">
            <div 
              className={`btn-cred w-full py-2 px-1 sm:py-2.5 font-bold text-[10px] sm:text-xs uppercase tracking-wider text-center transition-colors duration-300 ${
                isAllOutOfStock 
                  ? "bg-muted text-muted-foreground cursor-not-allowed" 
                  : "bg-black text-white"
              }`}
            >
              {isAllOutOfStock ? "Out of Stock" : "Reserve Now"}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
