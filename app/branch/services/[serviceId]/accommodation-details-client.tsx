// "use client";

// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { ChevronLeft, MapPin, Wifi, AirVent, TrendingUp } from "lucide-react";
// import { useGetAccommodationByIdQuery } from "@/lib/api/lodging";
// import { useDecodedPayload } from "@/hooks/useDecodedPayload";
// import { useEffect } from "react";
// import { skipToken } from "@reduxjs/toolkit/query/react";

// // interface AccommodationDetailsClientProps {
// //   branchId: string;
// //   accommodationId: string;
// // }

// export default function AccommodationDetailsClient() {
//   const searchParams = useSearchParams();
//   const payload = searchParams.get("payload") || "";

//   const { data: decoded, loading: payloadLoading } = useDecodedPayload(payload);

//   useEffect(() => {
//     if (!decoded) return;
//     if (decoded.token) localStorage.setItem("auth_token", decoded.token);
//     if ((decoded as any).device_fingerprint)
//       localStorage.setItem(
//         "device_fingerprint",
//         (decoded as any).device_fingerprint
//       );
//   }, [decoded]);

//   const serviceId = decoded?.services.find(
//     (s: any) => s.service_type.toLowerCase() === "lodging"
//   )?.id;

//   const {
//     data: accommodation,
//     isLoading,
//     error,
//   } = useGetAccommodationByIdQuery(
//     serviceId 
//   );

//   if (payloadLoading || (!serviceId && !payloadLoading)) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-muted-foreground">Loading accommodation details...</p>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-muted-foreground">Loading accommodation details...</p>
//       </div>
//     );
//   }

//   if (error || !accommodation) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-destructive">Failed to load accommodation details.</p>
//       </div>
//     );
//   }

//   const getImageUrl = (url: string): string => {
//     if (!url) return `/placeholder.svg?height=400&width=800&query=accommodation`;
//     if (url.startsWith("http")) return url;
//     return `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`;
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="sticky top-0 z-10 bg-background border-b">
//         <div className="max-w-6xl mx-auto px-4 py-4">
//           <Link
//             href={`/branch/services/${serviceId}${
//               payload ? `?payload=${payload}` : ""
//             }`}
//             className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Back to Accommodations
//           </Link>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto px-4 py-8">
//         {/* Image Gallery */}
//         {accommodation.mainImage && accommodation.mainImage.length > 0 && (
//           <div className="mb-8 rounded-lg overflow-hidden">
//             <img
//               src={getImageUrl(accommodation.mainImage)}
//               alt={accommodation.typeName}
//               className="w-full h-96 object-cover"
//             />
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2">
//             <h1 className="text-3xl font-bold mb-2">
//               {accommodation.typeName}
//             </h1>
//             {/* <div className="flex items-center gap-2 text-muted-foreground mb-6">
//               <MapPin className="w-4 h-4" />
//               <span>{accommodation.location || "Location not specified"}</span>
//             </div> */}

//             <p className="text-muted-foreground mb-8">
//               {accommodation.description || "No description available"}
//             </p>

//             {accommodation.amenities && accommodation.amenities.length > 0 && (
//               <div>
//                 <h2 className="text-xl font-semibold mb-4">Amenities</h2>
//                 <div className="grid grid-cols-2 gap-4">
//                   {accommodation.amenities.map((amenity) => (
//                     <div
//                       key={amenity.id}
//                       className="flex items-center gap-2 p-3 rounded-lg bg-muted"
//                     >
//                       <Wifi className="w-4 h-4 text-primary" />
//                       <span className="text-sm">{amenity.name}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="lg:col-span-1">
//             <div className="sticky top-24 bg-card border rounded-lg p-6">
//               <div className="mb-6">
//                 <p className="text-3xl font-bold">
//                   ${accommodation.pricePerNight}
//                   <span className="text-sm text-muted-foreground font-normal">
//                     {" "}
//                     /night
//                   </span>
//                 </p>
//               </div>
//               <div className="space-y-3">
//                 <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
//                   Book Now
//                 </button>
//                 <button className="w-full border border-border py-3 rounded-lg font-medium hover:bg-muted transition-colors">
//                   Contact
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }