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
    const current = params.get(key);
    
    // For single select behavior (if clicking the same, remove it)
    if (current === value) {
      params.delete(key);
    } else {
      params.set(key, value);
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
                        checked={localParams.get("category") === cat}
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
                        checked={localParams.get("targetDemographic") === demo}
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
                        checked={localParams.get("frameMaterial") === frame}
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
                        checked={localParams.get("gears") === gear.toString()}
                        onCheckedChange={() => handleFilterChange("gears", gear.toString())}
                      />
                      <Label htmlFor={`gear-${gear}`} className="cursor-pointer">{gear} Speed</Label>
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
                        checked={localParams.get("brakes") === brake}
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
                        checked={localParams.get("wheelSize") === size}
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
                        checked={localParams.get("gender") === gen}
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
                      checked={localParams.get("ageRange") === age.value}
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
                      checked={localParams.get("heightRange") === hr.value}
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
                      checked={localParams.get("availability") === avail.value}
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
