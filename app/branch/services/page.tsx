"use client";
import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { usePayload } from "@/hooks/usePayload";

function ServicesPage() {
  const router = useRouter();
  const { payload, isLoading } = usePayload();

  useEffect(() => {
    if (!isLoading && payload?.branch?.id) {
      router.push(`/branch/${payload.branch.id}/services/lodging`);
    }
  }, [payload, isLoading, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
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
