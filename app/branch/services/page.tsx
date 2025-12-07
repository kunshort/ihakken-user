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
    <div>
      {branchId ? (
        <p>Branch ID: {branchId}</p>
      ) : (
        <p className="text-red-600 text-20 mr-12">Invalid access link.</p>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServicesPage />
    </Suspense>
  );
}
