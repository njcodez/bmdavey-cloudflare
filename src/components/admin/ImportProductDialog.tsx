"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { CopyPlus, Search, Loader2 } from "lucide-react";
import { searchProductNames, getFullProductForImport } from "~/server/actions/import-product";

type ImportedProductData = Awaited<ReturnType<typeof getFullProductForImport>>;

type ImportProductDialogProps = {
  onImport: (data: ImportedProductData) => void;
};

export function ImportProductDialog({ onImport }: ImportProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ id: number; name: string; brand: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string; brand: string } | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        setIsLoading(true);
        void (async () => {
          try {
            const res = await searchProductNames(searchQuery);
            setResults(res);
          } catch (error) {
            console.error("Failed to search products", error);
          } finally {
            setIsLoading(false);
          }
        })();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectProduct = (product: { id: number; name: string; brand: string }) => {
    setSelectedProduct(product);
    setIsAlertOpen(true);
  };

  const handleConfirmImport = async () => {
    if (!selectedProduct) return;
    
    setIsImporting(true);
    try {
      const fullData = await getFullProductForImport(selectedProduct.id);
      onImport(fullData);
      setIsAlertOpen(false);
      setIsOpen(false); // Close the main dialog too
      setSearchQuery(""); // Reset for next time
    } catch (error) {
      console.error("Failed to fetch full product data", error);
      alert("Failed to import product data. Please try again.");
    } finally {
      setIsImporting(false);
      setSelectedProduct(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger render={<Button type="button" variant="outline" className="flex items-center gap-2 border-primary/20 hover:bg-primary/5 text-primary" />}>
          <CopyPlus className="w-4 h-4" />
          Import from existing
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Product Data</DialogTitle>
            <DialogDescription>
              Search for an existing product to copy its fields, variants, and images.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search exact product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {searchQuery.length >= 2 && results.length === 0 && !isLoading && (
                <div className="text-sm text-center text-muted-foreground py-4">
                  No products found matching &quot;{searchQuery}&quot;
                </div>
              )}
              
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="p-3 rounded-md border hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors flex flex-col"
                >
                  <span className="font-semibold text-sm">{product.name}</span>
                  <span className="text-xs text-muted-foreground">{product.brand}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={(open) => { if (!isImporting) setIsAlertOpen(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to import data from <strong>{selectedProduct?.brand} {selectedProduct?.name}</strong>.
              <br/><br/>
              This will overwrite most fields in your current form. Existing images will be preserved and the imported ones will be added to them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImporting}>Cancel</AlertDialogCancel>
            <Button onClick={handleConfirmImport} disabled={isImporting} className="gap-2">
              {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
              Yes, import data
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
