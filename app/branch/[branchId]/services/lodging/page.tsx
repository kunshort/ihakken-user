"use client";

import { useEffect, useState } from "react";
import { LodgingLayout } from "@/components/lodging/layout";
import { AiChatAssistant } from "@/components/shared/AiChatAssistant";
import { usePayload } from "@/hooks/usePayload";

export default function LodgingPage() {
  const { payload: payloadData, isLoading } = usePayload();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
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
  const lodgingServiceId = payloadData?.services?.find(
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
