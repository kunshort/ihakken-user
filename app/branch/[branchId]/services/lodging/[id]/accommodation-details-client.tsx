"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDecodedPayload } from "@/hooks/useDecodedPayload";
import { BASE_API_URL } from "@/lib/api/base";
import { Accommodation } from "@/lib/types/interfaces";
import {
  ChevronLeft,
  Coffee,
  Dumbbell,
  Phone,
  Users,
  Wifi,
  Wind,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CallServiceModal } from "@/components/lodging/service-call-modal";
import InfoCard from "@/components/lodging/inforCard";
import ImageDisplay from "@/components/shared/imageDisplay";
import ImageGalleryModal from "@/components/shared/imageGallery";

interface AccommodationDetailsClientProps {
  accommodation: Accommodation;
  branchId: string;
  selectedImageDefault: string;
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-5 h-5" />,
  AC: <Wind className="w-5 h-5" />,
  Breakfast: <Coffee className="w-5 h-5" />,
  Spa: <Dumbbell className="w-5 h-5" />,
  Concierge: <Users className="w-5 h-5" />,
};

const getImageUrl = (url?: string): string => {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http")) return url;
  return BASE_API_URL + url;
};

export default function AccommodationDetailsClient({
  accommodation,
  selectedImageDefault,
}: AccommodationDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(
    getImageUrl(selectedImageDefault)
  );
  const [callModalOpen, setCallModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";
  const { data: decodedPayload } = useDecodedPayload(payload);
  
  const serviceId = decodedPayload?.services.find(
    (s: any) => s.service_type.toLowerCase() === "lodging"
  )?.id;

  const backHref = `/branch/services/${serviceId}${
    payload ? `?payload=${payload}` : ""
  }`;

  // Convert accommodation images to ImageDisplay format
  const headerImages = accommodation.mainImage && accommodation.mainImage.length > 0
    ? accommodation.mainImage.map(img => ({
        id: img.id,
        url: img.url,
        image: img.url,
      }))
    : [];

  return (
    <>
      {/* Header with Background Image Carousel */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {headerImages.length > 0 ? (
          <div className="relative w-full h-full">
            <ImageDisplay
              images={headerImages}
              alt={accommodation.typeName}
              height="h-full"
              className="w-full"
              baseUrl={BASE_API_URL}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50 pointer-events-none" />
          </div>
        ) : (
          <>
            <Image
              src="/placeholder.svg"
              alt={accommodation.typeName}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
          </>
        )}

        {/* Back Button */}
        <Link href={backHref} className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-balance">
            {accommodation.typeName}
          </h1>
          <p className="text-sm md:text-base text-white/90 mt-1">
            {accommodation.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Price and Booking */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Price per night
            </p>
            <p className="text-3xl font-bold text-teal-600">
              ${parseFloat(accommodation.pricePerNight || "0").toFixed(2)}
            </p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 mt-4">
            Reserve Now
          </Button>
        </div>

        {/* Accommodation Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <InfoCard
            label="Room Size"
            value={
              accommodation.roomSize ? `${accommodation.roomSize} sqm` : "N/A"
            }
          />
          <InfoCard
            className="p-2"
            label="Max Guests"
            value={accommodation.maxGuests}
          />
          <InfoCard
            label="Bed Configuration"
            value={accommodation.bedConfiguration}
          />
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-foreground">
            About This Accommodation
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {accommodation.description || "No description available"}
          </p>
        </div>

        {/* Amenities */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Amenities & Services
          </h2>
          <div className="flex flex-wrap gap-3">
            {accommodation.amenities && accommodation.amenities.length > 0 ? (
              accommodation.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-lg border border-teal-200"
                >
                  {amenityIcons[amenity.name] || null}
                  <span className="font-medium">{amenity.name}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No amenities listed</p>
            )}
          </div>
        </div>

        {/* Gallery Thumbnails */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Gallery
          </h2>
          {accommodation.mainImage && accommodation.mainImage.length > 0 ? (
            <ImageGalleryModal
              images={accommodation.mainImage}
              getUrl={getImageUrl}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No images available
            </div>
          )}
        </div>
      </div>
    </>
  );
}