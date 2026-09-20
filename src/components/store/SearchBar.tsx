"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "~/components/ui/input";
import { Search, X } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") ?? "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      
      // Reset page when searching
      if (query !== initialQuery) {
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams, initialQuery]);

  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search bikes, colors, brands..."
        className="pl-12 pr-12 w-full h-12 text-base border-2 border-black rounded-none shadow-[4px_4px_0_0_#000] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[4px_4px_0_0_var(--color-primary)] transition-all bg-background placeholder:text-muted-foreground/60"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
