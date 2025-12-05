import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageValue } from '@/lib/types/interfaces';

interface ImageDisplayProps {
  images: ImageValue[];
  alt?: string;
  height?: string;
  className?: string;
  baseUrl?: string;
}

export default function ImageDisplay({
  images,
  alt = "Image",
  height = "h-48",
  className = "",
  baseUrl =  "https://api.dev.ihakken.com",
}: ImageDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center ${height} bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-400 text-sm">No images available</p>
      </div>
    );
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getImageUrl = (image: ImageValue) => {
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    // Handle backend image object
    const imagePath = image.image || (image as any).url || '';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${baseUrl}${imagePath}`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Image Container */}
      <div className={`relative ${height} overflow-hidden rounded-lg group`}>
        <img
          src={getImageUrl(images[currentIndex])}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white w-6 h-6 rounded flex items-center justify-center"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white w-6 h-6 rounded flex items-center justify-center"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Dots Navigation - only show if more than 1 image */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-gray-300 w-2 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}