// layout.tsx updates
"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useGetAccommodationsQuery,
  useGetLodgingCategoriesQuery,
} from "@/lib/api/lodging";
import { useSearchParams } from "next/navigation";
import { useDecodePayloadQuery } from "@/lib/api/lodging";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Accommodation } from "@/lib/types/interfaces";
import EmptyContent from "../shared/noContent";
import ErrorComponent from "../shared/errorComponent";
import { AccommodationGrid } from "./accommodation-grid";
import { LoadingSpinner } from "../shared/loading";

interface LodgingLayoutProps {
  branchId: string;
}

export function LodgingLayout({ branchId }: LodgingLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";

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

  // Effect to detect scroll position
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

  // Fetch accommodations
  const {
    data: accommodationsData,
    isLoading: isLoadingAccommodations,
    error: accommodationsError,
    refetch: refetchAccommodations,
  } = useGetAccommodationsQuery(serviceId || skipToken);
  



  const accommodationsRaw: Accommodation[] = accommodationsData || [];

  // Filter accommodations for search
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

  // Handle retry for errors
  const handleRetry = () => {
    refetchAccommodations();
  };

  // Check if there are no accommodations (empty state)
  const hasNoAccommodations =
    !isLoadingAccommodations &&
    accommodationsRaw.length === 0 &&
    !accommodationsError;

  // Check if search returned no results
  const hasNoSearchResults = searchQuery && filteredAccommodations.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* DYNAMIC STICKY HEADER - Always visible */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        {/* TOP BANNER (Alternating Height) */}
        <div
          className={`relative bg-linear-to-r from-[#004248] to-[#006666] overflow-hidden transition-all duration-300 ease-in-out ${
            isScrolled ? "h-16" : "h-48 md:h-64"
          }`}
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center p-4">
            <div className="flex w-full items-center gap-4">
              <Link
                href={`/branch/services/${serviceId}${
                  payload ? `?payload=${payload}` : ""
                }`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 hover:bg-white/30 flex-shrink-0"
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
        <div className="border-b border-border px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search accommodations..."
                className="pl-10"
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
        {(payloadLoading || isLoadingAccommodations)  && (
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
              actionHref={`/branch/services/${serviceId}${
                payload ? `?payload=${payload}` : ""
              }`}
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
    </div>
  );
}

export default LodgingLayout;