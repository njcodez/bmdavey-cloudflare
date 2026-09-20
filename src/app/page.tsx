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
