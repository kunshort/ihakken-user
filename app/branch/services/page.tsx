"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function ServicesPage() {
  const searchParams = useSearchParams();
  const [branchId, setBranchId] = useState(null);

  useEffect(() => {
    const payload = searchParams.get("payload");
    if (payload) {
      try {
        const decoded = JSON.parse(
          Buffer.from(payload, "base64url").toString("utf-8")
        );

        console.log("Successfully decoded:", decoded);
        setBranchId(decoded.branch?.id);
      } catch (error) {
        console.error("[v0] Failed to parse payload:", error);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {branchId ? (
        <p className="text-foreground">Branch ID: {branchId}</p>
      ) : (
        <p className="text-destructive text-lg">Invalid access link.</p>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>}>
      <ServicesPage />
    </Suspense>
  );
}
