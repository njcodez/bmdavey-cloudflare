"use client";

import { purgeExpiredCoupons } from "~/server/actions/coupons";
import { Button } from "~/components/ui/button";
import { useState } from "react";

export function BulkPurgeButton() {
  const [isPurging, setIsPurging] = useState(false);

  const handlePurge = async () => {
    setIsPurging(true);
    try {
      await purgeExpiredCoupons();
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <Button onClick={handlePurge} disabled={isPurging} variant="destructive">
      {isPurging ? "Purging..." : "Bulk Purge Expired"}
    </Button>
  );
}
