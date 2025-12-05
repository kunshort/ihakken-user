"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogOverlay,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface GalleryProps {
  images: { id: string | number; url: string }[];
  getUrl: (url: string) => string;
}

export default function ImageGalleryModal({ images, getUrl }: GalleryProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Thumbnails */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {images.map((img) => (
          <Dialog
            key={img.id}
            open={isOpen && activeImage === getUrl(img.url)}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) setActiveImage(null);
            }}
          >
            <DialogTrigger asChild>
              <button
                onClick={() => {
                  setActiveImage(getUrl(img.url));
                  setIsOpen(true);
                }}
                className="relative h-24 w-full overflow-hidden rounded-lg border-2 border-transparent hover:border-teal-600 transition-all"
              >
                <Image
                  src={getUrl(img.url)}
                  alt="Thumbnail"
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </button>
            </DialogTrigger>

            <DialogContent
              className="max-w-none w-screen h-screen p-0 border-0 bg-black/90 flex items-center justify-center"
              hideCloseButton
            >
              {/* Click anywhere to close */}
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => setIsOpen(false)}
              />

              {/* Image container */}
              <div
                className="relative w-[90%] max-w-6xl h-[90vh] z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {activeImage && (
                  <Image
                    src={activeImage}
                    alt="Large view"
                    fill
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </>
  );
}