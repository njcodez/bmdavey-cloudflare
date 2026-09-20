"use client";

import { useState } from "react";
import { deleteCoupon } from "~/server/actions/coupons";
import { Button } from "~/components/ui/button";

export function ClaimCouponButton({ couponId }: { couponId: number }) {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    if (!window.confirm("Are you sure you want to mark this coupon as claimed? It will be deleted permanently.")) return;
    
    setIsClaiming(true);
    try {
      await deleteCoupon(couponId);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Button 
      onClick={handleClaim} 
      disabled={isClaiming} 
      variant="outline" 
      size="sm"
      className="ml-2 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
    >
      {isClaiming ? "..." : "Claimed"}
    </Button>
  );
}
