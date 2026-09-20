# Codebase Changes Tracker

**Date:** 2026-09-20

The following files have been modified or created during the cycle finder and multi-select filtering overhaul. Replace the entire contents of these files in the Vercel repository to match these exactly.

### File: `src/components/store/DynamicFilters.tsx`
```tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { SlidersHorizontal } from "lucide-react";

type DynamicFiltersProps = {
  availableFilters: {
    categories: string[];
    demographics: string[];
    frameMaterials: string[];
    gears: number[];
    brakes: string[];
    wheelSizes: string[];
    genders: string[];
    ageRanges: string[];
  };
  children?: React.ReactNode;
};

import { useState, useEffect, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function DynamicFilters({ availableFilters, children }: DynamicFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localParams, setLocalParams] = useState(() => new URLSearchParams(searchParams.toString()));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalParams(new URLSearchParams(searchParams.toString()));
  }, [searchParams]);

  const [isOpen, setIsOpen] = useState(false);

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "0");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "199999");

  const heightRanges = [
    { label: "2'6\" to 4'", value: "30-48" },
    { label: "4' to 5'", value: "48-60" },
    { label: "5' to 5'6\"", value: "60-66" },
    { label: "5'6\" to 6'", value: "66-72" },
    { label: "6'+", value: "72-100" },
  ];

  const ageRangeBuckets = [
    { label: "2-5 years", value: "2-5" },
    { label: "5-8 years", value: "5-8" },
    { label: "8-12 years", value: "8-12" },
    { label: "13-17 years", value: "13-17" },
    { label: "18+ years", value: "18-20" },
  ];

  const availabilities = [
    { label: "In Stock", value: "in_stock" },
    { label: "Out of Stock", value: "out_of_stock" },
  ];

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (isOpen && window.scrollY > lastScrollY + 50) {
        setIsOpen(false);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(localParams.toString());
    const currentValues = params.getAll(key);
    
    // Check if the value is already selected
    if (currentValues.includes(value)) {
      // Remove it: we must delete the key completely, then re-append everything else
      params.delete(key);
      const remaining = currentValues.filter((v) => v !== value);
      remaining.forEach((v) => params.append(key, v));
    } else {
      // Add it
      params.append(key, value);
    }
    
    // Reset to page 1 when filters change
    params.set("page", "1");
    
    setLocalParams(params);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handlePriceSubmit = () => {
    const params = new URLSearchParams(localParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.set("page", "1");
    setLocalParams(params);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
    setIsOpen(false);
  };
  const handleClearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    const params = new URLSearchParams();
    setLocalParams(params);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
    setIsOpen(false);
  };

  const hasCategories = availableFilters.categories.length > 0;
  const hasDemographics = availableFilters.demographics.length > 0;
  const hasFrameMaterials = availableFilters.frameMaterials.length > 0;
  const hasGears = availableFilters.gears.length > 0;
  const hasBrakes = availableFilters.brakes && availableFilters.brakes.length > 0;
  const hasWheelSizes = availableFilters.wheelSizes && availableFilters.wheelSizes.length > 0;
  const hasGenders = availableFilters.genders && availableFilters.genders.length > 0;


  return (
    <div className="w-full flex flex-col relative">
      <div className="w-full flex flex-row items-center justify-between gap-2 md:gap-4">
        {children && (
          <div className="w-full flex-1 min-w-0">
            {children}
          </div>
        )}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className="btn-cred text-sm px-3 md:px-4 h-12 flex items-center justify-center gap-2 bg-white shrink-0 ml-auto md:ml-0"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden md:inline">{isOpen ? "Close Filters" : "Filter Collection"}</span>
          <span className="inline md:hidden">{isOpen ? "Close" : "Filter"}</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full overflow-hidden absolute top-full left-0 z-50 pr-2 pb-2"
          >
            <div className="w-full max-h-[70vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 border-2 border-black bg-white mt-2 shadow-[6px_6px_0_0_#000]">
              
              {hasCategories && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-2">Category</h4>
                  {availableFilters.categories.map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`cat-${cat}`}
                        checked={localParams.getAll("category").includes(cat)}
                        onCheckedChange={() => handleFilterChange("category", cat)}
                      />
                      <Label htmlFor={`cat-${cat}`} className="cursor-pointer">{cat}</Label>
                    </div>
                  ))}
                </div>
              )}

              {hasDemographics && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-2">Demographic</h4>
                  {availableFilters.demographics.map((demo) => (
                    <div key={demo} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`demo-${demo}`}
                        checked={localParams.getAll("targetDemographic").includes(demo)}
                        onCheckedChange={() => handleFilterChange("targetDemographic", demo)}
                      />
                      <Label htmlFor={`demo-${demo}`} className="cursor-pointer">{demo}</Label>
                    </div>
                  ))}
                </div>
              )}

              {hasFrameMaterials && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-2">Frame Material</h4>
                  {availableFilters.frameMaterials.map((frame) => (
                    <div key={frame} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`frame-${frame}`}
                        checked={localParams.getAll("frameMaterial").includes(frame)}
                        onCheckedChange={() => handleFilterChange("frameMaterial", frame)}
                      />
                      <Label htmlFor={`frame-${frame}`} className="cursor-pointer">{frame}</Label>
                    </div>
                  ))}
                </div>
              )}

              {hasGears && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-2">Gears</h4>
                  {availableFilters.gears.map((gear) => (
                    <div key={gear} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`gear-${gear}`}
                        checked={localParams.getAll("gears").includes(gear.toString())}
                        onCheckedChange={() => handleFilterChange("gears", gear.toString())}
                      />
                      <Label htmlFor={`gear-${gear}`} className="cursor-pointer">
                        {gear === 1 ? "Single Speed" : `${gear} Speed`}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {hasBrakes && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-2">Brakes</h4>
                  {availableFilters.brakes.map((brake) => (
                    <div key={brake} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`brake-${brake}`}
                        checked={localParams.getAll("brakes").includes(brake)}
                        onCheckedChange={() => handleFilterChange("brakes", brake)}
                      />
                      <Label htmlFor={`brake-${brake}`} className="cursor-pointer">{brake}</Label>
                    </div>
                  ))}
                </div>
              )}

              {hasWheelSizes && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-2">Wheel Size</h4>
                  {availableFilters.wheelSizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`wheel-${size}`}
                        checked={localParams.getAll("wheelSize").includes(size)}
                        onCheckedChange={() => handleFilterChange("wheelSize", size)}
                      />
                      <Label htmlFor={`wheel-${size}`} className="cursor-pointer">{size}&quot;</Label>
                    </div>
                  ))}
                </div>
              )}

              {hasGenders && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-2">Gender</h4>
                  {availableFilters.genders.map((gen) => (
                    <div key={gen} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`gen-${gen}`}
                        checked={localParams.getAll("gender").includes(gen)}
                        onCheckedChange={() => handleFilterChange("gender", gen)}
                      />
                      <Label htmlFor={`gen-${gen}`} className="cursor-pointer">{gen}</Label>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h4 className="font-bold border-b pb-2">Target Age</h4>
                {ageRangeBuckets.map((age) => (
                  <div key={age.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`age-${age.value}`}
                      checked={localParams.getAll("ageRange").includes(age.value)}
                      onCheckedChange={() => handleFilterChange("ageRange", age.value)}
                    />
                    <Label htmlFor={`age-${age.value}`} className="cursor-pointer">{age.label}</Label>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="font-bold border-b pb-2">Person&apos;s Height</h4>
                {heightRanges.map((hr) => (
                  <div key={hr.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`hr-${hr.value}`}
                      checked={localParams.getAll("heightRange").includes(hr.value)}
                      onCheckedChange={() => handleFilterChange("heightRange", hr.value)}
                    />
                    <Label htmlFor={`hr-${hr.value}`} className="cursor-pointer">{hr.label}</Label>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="font-bold border-b pb-2">Availability</h4>
                {availabilities.map((avail) => (
                  <div key={avail.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`avail-${avail.value}`}
                      checked={localParams.getAll("availability").includes(avail.value)}
                      onCheckedChange={() => handleFilterChange("availability", avail.value)}
                    />
                    <Label htmlFor={`avail-${avail.value}`} className="cursor-pointer">{avail.label}</Label>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 col-span-1 sm:col-span-2 lg:col-span-4">
                <h4 className="font-bold border-b pb-2">Price Range</h4>
                <div className="flex items-center gap-2 max-w-sm">
                  <div className="flex-1">
                    <Label htmlFor="min-price" className="sr-only">Min Price</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-sm text-muted-foreground">₹</span>
                      <input 
                        id="min-price"
                        type="number" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-6 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Min"
                      />
                    </div>
                  </div>
                  <span className="text-muted-foreground font-bold">-</span>
                  <div className="flex-1">
                    <Label htmlFor="max-price" className="sr-only">Max Price</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-sm text-muted-foreground">₹</span>
                      <input 
                        id="max-price"
                        type="number" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-6 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handlePriceSubmit}
                    className="btn-cred h-10 px-4 bg-black text-white font-bold text-sm"
                  >
                    Go
                  </button>
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="btn-cred-white w-full h-12 bg-black text-white"
                >
                  Clear All Filters
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

```

