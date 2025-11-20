"use client";

import { Search, Filter, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AccommodationGrid } from "./accommodation-grid";
import { useGetAccommodationsQuery } from "@/lib/api/lodging";

interface LodgingLayoutProps {
  branchId: string;
}

export function LodgingLayout({ branchId }: LodgingLayoutProps) {
  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: accommodations = [],
    isLoading: loading,
    error,
  } = useGetAccommodationsQuery(branchId);

  // Debug: Log the raw data
  console.log("Raw accommodations data:", accommodations);
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

  const backLink = `/branch/${branchId}/services${
    payload ? `?payload=${payload}` : ""
  }`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading accommodations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-2">
            Error loading accommodations
          </p>
          <p className="text-sm text-muted-foreground">{error.toString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />

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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p className="text-xs">Debug Info:</p>
          <p className="text-xs">
            Total accommodations: {accommodations?.length || 0}
          </p>
          <p className="text-xs">
            Filtered: {filteredAccommodations?.length || 0}
          </p>
          <p className="text-xs">Search query: "{searchQuery}"</p>
        </div>

        {filteredAccommodations.length > 0 ? (
          <AccommodationGrid accommodations={filteredAccommodations} />
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No accommodations found</p>
            {accommodations.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Try clearing your search filter
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
