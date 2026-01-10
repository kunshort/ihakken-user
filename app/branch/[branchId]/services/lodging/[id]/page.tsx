"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { skipToken } from "@reduxjs/toolkit/query/react";
import AccommodationDetailsClient from "./accommodation-details-client";
import { Accommodation } from "@/lib/types/interfaces";
import {
  useGetAccommodationsQuery,
  lodgingApi,
} from "@/lib/api/lodging";
import { usePayload } from "@/hooks/usePayload";

// Define proper types for the API response structure
interface Floor {
  accommodations?: Accommodation[];
}

interface AccommodationsResponse {
  data?: Floor[];
}

export default function AccommodationDetailsPage() {
  const params = useParams();
  const { payload: decoded, isLoading: payloadLoading } = usePayload();

  const id = params.id as string;
  const branchId = params.branchId as string;
  
  useEffect(() => {
    if (!decoded) return;
    if (decoded.token) localStorage.setItem("auth_token", decoded.token);
    if ((decoded as any).device_fingerprint)
      localStorage.setItem(
        "device_fingerprint",
        (decoded as any).device_fingerprint
      );
  }, [decoded]);

   // Check specific service object first (Service Scan), then fall back to list (Branch Scan)
  const serviceId = decoded?.service?.type?.toLowerCase() === "lodging"
    ? decoded.service.id
    : decoded?.services?.find(
        (s: any) => s.serviceType?.toLowerCase() === "lodging"
      )?.id;


  const {
    data: accommodationsData,
    isLoading: isLoadingAccommodations,
    error,
    refetch: refetchAccommodations,
  } = useGetAccommodationsQuery(serviceId ? serviceId : skipToken);

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
          if (Array.isArray(data)) {
            return data.find((acc: Accommodation) => acc.id === id);
          }
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

  const accommodation = useSelector(selectAccommodationById);

  const handleRetry = () => {
    refetchAccommodations();
  };

  return (
    <div className="min-h-screen bg-background">
      <AccommodationDetailsClient
        accommodation={accommodation}
        branchId={branchId}
        selectedImageDefault={
          accommodation?.mainImage?.[0]?.url || "/placeholder.svg"
        }
        isLoading={isLoadingAccommodations || payloadLoading}
        error={error}
        serviceId={serviceId}
        handleRetry={handleRetry}
      />
    </div>
  );
}