### File: `src/components/store/ProductView.tsx`
```tsx
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

```

### File: `src/app/experience-offline/page.tsx`
```tsx
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Experience Offline | B M Davey & Co",
  description: "Why visiting our store is the best way to buy a bicycle.",
};

export default function ExperienceOfflinePage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 md:py-24 space-y-12">
      <div className="space-y-4 text-center max-w-2xl mx-auto flex flex-col items-center">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to store
        </Link>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-blue-600">
          Some things are meant to be felt before buying.
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed mt-4">
          At B M Davey & Co, we&apos;ve believed for over 90 years that buying a bicycle is a deeply personal experience. Here is why visiting our Chennai showroom offline ensures you get the perfect ride.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Test Ride Your Dream Bike</h3>
              <p className="text-muted-foreground mt-1">Feel the geometry, test the brakes, and ensure the size is an absolute perfect match for your height and riding style.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Expert Assembly & Tuning</h3>
              <p className="text-muted-foreground mt-1">Bikes shipped online often require self-assembly. When you buy from us, our expert mechanics tune the gears and align the brakes perfectly before you leave the store.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Personalized Fitting</h3>
              <p className="text-muted-foreground mt-1">Our experienced staff will adjust the saddle height, handlebars, and controls tailored specifically to your body proportions.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Instant Support & Warranty</h3>
              <p className="text-muted-foreground mt-1">No need to ship parts back and forth. If you have an issue, just walk in and we take care of it immediately.</p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-8 rounded-2xl border flex flex-col justify-center items-center text-center space-y-6">
          <h3 className="text-2xl font-bold">Ready to drop by?</h3>
          <p className="text-muted-foreground">
            Lock in your online price by reserving it, then come visit our showroom to experience it firsthand.
          </p>
          <div className="w-full space-y-3 pt-4 flex flex-col">
            <Link href="/about" className="w-full">
              <Button size="lg" className="w-full h-12 text-md">
                Get Directions to Store
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" size="lg" className="w-full h-12 text-md">
                Browse Bicycles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

```

### File: `src/components/store/HeroSection.tsx`
```tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useState, Suspense } from "react";
import { CycleFinderModal } from "./CycleFinderModal";

export function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const [isCycleFinderOpen, setIsCycleFinderOpen] = useState(false);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Animated Background - Pure CSS for scroll performance */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#008FEF]/20" />
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full hero-blob-1"
          style={{ background: "radial-gradient(circle, rgba(0,143,239,0.15) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full hero-blob-2"
          style={{ background: "radial-gradient(circle, rgba(0,143,239,0.12) 0%, transparent 70%)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col-reverse md:flex-row items-center justify-center md:justify-between gap-0 md:gap-12 max-w-7xl pt-28 md:pt-0">
        
        {/* Left Side: Text Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-1/2">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]"
          >
            <span className="block">First <span className="text-[#008FEF]">Pedals</span>.</span>
            <span className="block">Daily <span className="text-[#008FEF]">Runs</span>.</span>
            <span className="block">Pro <span className="text-[#008FEF]">Trails</span>.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-3 md:mt-6 text-sm sm:text-xl text-white/65 max-w-xl leading-relaxed"
          >
            No matter the journey, we travel with you. Secure your price for 48 hours. Pay only when you&apos;re ready to ride.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-4 md:mb-0"
          >
            <button
              onClick={scrollToProducts}
              className="btn-cred-white text-sm md:text-lg px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold bg-[#008FEF] text-black w-full sm:w-auto"
            >
              Browse Collection
            </button>
            <button
              onClick={() => setIsCycleFinderOpen(true)}
              className="btn-cred-white text-sm md:text-lg px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold bg-black text-white w-full sm:w-auto"
            >
              Find My Bike
            </button>
          </motion.div>

          {/* Cycle Finder Modal */}
          <Suspense fallback={null}>
            <CycleFinderModal isOpen={isCycleFinderOpen} onClose={() => setIsCycleFinderOpen(false)} />
          </Suspense>
        </div>

        {/* Right Side: Cycle SVG Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-[70%] sm:w-[85%] md:w-1/2 flex justify-center md:justify-end mx-auto md:mx-0 relative -left-4 md:-left-8"
        >
          <div className="relative">
            {/* Glow behind the bike */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(0,143,239,0.3) 0%, transparent 70%)",
                transform: "scale(1.5)",
              }}
            />
            <Image
              src="/cycle1.svg"
              alt="Premium Bicycle"
              width={600}
              height={400}
              className="relative max-w-full h-auto"
              priority
            />
          </div>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToProducts}
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-white/50 hover:text-white/60 transition-colors cursor-pointer animate-bounce-slow"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-5 h-5" />
      </button>
      
      <style jsx>{`
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        .hero-blob-1 {
          animation: blob1 8s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .hero-blob-2 {
          animation: blob2 10s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @keyframes blob1 {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        @keyframes blob2 {
          0%, 100% { transform: scale(1.1); opacity: 0.2; }
          50% { transform: scale(1); opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}

```

### File: `src/components/store/CycleFinderModal.tsx`
```tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "~/lib/utils";

type CycleFinderModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Answers = {
  who: string | null;         // Q1
  age: string | null;         // Q2
  terrain: string | null;     // Q3
  gears: string[];            // Q4
};

export function CycleFinderModal({ isOpen, onClose }: CycleFinderModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    who: null,
    age: null,
    terrain: null,
    gears: [],
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalSteps = answers.who === "kiddo" ? 2 : 4;
  const progress = ((step + 1) / totalSteps) * 100;

  // Push filter params to URL so the background grid updates in real-time
  const pushFilters = useCallback(
    (updated: Partial<Answers>) => {
      const merged = { ...answers, ...updated };
      const params = new URLSearchParams(searchParams.toString());

      // Clear old cycle-finder params
      params.delete("targetDemographic");
      params.delete("gender");
      params.delete("category");
      params.delete("gears");
      params.delete("ageRange");
      params.set("page", "1");

      // Q1: Who
      if (merged.who === "kiddo") {
        params.set("targetDemographic", "Kids");
      } else if (merged.who === "myself_m") {
        params.set("targetDemographic", "Adults");
        params.append("gender", "Male");
        params.append("gender", "Unisex");
      } else if (merged.who === "myself_f") {
        params.set("targetDemographic", "Adults");
        params.append("gender", "Female");
        params.append("gender", "Unisex");
      } else if (merged.who === "anyone") {
        params.set("targetDemographic", "Adults");
      }

      // Q2: Age
      if (merged.age) {
        params.set("ageRange", merged.age);
      }

      // Q3: Terrain
      if (merged.terrain === "multi") params.set("category", "Mountain (MTB)");
      else if (merged.terrain === "paved") params.set("category", "Hybrid");

      // Q4: Gears (Multiple)
      if (merged.gears && merged.gears.length > 0) {
        merged.gears.forEach(g => {
          if (g === "simple") params.append("gears", "1");
          else if (g === "few") params.append("gears", "7");
          else if (g === "all") params.append("gears", "21");
        });
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [answers, searchParams, router, pathname]
  );

  const selectAnswer = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    pushFilters({ [key]: value });
  };

  const toggleGear = (value: string) => {
    const current = [...answers.gears];
    if (current.includes(value)) {
      selectAnswer("gears", current.filter((g) => g !== value));
    } else {
      selectAnswer("gears", [...current, value]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else handleClose();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  const optionBtn = (isSelected: boolean) =>
    cn(
      "relative w-full py-4 px-5 rounded-xl border-2 text-left font-medium transition-all duration-150 active:scale-[0.98]",
      isSelected
        ? "border-[#008FEF] bg-[#008FEF]/5 text-[#008FEF] shadow-[0_4px_0_0_#008FEF]"
        : "border-black/20 bg-white hover:border-black/40 text-black"
    );

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999999] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm md:pt-20"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full md:max-w-lg bg-white text-black rounded-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[85dvh] md:max-h-[85vh] scale-[0.85] md:scale-100 origin-bottom md:origin-center mb-12 md:mb-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Road Line */}
            <div className="relative h-40 bg-muted/30 border-b overflow-hidden">
              {/* Road */}
              <div className="absolute bottom-6 left-0 right-0 h-[4px] bg-black/80 mx-6 rounded-full" />
              {/* Bike travelling along the road */}
              <motion.div
                className="absolute bottom-2 w-32 h-32"
                animate={{ left: `calc(${progress}% - 96px)` }}
                transition={{ type: "spring", damping: 20, stiffness: 150 }}
                style={{ marginLeft: "1.5rem", marginRight: "1.5rem" }}
              >
                <Image
                  src="/cycle2.svg"
                  alt="Progress"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </motion.div>
              {/* Step indicator */}
              <div className="absolute top-4 right-6 text-sm font-bold text-muted-foreground tracking-widest bg-white/80 px-2 py-1 rounded-md shadow-sm">
                {step + 1} / {totalSteps}
              </div>
              {/* Close */}
              <button
                onClick={handleClose}
                className="absolute top-4 left-6 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Questions */}
            <div className="p-6 md:p-8 overflow-y-auto h-[440px] mt-2" style={{ maxHeight: "calc(85vh - 14rem)" }}>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="q1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold">Who is riding?</h3>
                    <p className="text-sm text-black/60">Select the intended rider so we can find the right fit.</p>
                    <div className="grid gap-4 mt-6">
                      {[
                        { value: "kiddo", label: "My Child", desc: "For children and young riders" },
                        { value: "myself_m", label: "Myself (Male)", desc: "Adult male rider" },
                        { value: "myself_f", label: "Myself (Female)", desc: "Adult female rider" },
                        { value: "anyone", label: "Someone Else", desc: "For a gift or general browsing" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { selectAnswer("who", opt.value); handleNext(); }}
                          className={optionBtn(answers.who === opt.value)}
                        >
                          <div className="text-base font-bold text-left w-full">{opt.label}</div>
                          <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="q2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold">What is the rider&apos;s age?</h3>
                    <p className="text-sm text-black/60">Select the age range for accurate frame sizing.</p>
                    <div className="grid gap-4 mt-6">
                      {answers.who === "kiddo" ? (
                        <>
                          <button onClick={() => { selectAnswer("age", "2-5"); handleNext(); }} className={optionBtn(answers.age === "2-5")}>
                            <div className="text-base font-bold text-left w-full">2-5 years</div>
                            <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">Perfect for toddlers</div>
                          </button>
                          <button onClick={() => { selectAnswer("age", "5-8"); handleNext(); }} className={optionBtn(answers.age === "5-8")}>
                            <div className="text-base font-bold text-left w-full">5-8 years</div>
                            <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">Growing kids</div>
                          </button>
                          <button onClick={() => { selectAnswer("age", "8-12"); handleNext(); }} className={optionBtn(answers.age === "8-12")}>
                            <div className="text-base font-bold text-left w-full">8-12 years</div>
                            <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">Pre-teens</div>
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { selectAnswer("age", "13-17"); handleNext(); }} className={optionBtn(answers.age === "13-17")}>
                            <div className="text-base font-bold text-left w-full">13-17 years</div>
                            <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">Teenagers</div>
                          </button>
                          <button onClick={() => { selectAnswer("age", "18-20"); handleNext(); }} className={optionBtn(answers.age === "18-20")}>
                            <div className="text-base font-bold text-left w-full">18+ years</div>
                            <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">Adults</div>
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 2 && answers.who !== "kiddo" && (
                  <motion.div
                    key="q3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold">Where will you ride?</h3>
                    <p className="text-sm text-black/60">Select the primary terrain for your rides.</p>
                    <div className="grid gap-4 mt-6">
                      {[
                        { value: "multi", label: "Multi Terrain", desc: "Mountain biking and off-road" },
                        { value: "paved", label: "Paved Road", desc: "City streets and commuting" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { selectAnswer("terrain", opt.value); handleNext(); }}
                          className={optionBtn(answers.terrain === opt.value)}
                        >
                          <div className="text-base font-bold text-left w-full">{opt.label}</div>
                          <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && answers.who !== "kiddo" && (
                  <motion.div
                    key="q4"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold">How many gears do you need?</h3>
                    <p className="text-sm text-black/60">Select all that apply.</p>
                    <div className="grid gap-4 mt-6">
                      {[
                        { value: "simple", label: "Single Speed", desc: "Keep it simple and easy to maintain" },
                        { value: "few", label: "7 Speeds", desc: "A few options, great for city riding" },
                        { value: "all", label: "21+ Speeds", desc: "Maximum options for steep climbs" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => toggleGear(opt.value)}
                          className={optionBtn(answers.gears.includes(opt.value))}
                        >
                          <div className="text-base font-bold text-left w-full">{opt.label}</div>
                          <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
              <button
                onClick={handleBack}
                disabled={step === 0}
                className="btn-cred gap-1 h-10 px-4 bg-white text-black shrink-0 disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNext}
                className="btn-cred gap-1 h-10 px-4 bg-white text-black shrink-0"
              >
                {step === totalSteps - 1 ? "See Results" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}

```

### File: `src/app/page.tsx`
```tsx
import { getStorefrontProducts } from "~/server/actions/store-products";
import { DynamicFilters } from "~/components/store/DynamicFilters";
import { ClientProductGrid } from "~/components/store/ClientProductGrid";
import { PaginationControls } from "~/components/store/PaginationControls";
import { SearchBar } from "~/components/store/SearchBar";
import { HeroSection } from "~/components/store/HeroSection";
import { Header } from "~/components/store/Header";
import { SplashLoader } from "~/components/store/SplashLoader";
import { headers } from "next/headers";
import { Suspense } from "react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const getSingleString = (val: string | string[] | undefined) => Array.isArray(val) ? val[0] : val;
  
  const pageParam = getSingleString(resolvedSearchParams.page);
  const page = pageParam ? parseInt(pageParam) : 1;
  const search = getSingleString(resolvedSearchParams.search) ?? "";
  
  const heightInchesParam = getSingleString(resolvedSearchParams.heightInches);
  const heightInches = heightInchesParam ? parseInt(heightInchesParam) : undefined;
  
  const minPriceParam = getSingleString(resolvedSearchParams.minPrice);
  const minPrice = minPriceParam ? parseInt(minPriceParam) : undefined;
  
  const maxPriceParam = getSingleString(resolvedSearchParams.maxPrice);
  const maxPrice = maxPriceParam ? parseInt(maxPriceParam) : undefined;

  const category = resolvedSearchParams.category;
  const targetDemographic = resolvedSearchParams.targetDemographic;
  const frameMaterial = resolvedSearchParams.frameMaterial;
  const gears = resolvedSearchParams.gears;
  const gender = resolvedSearchParams.gender;
  const heightRange = resolvedSearchParams.heightRange;
  const brakes = resolvedSearchParams.brakes;
  const wheelSize = resolvedSearchParams.wheelSize;
  const availability = resolvedSearchParams.availability;
  const ageRange = resolvedSearchParams.ageRange;

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") ?? "";
  // Check for common mobile and tablet identifiers
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);

  const limit = isMobile ? 5 : 12;

  const { products, pagination, availableFilters } = await getStorefrontProducts({
    page,
    limit,
    search,
    category,
    targetDemographic,
    frameMaterial,
    gears,
    gender,
    heightInches,
    heightRange,
    minPrice,
    maxPrice,
    brakes,
    wheelSize,
    availability,
    ageRange,
  });

  return (
    <SplashLoader>
    <main className="min-h-dvh bg-background relative flex flex-col scroll-smooth">
      {/* --- ANIMATED SCROLL HEADER --- */}
      <Header />

      {/* --- HERO SECTION --- */}
      <HeroSection />

      {/* --- PRODUCTS SECTION --- */}
      <section
        id="products-section"
        className="min-h-dvh bg-background scroll-mt-28 md:scroll-mt-32 pb-32"
      >
        {/* Search & Filters area */}
        <div className="sticky top-28 md:top-32 z-30 bg-background/95 backdrop-blur-lg border-b py-4">
          <div className="container mx-auto px-4 md:px-6">
            <Suspense fallback={<div className="h-12 w-full animate-pulse bg-muted rounded-md" />}>
              <DynamicFilters availableFilters={availableFilters}>
                <SearchBar />
              </DynamicFilters>
            </Suspense>
          </div>
        </div>

        <div className="container flex flex-col gap-6 px-4 md:px-6 py-8 mx-auto">
          {/* Grid */}
          <div className="w-full flex flex-col min-h-[500px]">
            {pagination.isFeaturedPage && (
              <div className="mb-6 flex items-center gap-2 text-primary font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                Featured Picks
              </div>
            )}

            <ClientProductGrid products={products} />

            <Suspense fallback={<div className="h-20 w-full" />}>
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
              />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
    </SplashLoader>
  );
}

```

### File: `src/server/actions/store-products.ts`
```tsx
"use server";

import { db } from "~/server/db";
import { products, productVariants } from "~/server/db/schema";
import { eq, ilike, or, and, sql, asc, desc, gte, lte, inArray, notInArray, type SQL } from "drizzle-orm";

type StorefrontProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | string[];
  targetDemographic?: string | string[];
  frameMaterial?: string | string[];
  gears?: string | string[];
  heightInches?: number;
  heightRange?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  gender?: string | string[];
  brakes?: string | string[];
  wheelSize?: string | string[];
  availability?: string | string[];
  ageRange?: string | string[];
};

export async function getStorefrontProducts({
  page = 1,
  limit = 15,
  search = "",
  category,
  targetDemographic,
  frameMaterial,
  gears,
  heightInches,
  heightRange,
  minPrice,
  maxPrice,
  gender,
  brakes,
  wheelSize,
  availability,
  ageRange,
}: StorefrontProductsParams) {
  const conditions = [];
  let searchWhere;

  if (search) {
    const searchConditions = [
      ilike(products.name, `%${search}%`),
      ilike(products.brand, `%${search}%`),
      ilike(products.category, `%${search}%`),
      ilike(products.target_demographic, `%${search}%`),
      ilike(products.frame_material, `%${search}%`),
      ilike(products.gender, `%${search}%`),
      ilike(products.brakes, `%${search}%`),
      ilike(products.wheel_size_t, `%${search}%`),
      inArray(
        products.id,
        db.select({ id: productVariants.product_id })
          .from(productVariants)
          .where(ilike(productVariants.color_name, `%${search}%`))
      )
    ];

    const searchNum = parseInt(search);
    if (!isNaN(searchNum)) {
      searchConditions.push(eq(products.gears, searchNum));
    }

    searchWhere = or(...searchConditions);
    conditions.push(searchWhere);
  }

  const toArray = (val: string | string[] | undefined): string[] => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const categories = toArray(category);
  if (categories.length > 0) conditions.push(inArray(products.category, categories));

  const demographics = toArray(targetDemographic);
  if (demographics.length > 0) conditions.push(inArray(products.target_demographic, demographics));

  const frames = toArray(frameMaterial);
  if (frames.length > 0) conditions.push(inArray(products.frame_material, frames));

  const genders = toArray(gender);
  if (genders.length > 0) conditions.push(inArray(products.gender, genders));

  const brakeList = toArray(brakes);
  if (brakeList.length > 0) conditions.push(inArray(products.brakes, brakeList));

  const wheels = toArray(wheelSize);
  if (wheels.length > 0) {
    const wheelConditions = wheels.map(w => ilike(products.wheel_size_t, `%${w}%`));
    conditions.push(or(...wheelConditions)!);
  }

  const ageRangesList = toArray(ageRange);
  if (ageRangesList.length > 0) {
    const ageConditions = ageRangesList.map(ar => {
      const [filterMinStr, filterMaxStr] = ar.split("-");
      const filterMin = parseInt(filterMinStr ?? "");
      if (isNaN(filterMin)) return undefined;
      const filterMax = parseInt(filterMaxStr ?? "");
      const fMax = isNaN(filterMax) ? 20 : filterMax;
      return sql`
        CASE 
          WHEN ${products.age_range} ~ '^[0-9]+-[0-9]+$' THEN
            CAST(SPLIT_PART(${products.age_range}, '-', 1) AS INTEGER) <= ${fMax} AND CAST(SPLIT_PART(${products.age_range}, '-', 2) AS INTEGER) >= ${filterMin}
          ELSE FALSE
        END
      `;
    }).filter(Boolean) as SQL[];
    if (ageConditions.length > 0) {
      conditions.push(or(...ageConditions)!);
    }
  }

  const availabilities = toArray(availability);
  if (availabilities.length > 0) {
    if (availabilities.includes("in_stock") && !availabilities.includes("out_of_stock")) {
      conditions.push(
        inArray(
          products.id,
          db.select({ id: productVariants.product_id })
            .from(productVariants)
            .where(eq(productVariants.in_stock, true))
        )
      );
    } else if (availabilities.includes("out_of_stock") && !availabilities.includes("in_stock")) {
      conditions.push(
        notInArray(
          products.id,
          db.select({ id: productVariants.product_id })
            .from(productVariants)
            .where(eq(productVariants.in_stock, true))
        )
      );
    }
  }

  const gearsList = toArray(gears);
  if (gearsList.length > 0) {
    const gearsConditions = gearsList.map(g => {
      const gearsNum = parseInt(g);
      if (isNaN(gearsNum)) return undefined;
      if (gearsNum >= 21) {
        return gte(products.gears, 21);
      } else {
        return eq(products.gears, gearsNum);
      }
    }).filter(Boolean) as SQL[];
    if (gearsConditions.length > 0) {
      conditions.push(or(...gearsConditions)!);
    }
  }

  if (heightInches) {
    conditions.push(lte(products.height_min_inches, heightInches));
    conditions.push(gte(products.height_max_inches, heightInches));
  }

  const heightsList = toArray(heightRange);
  if (heightsList.length > 0) {
    const heightConditions = heightsList.map(hr => {
      const [minStr, maxStr] = hr.split("-");
      const minRange = parseInt(minStr ?? "");
      const maxRange = parseInt(maxStr ?? "");
      if (!isNaN(minRange) && !isNaN(maxRange)) {
        return and(
          lte(products.height_min_inches, maxRange),
          gte(products.height_max_inches, minRange)
        );
      }
      return undefined;
    }).filter(Boolean) as SQL[];
    if (heightConditions.length > 0) {
      conditions.push(or(...heightConditions)!);
    }
  }

  if (minPrice) conditions.push(gte(sql`${products.base_price}::numeric`, minPrice));
  if (maxPrice) conditions.push(lte(sql`${products.base_price}::numeric`, maxPrice));

  const baseWhere = conditions.length > 0 ? and(...conditions) : undefined;

  // 1. Get total count
  const _totalRes = await db
    .select({ totalCount: sql<number>`count(*)::int` })
    .from(products)
    .where(baseWhere);
  const totalCount = _totalRes[0]?.totalCount ?? 0;

  const totalPages = Math.ceil(totalCount / limit);
  const queryOffset = (page - 1) * limit;

  // 2. Fetch the specific page of products
  const data = await db.query.products.findMany({
    where: baseWhere,
    orderBy: [desc(products.is_featured), asc(products.name)],
    limit: limit,
    offset: queryOffset,
    with: {
      productVariants: {
        with: {
          productImages: {
            orderBy: (imgs, { asc }) => [asc(imgs.order)],
          },
        },
      },
    },
  });

  const isFetchingFeatured = page === 1 && data.some(p => p.is_featured);

  // 4. Extract Dynamic Filter Options (based on current search/base conditions)
  const filterData = await db
    .select({
      category: products.category,
      targetDemographic: products.target_demographic,
      frameMaterial: products.frame_material,
      gears: products.gears,
      brakes: products.brakes,
      wheelSize: products.wheel_size_t,
      gender: products.gender,
      ageRange: products.age_range,
    })
    .from(products)
    .where(searchWhere); // Filter options only by text search, not selected facets

  const availableFilters = {
    categories: Array.from(new Set(filterData.map(d => d.category).filter((x): x is string => Boolean(x)))),
    demographics: Array.from(new Set(filterData.map(d => d.targetDemographic).filter((x): x is string => Boolean(x)))),
    frameMaterials: Array.from(new Set(filterData.map(d => d.frameMaterial).filter((x): x is string => Boolean(x)))),
    gears: Array.from(new Set(filterData.map(d => d.gears).filter((x): x is number => x !== null && x !== undefined))),
    brakes: Array.from(new Set(filterData.map(d => d.brakes).filter((x): x is string => Boolean(x)))),
    wheelSizes: Array.from(new Set(filterData.flatMap(d => d.wheelSize ? d.wheelSize.split(",").map(s => s.trim()) : []))),
    genders: Array.from(new Set(filterData.map(d => d.gender).filter((x): x is string => Boolean(x)))),
    ageRanges: Array.from(new Set(filterData.map(d => d.ageRange).filter((x): x is string => Boolean(x)))),
  };

  return {
    products: data,
    pagination: {
      currentPage: page,
      totalPages: totalPages === 0 ? 1 : totalPages,
      isFeaturedPage: isFetchingFeatured,
    },
    availableFilters,
  };
}

```

