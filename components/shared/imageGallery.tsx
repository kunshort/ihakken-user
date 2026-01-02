import Image from "next/image";
import { useState } from "react";

const GalleryComponent = ({
  images,
  getImageUrl,
}: {
  images: any[];
  getImageUrl: (url?: string) => string;
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="mb-8">
      <h2 className="text-xl mb-4 text-foreground">Gallery</h2>

      <div className="flex space-x-3 overflow-x-auto py-2 scrollbar-hide">
        {images && images.length > 0 ? (
          images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedImage(getImageUrl(img.url))}
              className="relative overflow-hidden rounded border-2 border-transparent hover:border-primary transition-all min-w-[100px] h-24"
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

      {selectedImage && (
        <div
          className="
            fixed inset-0 
            z-60 
            flex items-center justify-center
              bg-black/70
    backdrop-blur-sm
          "
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-3xl w-[90vw] max-h-screen  overflow-hidden shadow-lg  bg-dark-background bg-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full h-auto"
              style={{ aspectRatio: "16/9" }}
            >
              <Image
                src={selectedImage}
                alt="Selected Image"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryComponent;
