"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { usePayload } from "@/hooks/usePayload";

function ServiceRedirect() {
  const router = useRouter();
  const { payload, isLoading } = usePayload();

  useEffect(() => {
    // Wait for loading to finish and ensure we have a payload with service info
    if (!isLoading && payload?.service && payload?.branch) {
      const { type, id } = payload.service;
      const branchId = payload.branch.id;

      if (type?.toLowerCase() === "restaurant") {
        // Redirect to the restaurant menu page
        // This handles both Service Scans and Table Scans
        router.push(`/branch/${branchId}/services/restaurant`);
      } else if (type?.toLowerCase() === "lodging") {
        // Redirect to the accommodation page
        router.push(`/branch/${branchId}/services/lodging`);
      }
    }
  }, [payload, isLoading, router]);

  // Determine loading text based on service type to match destination page
  const loadingText = payload?.service?.type?.toLowerCase() === "lodging" 
    ? "Loading accommodations..." 
    : payload?.service?.type?.toLowerCase() === "restaurant"
    ? "Loading menu items..."
    : "Loading...";

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  // Error state if payload is missing or invalid
  if (!payload?.service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">Invalid service scan.</p>
          <p className="text-muted-foreground text-sm">Please try scanning the QR code again.</p>
        </div>
      </div>
    );
  }

  // Fallback while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">{loadingText}</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <ServiceRedirect />
    </Suspense>
  );
}