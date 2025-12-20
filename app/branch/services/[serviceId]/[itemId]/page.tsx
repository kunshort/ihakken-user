// "use client";

// import { Header } from "@/components/header";
// import { Footer } from "@/components/footer";
// import { useParams, useSearchParams } from "next/navigation";
// import { useEffect } from "react";
// import AccommodationDetailsClient from "@/app/branch/[branchId]/services/lodging/[id]/accommodation-details-client";
// import {
//   useGetAccommodationByIdQuery,
//   useDecodePayloadQuery,
// } from "@/lib/api/lodging";
// import { Accommodation } from "@/lib/types/interfaces";

// export default function ItemDetailsPage() {
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const serviceId = params.serviceId as string;
//   const itemId = params.itemId as string;
//   const payload = searchParams.get("payload") || "";

//   const { data: decoded, isLoading: payloadLoading } =
//     useDecodePayloadQuery(payload);

//   useEffect(() => {
//     if (!decoded) return;
//     if (decoded.token) localStorage.setItem("auth_token", decoded.token);
//     if ((decoded as any).device_fingerprint)
//       localStorage.setItem(
//         "device_fingerprint",
//         (decoded as any).device_fingerprint
//       );
//   }, [decoded]);

//   const branchId = decoded?.branch?.id || "";

//   const {
//     data: accommodation,
//     isLoading,
//     error,
//   } = useGetAccommodationByIdQuery(
//     branchId && itemId
//       ? { branchId, accommodationId: itemId }
//       : { branchId: "", accommodationId: "" },
//     {
//       skip: !branchId || !itemId,
//     }
//   );

//   if (payloadLoading || (!branchId && !payloadLoading)) {
//     return (
//       <main className="min-h-screen bg-linear-to-br from-white via-green-50 to-white">
//         <Header />
//         <div className="max-w-4xl mx-auto px-4 py-12 text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//           <p className="text-muted-foreground ">
//             Loading accommodation details...
//           </p>
//         </div>
//         <Footer />
//       </main>
//     );
//   }

//   if (isLoading) {
//     return (
//       <main className="min-h-screen bg-linear-to-br from-white via-green-50 to-white">
//         <Header />
//         <div className="max-w-4xl mx-auto px-4 py-12 text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//           <p className="text-muted-foreground">
//             Loading accommodation details...
//           </p>
//         </div>
//         <Footer />
//       </main>
//     );
//   }

//   if (error || !accommodation) {
//     return (
//       <main className="min-h-screen bg-linear-to-br from-white via-green-50 to-white">
//         <Header />
//         <div className="max-w-4xl mx-auto px-4 py-12 text-center">
//           <p className="text-destructive">
//             Failed to load accommodation details.
//           </p>
//         </div>
//         <Footer />
//       </main>
//     );
//   }

//   if (serviceId === "lodging") {
//     return (
//       <main className="min-h-screen bg-linear-to-br from-white via-green-50 to-white">
//         <Header />
//         <AccommodationDetailsClient
//           accommodation={accommodation}
//           branchId={branchId}
//           selectedImageDefault={
//             accommodation.mainImage?.[0]?.url || "/placeholder.svg"
//           }
//         />
//         <Footer />
//       </main>
//     );
//   }
//   return (
//     <main className="min-h-screen">
//       <Header />
//       <div className="max-w-4xl mx-auto px-4 py-12 text-center">
//         <p className="text-muted-foreground">Service details page</p>
//       </div>
//       <Footer />
//     </main>
//   );
// }
