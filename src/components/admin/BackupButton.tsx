"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export function BackupButton() {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) throw new Error("Backup failed");
      
      // Attempt to extract the filename from the Content-Disposition header
      const contentDisposition = res.headers.get("Content-Disposition");
      const dateStr = new Date().toISOString().split("T")[0];
      let filename = `bmdavey_backup_${dateStr}.zip`;
      if (contentDisposition) {
        const filenameMatch = /filename="(.+)"/.exec(contentDisposition);
        const extractedFilename = filenameMatch?.[1];
        if (extractedFilename) {
          filename = extractedFilename;
        }
      }

      // Read the binary data as a Blob and create a temporary download link
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Backup error:", e);
      alert("Failed to create backup.");
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <Button 
      variant="secondary" 
      className="gap-2 min-w-[120px]" 
      onClick={handleBackup} 
      disabled={isBackingUp}
    >
      {isBackingUp ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> Preparing...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" /> Backup
        </>
      )}
    </Button>
  );
}
