"use client";

import { useState, useEffect } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Check, ChevronLeft, ChevronRight, ShieldCheck, Timer, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import Link from "next/link";
import { ReservePriceModal } from "./ReservePriceModal";
import { motion, AnimatePresence } from "framer-motion";
import { type ProductWithRelations } from "~/server/db/schema";

type ProductViewProps = {
  product: ProductWithRelations;
};

export function ProductView({ product }: ProductViewProps) {
  const variants = product.productVariants || [];
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    variants.length > 0 ? variants[0]?.id ?? null : null
  );
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setActiveImageIdx((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = images.length - 1;
      if (next >= images.length) next = 0;
      return next;
    });
  };

  useEffect(() => {
    setActiveImageIdx(0);
  }, [selectedVariantId]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const images = selectedVariant?.productImages?.map((img) => img.url) ?? [];

  const discountPercent =
    parseFloat(product.mrp) > parseFloat(product.base_price)
      ? Math.round(
          ((parseFloat(product.mrp) - parseFloat(product.base_price)) /
            parseFloat(product.mrp)) *
            100
        )
      : 0;

  const filledFeatures: { title: string; value: string }[] = [];
  if (product.key_features) {
    for (const [key, val] of Object.entries(product.key_features)) {
      if (val && typeof val === 'string' && val.trim() !== '') {
        filledFeatures.push({ title: key, value: val });
      }
    }
  }
  const fallbackSpecs = [
    { title: "Brakes", value: product.brakes },
    { title: "Gear", value: product.gears ? (product.gears === 1 ? 'Single Speed' : `${product.gears} Speed`) : null },
    { title: "Rim", value: product.rim_material },
    { title: "Fork", value: product.fork },
  ];

  if (filledFeatures.length < 4) {
    for (const spec of fallbackSpecs) {
      if (filledFeatures.length >= 4) break;
      if (spec.value && spec.value.toString().trim() !== '') {
        if (!filledFeatures.find(f => f.title === spec.title)) {
          filledFeatures.push({ title: spec.title, value: spec.value.toString() });
        }
      }
    }
  }

  const getIconName = (title: string) => title.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Store
      </Link>

      <div className="flex flex-col md:flex-row-reverse gap-10 md:gap-16 relative items-start">
        {/* Image Gallery */}
        <div className="w-full md:w-3/5 flex flex-col gap-4 items-center md:sticky md:top-36 md:h-fit">
          {images.length > 0 ? (
            <>
              {/* Main Image */}
              <div className="relative w-full aspect-[4/3] md:aspect-[4/3] rounded-2xl bg-muted/20 overflow-hidden group">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={activeImageIdx}
                    src={images[activeImageIdx]}
                    alt={`${product.name} main view`}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-auto cursor-grab active:cursor-grabbing"
                    loading="eager"
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({
                        x: dir > 0 ? 300 : -300,
                        opacity: 0,
                      }),
                      center: {
                        zIndex: 1,
                        x: 0,
                        opacity: 1,
                      },
                      exit: (dir: number) => ({
                        zIndex: 0,
                        x: dir < 0 ? 300 : -300,
                        opacity: 0,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset }) => {
                      if (offset.x < -50) {
                        paginate(1);
                      } else if (offset.x > 50) {
                        paginate(-1);
                      }
                    }}
                  />
                </AnimatePresence>
                
                {/* Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        paginate(-1);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 flex items-center justify-center transition-transform hover:scale-110 z-10"
                    >
                      <ChevronLeft className="w-8 h-8 text-black drop-shadow-lg" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        paginate(1);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 flex items-center justify-center transition-transform hover:scale-110 z-10"
                    >
                      <ChevronRight className="w-8 h-8 text-black drop-shadow-lg" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-3 overflow-x-auto pt-2 pb-2 px-1 snap-x scrollbar-hide w-full">
                  {images.map((url: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={cn(
                        "relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all snap-start",
                        activeImageIdx === idx ? "border-primary shadow-md scale-105" : "border-transparent hover:border-black/20 opacity-70 hover:opacity-100"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square w-full rounded-2xl bg-muted flex items-center justify-center mt-20 md:mt-0">
              <span className="text-muted-foreground">No images available</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-2/5 flex flex-col gap-6 mt-6 md:mt-0">
          <div className="flex flex-col gap-2">
            <div className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-widest">
              {product.brand}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl md:text-3xl font-black text-primary">
                ₹{product.base_price}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-base md:text-lg text-muted-foreground line-through">
                    ₹{product.mrp}
                  </span>
                  <Badge className="bg-primary text-primary-foreground">
                    {discountPercent}% OFF
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Color Swatches */}
          {variants.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-sm">
                Color:{" "}
                <span className="text-muted-foreground font-normal">
                  {selectedVariant?.color_label ?? selectedVariant?.color_name}
                </span>
              </span>
              <div className="flex flex-wrap gap-3">
                {variants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center shadow-sm",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 scale-110"
                          : "border-transparent hover:scale-105 opacity-80 hover:opacity-100"
                      )}
                      style={{ backgroundColor: variant.color_hex }}
                      title={variant.color_label ?? variant.color_name}
                      aria-label={`Select ${variant.color_label ?? variant.color_name}`}
                    >
                      {isSelected && (
                        <Check className="w-5 h-5 text-white drop-shadow-md mix-blend-difference" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Features */}
          {filledFeatures.length > 0 && (
            <div className="flex flex-col mt-4">
              <h3 className="font-bold text-primary mb-3 text-lg">Key Features</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4 bg-primary/5 p-4 rounded-2xl">
                {filledFeatures.map(feature => (
                  <div key={feature.title} className="col-span-1 rounded-xl bg-card border shadow-[0_0_15px_rgba(var(--primary),0.1)] p-3 flex flex-col xl:flex-row items-start xl:items-center gap-3 transition-all duration-300 lg:hover:scale-[1.02] lg:hover:bg-primary lg:hover:text-primary-foreground group cursor-default">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 p-1.5 transition-colors duration-300 lg:group-hover:bg-primary-foreground/20">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={`/assets/keyFeatures/${getIconName(feature.title)}.svg`} alt={feature.title} className="w-full h-full object-contain transition-all duration-300 lg:group-hover:brightness-0 lg:group-hover:invert" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <div className="flex flex-col overflow-hidden w-full">
                      <span className="text-[10px] md:text-[11px] text-muted-foreground transition-colors duration-300 lg:group-hover:text-primary-foreground/80 leading-tight uppercase tracking-wider">{feature.title}</span>
                      <span className="font-bold text-xs md:text-sm truncate w-full mt-0.5" title={feature.value}>{feature.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified
            </span>
            <span className="flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-primary" /> 48hr Lock
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> No Payment
            </span>
          </div>

          <div className="mt-4">
            <Button
              size="lg"
              className="w-full btn-cred text-lg h-14 font-bold"
              disabled={!selectedVariant?.in_stock}
              onClick={() => setIsReserveOpen(true)}
            >
              {selectedVariant?.in_stock ? "Reserve Price" : "Out of Stock"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Lock in this price for 48 hours. No upfront payment required.
            </p>
            <Link href="/experience-offline" className="text-sm font-medium text-primary hover:underline text-center block mt-3">
              Why &quot;reserve now&quot; instead of buying online? Click here to know why!
            </Link>
          </div>

          {/* Technical Specs */}
          <div className="mt-8 border-t pt-8 pb-4">
            <h2 className="text-xl md:text-2xl font-bold mb-6">Technical Specifications</h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">Category</span>
            <span className="font-semibold">{product.category}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">Demographic</span>
            <span className="font-semibold">{product.target_demographic}</span>
          </div>
          {product.wheel_size_t && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Wheel Size</span>
              <span className="font-semibold">{product.wheel_size_t} inches</span>
            </div>
          )}
          {!!product.gears && product.gears > 0 && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Gears</span>
              <span className="font-semibold">{product.gears === 1 ? 'Single Speed' : `${product.gears} Speed`}</span>
            </div>
          )}
          {product.frame_material && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Frame</span>
              <span className="font-semibold">{product.frame_material}</span>
            </div>
          )}
          {product.brakes && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Brakes</span>
              <span className="font-semibold">{product.brakes}</span>
            </div>
          )}
          {product.gender && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Gender</span>
              <span className="font-semibold">{product.gender}</span>
            </div>
          )}
          {product.suspension && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Suspension</span>
              <span className="font-semibold">{product.suspension}</span>
            </div>
          )}
          {product.age_range && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Target Age</span>
              <span className="font-semibold">
                {product.age_range === '18-20' ? '18+ years' : `${product.age_range} years`}
              </span>
            </div>
          )}
          {(product.height_min_inches ?? product.height_max_inches) && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Rider Height</span>
              <span className="font-semibold">
                {product.height_min_inches
                  ? `${Math.floor(product.height_min_inches / 12)}'${product.height_min_inches % 12}"`
                  : "Any"}{" "}
                -{" "}
                {product.height_max_inches
                  ? `${Math.floor(product.height_max_inches / 12)}'${product.height_max_inches % 12}"`
                  : "Any"}
              </span>
            </div>
          )}
        </div>
      </div>
      
        </div>
      </div>

      {/* Reserve Modal */}
      {selectedVariant && (
        <ReservePriceModal
          isOpen={isReserveOpen}
          onClose={() => setIsReserveOpen(false)}
          productId={product.id}
          variantId={selectedVariant.id}
          lockedPrice={product.base_price}
          productName={`${product.brand} ${product.name}`}
          variantColor={selectedVariant.color_label ?? selectedVariant.color_name}
        />
      )}
    </div>
  );
}
