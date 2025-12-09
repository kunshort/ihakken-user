import { LodgingLayout } from "@/components/lodging/layout";
import { Suspense } from "react";

export const metadata = {
  title: "Lodging - Serenity Hub",
  description: "Find your perfect accommodation at Serenity Hub",
};

export default async function LodgingPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <LodgingLayout branchId={branchId} />
    </Suspense>
  );
}
