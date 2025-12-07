import Image from 'next/image';
import { useState } from 'react';

const GalleryComponent = ({ images, getImageUrl }: { images: any[]; getImageUrl: (url?: string) => string }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="mb-8">
      <h2 className="text-2xl mb-4 text-foreground">Gallery</h2>
      
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {images && images.length > 0 ? (
          images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedImage(getImageUrl(img.url))}
              className="relative overflow-hidden rounded border-2 border-transparent hover:border-teal-600 transition-all w-full h-24"
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

      {/* Just the image - same size as modal */}
      {selectedImage && (
        <div 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-3xl w-full h-96"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full rounded-lg overflow-hidden border bg-white shadow-lg">
            <Image
              src={selectedImage}
              alt="Selected Image"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryComponent;