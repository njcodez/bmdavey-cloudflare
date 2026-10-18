import { getStorefrontProducts } from "~/server/actions/store-products";
import { DynamicFilters } from "~/components/store/DynamicFilters";
import { ClientProductGrid } from "~/components/store/ClientProductGrid";
import { PaginationControls } from "~/components/store/PaginationControls";
import { SearchBar } from "~/components/store/SearchBar";
import { HeroSection } from "~/components/store/HeroSection";
import { Header } from "~/components/store/Header";
import { Footer } from "~/components/store/Footer";
import { SplashLoader } from "~/components/store/SplashLoader";
import { headers, cookies } from "next/headers";
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

  const brand = resolvedSearchParams.brand;
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

  const cookieStore = await cookies();
  const hasSeenSplash = cookieStore.has("bmdavey-splash-shown");

  const limit = isMobile ? 8 : 12;

  const { products, pagination, availableFilters } = await getStorefrontProducts({
    page,
    limit,
    search,
    brand,
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
    <SplashLoader initialShowSplash={!hasSeenSplash}>
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
          <div className="w-full flex flex-col min-h-[500px] relative">
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

        {/* --- SEO RICH CONTENT & LOCAL CHENNAI STORE INFO --- */}
        <div className="container mx-auto px-4 md:px-6 mt-16 pt-12 border-t border-border/60">
          <div className="max-w-5xl mx-auto space-y-12">
            
            {/* Header intro */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
                Your Trusted Cycle Shop in Chennai Since 1932
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
                Welcome to <strong>B. M. Davey & Co.</strong>, one of Chennai’s oldest and most respected bicycle stores. Located on Broadway (Prakasam Salai, Parrys), we offer an unmatched collection of kids bicycles, adult geared cycles, mountain bikes (MTB), hybrid city commuters, and cycling gear for every rider and budget.
              </p>
            </div>

            {/* Value Pillars Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm space-y-2">
                <h3 className="text-lg font-bold text-foreground">Kids & Toddler Bicycles</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Find the safest, most durable bicycles for children aged 2 to 12 years. Complete with training wheels, lightweight frames, and vibrant colors from trusted brands like Hero, Hercules, and BSA.
                </p>
              </div>

              <div className="p-6 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm space-y-2">
                <h3 className="text-lg font-bold text-foreground">Geared & MTB Cycles</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Conquer rough roads or morning workouts with Shimano-equipped multi-gear mountain cycles, front disc brakes, and rugged suspension forks designed for Indian terrains.
                </p>
              </div>

              <div className="p-6 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm space-y-2">
                <h3 className="text-lg font-bold text-foreground">City Commuters & Hybrids</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Effortless, fast-rolling hybrid bicycles engineered for Chennai’s daily traffic and fitness routines. Comfortable upright seating with puncture-resistant tires.
                </p>
              </div>
            </div>

            {/* Frequently Asked Questions (SEO / Rich Snippet boost) */}
            <div className="space-y-6 pt-6 border-t border-border/40">
              <h3 className="text-xl sm:text-2xl font-black text-center text-foreground">
                Frequently Asked Questions — Cycle Shopping in Chennai
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="p-5 rounded-xl bg-muted/40 border space-y-2">
                  <h4 className="font-semibold text-foreground text-base">Where is B. M. Davey & Co. cycle shop located in Chennai?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Our landmark showroom is located on Broadway (Prakasam Salai) in Parrys, George Town - the historic heart of Chennai&apos;s bicycle hub.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-muted/40 border space-y-2">
                  <h4 className="font-semibold text-foreground text-base">Can I book a bicycle online and test ride it in Chennai?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Yes! Browse our collection online, reserve any cycle to lock in your price for 48 hours without paying upfront, and visit our store to test ride and get custom fitting.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-muted/40 border space-y-2">
                  <h4 className="font-semibold text-foreground text-base">Do you sell bicycles for all age groups and budgets?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    We stock cycles for every budget, from starter toddler bikes to high-performance multi-speed adult bicycles, ladies city cycles, and daily commuter bikes.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-muted/40 border space-y-2">
                  <h4 className="font-semibold text-foreground text-base">Do cycles come fully assembled and tuned?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Unlike standard online orders delivered in a box, every bicycle bought at B. M. Davey & Co. is assembled, brake-aligned, and tuned by veteran mechanics with over 35 years of experience.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </main>
    </SplashLoader>
  );
}
