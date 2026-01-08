"use client";

import { useEffect } from "react";
import RestaurantLayout from "@/components/restaurant/layout";
import { AiChatAssistant } from "@/components/shared/AiChatAssistant";
import { usePayload } from "@/hooks/usePayload";

export default function RestaurantPage() {
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

  // Extract the restaurant service id from the decoded payload
  const restaurantServiceId = payloadData?.services?.find(
    (s: any) => s.serviceType?.toLowerCase() === "restaurant"
  )?.id;

  if (!restaurantServiceId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">Restaurant service not found in payload</p>
          <a href="/" className="text-primary hover:underline">
            Go back to services
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <RestaurantLayout branchId={payloadData.branch.id} />
      <AiChatAssistant
        serviceId={restaurantServiceId}
        branchId={payloadData.branch.id}
        serviceType="restaurant"
      />
    </>
  );
}