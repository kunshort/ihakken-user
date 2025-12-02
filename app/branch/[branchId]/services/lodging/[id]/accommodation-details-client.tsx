"use client";

import { CallServiceModal } from "@/components/lodging/service-call-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useSearchParams } from "next/navigation";
import { useState } from "react";

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
  // If URL already starts with http/https, return as is
  if (url.startsWith("http")) return url;
  // Otherwise prepend the API base URL
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
  const branchId = decodedPayload?.branch?.id || "";

  const backHref = `/branch/${branchId}/services/lodging${payload ? `?payload=${payload}` : ""
    }`;

  return (
    <>
      {/* Header with Background Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src={selectedImage || "/placeholder.svg"}
          alt={accommodation.typeName}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/30 to-black/50" />

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
        <div className="absolute bottom-4 left-4 text-white">
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
          <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg">
            Book Now
          </Button>
        </div>

        {/* Accommodation Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Room Size</p>
              <p className="font-semibold text-lg">
                {accommodation.roomSize
                  ? `${accommodation.roomSize} sqm`
                  : "N/A"}
              </p>
            </CardContent>
          </Card>
          <Card className="p-2">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Max Guests</p>
              <p className="font-semibold text-lg">
                {accommodation.maxGuests || "N/A"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Bed Configuration
              </p>
              <p className="font-semibold text-lg">
                {accommodation.bedConfiguration || "N/A"}
              </p>
            </CardContent>
          </Card>
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

        {/* Gallery */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Gallery
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {accommodation.mainImage && accommodation.mainImage.length > 0 ? (
              accommodation.mainImage.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(getImageUrl(img.url))}
                  className="relative overflow-hidden rounded-lg border-2 border-transparent hover:border-teal-600 transition-all w-full h-24"
                >
                  <Image
                    src={getImageUrl(img.url) || "/placeholder.svg"}
                    alt={`Gallery ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No images available
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 text-center mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Ready to Book?
          </h3>
          <p className="text-muted-foreground mb-4">
            Secure your stay today and enjoy a wonderful experience
          </p>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2">
            Reserve Now
          </Button>
        </div>
        <div className="text-center mb-8">
          <Button
            variant="outline"
            onClick={() => setCallModalOpen(true)}
            className="flex items-center gap-2 border-teal-600 text-teal-600 hover:bg-teal-50 mx-auto"
          >
            <Phone className="w-4 h-4" />
            Call Service
          </Button>
        </div>
      </div>

      <CallServiceModal open={callModalOpen} onOpenChange={setCallModalOpen} />
    </>
  );
}
