"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
};

export function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    // Dispatch event to show loading overlay in the grid that waits for images
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("start-product-loading"));
    }
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Slight delay to ensure route changes before smooth scrolling
    setTimeout(() => {
      document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-8 mt-auto relative z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <div className="text-sm font-medium">
        Page {currentPage} of {totalPages}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
