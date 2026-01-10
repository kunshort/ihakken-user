"use client";

import { LodgingLayout } from "@/components/lodging/layout";
import { AiChatAssistant } from "@/components/shared/AiChatAssistant";
import { usePayload } from "@/hooks/usePayload";

export default function LodgingPage() {
  const { payload: payloadData, isLoading } = usePayload();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading accommodations...</p>
        </div>
      </div>
    );
  }

  if (!payloadData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">No valid session found. Please start from the beginning.</p>
          <a href="/" className="text-primary hover:underline">
            Go back to services
          </a>
        </div>
      </div>
    );
  }

  // Extract the lodging service id from the decoded payload
  // Check specific service object first (Service Scan), then fall back to list (Branch Scan)
  const lodgingServiceId = payloadData?.service?.type?.toLowerCase() === "lodging"
    ? payloadData.service.id
    : payloadData?.services?.find(
        (s: any) => s.serviceType?.toLowerCase() === "lodging"
      )?.id;

  if (!lodgingServiceId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">Lodging service not found in payload</p>
          <a href="/" className="text-primary hover:underline">
            Go back to services
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <LodgingLayout branchId={payloadData.branch.id} />
      <AiChatAssistant
        serviceId={lodgingServiceId}
        branchId={payloadData.branch.id}
        serviceType="lodging"
      />
    </>
  );
}
