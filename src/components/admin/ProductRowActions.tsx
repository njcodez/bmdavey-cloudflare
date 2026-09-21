"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { toggleDiscountHighlight, toggleIsFeatured, deleteProduct, toggleOutOfStock } from "~/server/actions/products";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";

type ProductRowActionsProps = {
  id: number;
  discountHighlight: boolean;
  isFeatured: boolean;
  isAllOutOfStock: boolean;
};

export function ProductRowActions({ id, discountHighlight, isFeatured, isAllOutOfStock }: ProductRowActionsProps) {
  const router = useRouter();
  const [masterPass, setMasterPass] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleToggleD = async () => {
    await toggleDiscountHighlight(id, discountHighlight);
  };

  const handleToggleF = async () => {
    await toggleIsFeatured(id, isFeatured);
  };

  const handleToggleO = async () => {
    await toggleOutOfStock(id, !isAllOutOfStock);
  };

  const handleEdit = () => {
    router.push(`/admin/products/${id}/edit`);
  };

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);
    try {
      const res = await deleteProduct(id, masterPass);
      if (res?.error) {
        setError(res.error);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={discountHighlight ? "default" : "outline"}
        size="sm"
        onClick={handleToggleD}
        className={discountHighlight ? "bg-primary text-primary-foreground" : ""}
      >
        D
      </Button>
      <Button
        variant={isFeatured ? "default" : "outline"}
        size="sm"
        onClick={handleToggleF}
        className={isFeatured ? "bg-primary text-primary-foreground" : ""}
      >
        F
      </Button>
      <Button
        variant={isAllOutOfStock ? "destructive" : "outline"}
        size="sm"
        onClick={handleToggleO}
        title={isAllOutOfStock ? "Currently Out of Stock. Click to make In Stock." : "Click to make all variants Out of Stock."}
      >
        O
      </Button>
      <Button variant="outline" size="sm" onClick={handleEdit}>
        Edit
      </Button>

      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
          Delete
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product, its variants, and images.
              Please enter the master deletion password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Master Password"
              value={masterPass}
              onChange={(e) => setMasterPass(e.target.value)}
              autoComplete="new-password"
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || !masterPass}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
