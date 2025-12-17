
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import RestaurantLayout from "@/components/restaurant/layout";
import { AiChatAssistant } from "@/components/shared/AiChatAssistant";

interface DecodedPayload {
  branch: {
    id: string;
    name: string;
    description?: string;
  };
  services: Array<{
    id: string;
    name: string;
    serviceType: string;
  }>;
}

function decodePayload(payload: string): DecodedPayload | null {
  try {
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("Failed to decode payload:", e);
    return null;
  }
}

export default function RestaurantPage() {
  const searchParams = useSearchParams();
  const [payloadData, setPayloadData] = useState<DecodedPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const payload = searchParams.get("payload");
    if (!payload) setIsLoading(false); // Ensure loading stops if no payload

    if (payload) {
      const data = decodePayload(payload);
      if (data) {
        setPayloadData(data);
        setError(null);
      } else {
        setError("Failed to decode payload. Please try again.");
      }
    } else {
      setError("No payload found. Please select a service.");
    }
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !payloadData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Unable to load restaurant"}</p>
          <a
            href="/"
            className="text-primary hover:underline"
          >
            Go back to services
          </a>
        </div>
      </div>
    );
  }

  const payload = searchParams.get("payload") || "";

  // Extract the restaurant service id from the decoded payload
  const restaurantServiceId = payloadData?.services?.find(
    (s) => s.serviceType?.toLowerCase() === "restaurant"
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
        payload={payload}
        serviceType="restaurant"
      />
    </>
  );
}