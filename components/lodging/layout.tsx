"use client";

import { CallServiceModal } from "@/components/lodging/service-call-modal";
import ErrorComponent from "@/components/shared/errorComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDecodedPayload } from "@/hooks/useDecodedPayload";
import { Accommodation } from "@/lib/types/interfaces";
import { ChevronLeft, Filter, Phone, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { AccommodationGrid } from "./accommodation-grid";
import {
  useGetAccommodationsQuery,
  useDecodePayloadQuery,
} from "@/lib/api/lodging";

interface LodgingLayoutProps {
  branchId: string;
}

export function LodgingLayout({ branchId }: LodgingLayoutProps) {
  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [callModalOpen, setCallModalOpen] = useState(false);

  const { data: decoded, isLoading: payloadLoading } =
    useDecodePayloadQuery(payload);

  useEffect(() => {
    if (!decoded) return;
    if (decoded.token) localStorage.setItem("auth_token", decoded.token);
    if ((decoded as any).device_fingerprint)
      localStorage.setItem(
        "device_fingerprint",
        (decoded as any).device_fingerprint
      );
  }, [decoded]);

  const serviceId = useMemo(() => {
    return decoded?.services.find(
      (s: any) => s.serviceType?.toLowerCase() === "lodging"
    )?.id;
  }, [decoded?.services]);

  const {
    data: accommodationsData = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetAccommodationsQuery(serviceId, { skip: !serviceId || !decoded });

  // Normalize accommodations to ensure they all have the required properties
  const accommodations: Accommodation[] = Array.isArray(accommodationsData)
    ? accommodationsData.map((acc: any) => ({
      ...acc,
      category: acc.category || "",
      currency: acc.currency || "USD",
    }))
    : [];

  console.log("Raw accommodations data:", accommodationsData);
  console.log("Normalized accommodations:", accommodations);
  console.log("Is array?", Array.isArray(accommodations));
  console.log("Length:", accommodations?.length);


  const filteredAccommodations = accommodations.filter(
    (accommodation) =>
      accommodation.typeName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      accommodation.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  console.log("Filtered accommodations:", filteredAccommodations);

  const backLink = `/branch/services/${serviceId}${payload ? `?payload=${payload}` : ""
    }`;

  // Handle retry
  const [isRetrying, setIsRetrying] = useState(false);
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
    } finally {
      setIsRetrying(false);
    }
  };

  // Get error message
  const getErrorMessage = () => {
    if (!error) return "";

    if (typeof error === "string") return error;

    if ("status" in error) {
      if (error.status === "FETCH_ERROR") {
        return "Unable to connect to the server. Please check your internet connection.";
      }
      if (error.status === 404) {
        return "Accommodations not found.";
      }
      if (error.status === 500) {
        return "Server error. Please try again later.";
      }
      return `Error: ${error.status}`;
    }

    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }

    return "Failed to load accommodations. Please try again.";
  };

  if (payloadLoading || (!serviceId && !payloadLoading) || !decoded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img
          src="/luxury-hotel-lobby.jpg"
          alt="Serenity Hub Lodging"
          className="w-full h-full object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = `/placeholder.svg?height=256&width=1200&query=luxury hotel lobby`;
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/20 to-black/40" />

        <Link href={backLink} className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/20 hover:bg-white/30 text-white rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>

        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-3xl md:text-4xl font-bold">
            Your Serene Lodging
          </h1>
          <p className="text-sm md:text-base text-white/90">
            Find your perfect accommodation
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search accommodations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading accommodations...</p>
            </div>
          </div>
        ) : error ? (
          <ErrorComponent
            errorMessage={getErrorMessage()}
            handleRetry={handleRetry}
            isRetrying={isRetrying}
          />
        ) : filteredAccommodations.length > 0 ? (
          <AccommodationGrid accommodations={filteredAccommodations} />
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No accommodations found
              </h3>
              {searchQuery ? (
                <p className="text-sm text-muted-foreground">
                  No results match "{searchQuery}". Try adjusting your search.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  There are no accommodations available at the moment.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setCallModalOpen(true)}
          className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white shadow-lg rounded-full w-14 h-14"
          title={!serviceId ? "Staff services not available" : "Call Staff"}
        >
          <Phone className="w-5 h-5" />
        </Button>
      </div>

      <CallServiceModal
        open={callModalOpen}
        onOpenChange={setCallModalOpen}
        branchServiceId={serviceId}
        userInfo={{
          userId: decoded?.user_id || `user-${Date.now()}`,
          userName: decoded?.user_name || "User"
        }}
      />
    </div>
  );
}
