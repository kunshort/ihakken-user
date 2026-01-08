"use client";

import { CallServiceModal } from "@/components/lodging/service-call-modal";
import ErrorComponent from "@/components/shared/errorComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStaffUnits } from "@/hooks/useStaffUnits";
import { usePayload } from "@/hooks/usePayload";
import {
  useGetAccommodationsQuery,
} from "@/lib/api/lodging";
import { Accommodation } from "@/lib/types/interfaces";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { ChevronLeft, Phone, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EmptyContent from "../shared/noContent";
import { AccommodationGrid } from "./accommodation-grid";
import { LoadingSpinner } from "../shared/loading";

interface LodgingLayoutProps {
  branchId: string;
}

export function LodgingLayout({ branchId }: LodgingLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);

  const { payload: decoded, isLoading: payloadLoading } = usePayload();

  useEffect(() => {
    if (!decoded) return;
    if (decoded.token) localStorage.setItem("auth_token", decoded.token);
    if ((decoded as any).device_fingerprint)
      localStorage.setItem(
        "device_fingerprint",
        (decoded as any).device_fingerprint
      );
  }, [decoded]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const serviceId = decoded?.services.find(
    (s: any) => s.serviceType?.toLowerCase() === "lodging"
  )?.id;

  const {
    data: accommodationsData,
    isLoading: isLoadingAccommodations,
    error: accommodationsError,
    refetch: refetchAccommodations,
  } = useGetAccommodationsQuery(serviceId || skipToken);

  // Always call the hook, but pass serviceId (could be undefined)
  const {
    services: staffUnits,
    isLoading: isLoadingStaffUnits,
    error: staffUnitsError,
    hasServices: hasStaffUnits,
  } = useStaffUnits(serviceId);

  const accommodationsRaw: Accommodation[] = accommodationsData || [];

  const filteredAccommodations = useMemo(() => {
    if (!searchQuery) return accommodationsRaw;

    return accommodationsRaw.filter((accommodation) => {
      const name = accommodation.typeName || "";
      const description = accommodation.description || "";
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [accommodationsRaw, searchQuery]);

  const [isRetrying, setIsRetrying] = useState(false);
  const handleRetry = () => {
    refetchAccommodations();
  };

  // Check if there are no accommodations (empty state)
  // Check if there are staff units to show call icon
  const shouldShowCallIcon = useMemo(() => {
    return staffUnits && staffUnits.length > 0;
  }, [staffUnits]);

  if (payloadLoading || (!serviceId && !payloadLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading accommodations...</p>
      </div>
    );
  }

  const hasNoAccommodations =
    !isLoadingAccommodations &&
    accommodationsRaw.length === 0 &&
    !accommodationsError;

  // Check if search returned no results
  const hasNoSearchResults = searchQuery && filteredAccommodations.length === 0;

  const backLink = `/branch/services/${serviceId}`;

  return (
    <div className="min-h-screen bg-background">
      {/* DYNAMIC STICKY HEADER - Always visible */}
      <div className="sticky top-0 z-20 bg-card shadow-sm">
        {/* TOP BANNER (Alternating Height) */}
        <div
          className={`relative bg-gradient-to-r from-primary to-primary/80 overflow-hidden transition-all duration-300 ease-in-out ${
            isScrolled ? "h-16" : "h-48 md:h-64"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center p-4">
            <div className="flex w-full items-center gap-4">
              <Link href={backLink}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 hover:bg-white/30 shrink-0"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </Button>
              </Link>

              <h1
                className={`font-bold text-white transition-all duration-300 ease-in-out ${
                  isScrolled ? "text-xl" : "text-2xl md:text-3xl"
                }`}
              >
                {payloadLoading || (!serviceId && !payloadLoading)
                  ? "Loading..."
                  : "Our Accommodations"}
              </h1>
            </div>
          </div>
        </div>

        {/* SEARCH BAR - Always visible */}
        <div className="border-b border-border bg-card px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search accommodations..."
                className="pl-10 bg-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={payloadLoading || (!serviceId && !payloadLoading)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* LOADING STATE - Accommodations */}
        {(payloadLoading || isLoadingAccommodations) && (
          <LoadingSpinner message="Loading accommodations..." />
        )}

        {/* ERROR STATE */}
        {serviceId && accommodationsError && !isLoadingAccommodations && (
          <div className="flex justify-center items-center w-full">
            <ErrorComponent
              errorMessage="Failed to load accommodations."
              handleRetry={handleRetry}
              isRetrying={isLoadingAccommodations}
            />
          </div>
        )}

        {/* EMPTY STATE - No accommodations */}
        {serviceId && hasNoAccommodations && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <EmptyContent
              message="No Accommodations Available"
              description="This lodging service hasn't added any accommodations yet. Please check back later."
              actionLabel="Go Back"
              actionHref={backLink}
            />
          </div>
        )}

        {/* EMPTY STATE - No search results */}
        {serviceId && hasNoSearchResults && !hasNoAccommodations && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <EmptyContent
              message="No Results Found"
              description={`No accommodations match "${searchQuery}". Try a different search term.`}
              actionLabel="Clear Search"
              onAction={() => setSearchQuery("")}
            />
          </div>
        )}

        {/* ACCOMMODATIONS GRID */}
        {serviceId &&
          !isLoadingAccommodations &&
          !accommodationsError &&
          !hasNoAccommodations &&
          !hasNoSearchResults && (
            <AccommodationGrid
              accommodations={filteredAccommodations}
              branchId={branchId}
            />
          )}
      </div>
      {/* Conditionally show call icon only if there are staff units */}
      {shouldShowCallIcon && !isLoadingStaffUnits && (
        <div className="fixed bottom-6 left-6 z-50">
          <Button
            onClick={() => setCallModalOpen(true)}
            className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white shadow-lg rounded-full w-14 h-14"
            title="Call Staff"
          >
            <Phone className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Only show modal if there are staff units */}
      {shouldShowCallIcon && (
        <CallServiceModal
          open={callModalOpen}
          onOpenChange={setCallModalOpen}
          branchServiceId={serviceId}
          userInfo={{
            userId: decoded?.user_id || `user-${Date.now()}`,
            userName: decoded?.user_name || "User",
          }}
        />
      )}
    </div>
  );
}

export default LodgingLayout;
