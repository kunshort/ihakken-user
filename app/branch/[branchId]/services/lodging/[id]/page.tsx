"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { skipToken } from "@reduxjs/toolkit/query/react";
import AccommodationDetailsClient from "./accommodation-details-client";
import { Accommodation } from "@/lib/types/interfaces";
import {
  useGetAccommodationsQuery,
  useDecodePayloadQuery,
  lodgingApi,
} from "@/lib/api/lodging";

// Define proper types for the API response structure
interface Floor {
  accommodations?: Accommodation[];
}

interface AccommodationsResponse {
  data?: Floor[];
}

export default function AccommodationDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const branchId = params.branchId as string;
  const payload = searchParams.get("payload") || "";

  // Decode payload to get serviceId
  const { data: decoded, isLoading: payloadLoading } =
    useDecodePayloadQuery(payload);

  // Store auth data in localStorage
  useEffect(() => {
    if (!decoded) return;
    if (decoded.token) localStorage.setItem("auth_token", decoded.token);
    if ((decoded as any).device_fingerprint)
      localStorage.setItem(
        "device_fingerprint",
        (decoded as any).device_fingerprint
      );
  }, [decoded]);

  // Extract serviceId from decoded payload
  const serviceId = decoded?.services.find(
    (s: any) => s.serviceType?.toLowerCase() === "lodging"
  )?.id;

  // Fetch accommodations using serviceId
  const {
    data: accommodationsData,
    isLoading,
    error,
  } = useGetAccommodationsQuery(serviceId ? serviceId : skipToken);

  // Create memoized selector for the specific accommodation
  const selectAccommodationById = useMemo(
    () =>
      createSelector(
        [lodgingApi.endpoints.getAccommodations.select(serviceId || skipToken)],
        (result) => {
          const data = result?.data as
            | AccommodationsResponse
            | Accommodation[]
            | undefined;

          if (!data) return undefined;

          // Handle array response
          if (Array.isArray(data)) {
            return data.find((acc: Accommodation) => acc.id === id);
          }

          // Handle nested response with floors
          if ("data" in data && Array.isArray(data.data)) {
            for (const floor of data.data) {
              const found = floor.accommodations?.find(
                (acc: Accommodation) => acc.id === id
              );
              if (found) return found;
            }
          }

          return undefined;
        }
      ),
    [id, serviceId]
  );

  // Get the accommodation from cache using selector
  const accommodation = useSelector(selectAccommodationById);

  // Loading state
  if (payloadLoading || (!serviceId && !payloadLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading accommodation details...
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading accommodation details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !accommodation) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto text-center pt-20">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Accommodation not found</h1>
          <p className="text-muted-foreground mb-6">
            {error
              ? "Unable to load accommodation details. Please try again."
              : "The accommodation you are looking for does not exist or has been removed."}
          </p>
          {error && (
            <p className="text-sm text-muted-foreground mb-6">
              {error.toString()}
            </p>
          )}
          <a
            href={`/branch/services/${serviceId}${
              payload ? `?payload=${payload}` : ""
            }`}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Accommodations
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AccommodationDetailsClient
        accommodation={accommodation}
        branchId={branchId}
        selectedImageDefault={
          accommodation.mainImage?.[0]?.url || "/placeholder.svg"
        }
      />
    </div>
  );
}
