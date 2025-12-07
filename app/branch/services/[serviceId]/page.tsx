"use client";
import { ServicesGrid } from "@/components/services-grid";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Service } from "@/lib/types/interfaces";
import { useDecodePayloadQuery } from "@/lib/api/lodging";

// Transform decoded services to match ServicesGrid's expected format
function transformServices(decodedServices: any[]): Service[] {
  return decodedServices.map((service) => ({
    id: service.id,
    name: service.name,
    title: service.name,
    description: `Explore our ${service.name.toLowerCase()} service`,
    available: true,
    slug: service.id.toLowerCase(),
    type: service.serviceType,
    service_type: service.serviceType,
    icon: undefined,
    image: service.image,
  }));
}

export default function ServicePage() {
  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";

  const { data: payloadData, error } = useDecodePayloadQuery(payload);

  const [transformedServices, setTransformedServices] = useState<Service[]>([]);

  useEffect(() => {
    if (payloadData) {
      setTransformedServices(transformServices(payloadData.services));
    }
  }, [payloadData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/ihakkenlogo.jpg"
                  alt="ihakken Logo"
                  className="w-10 h-10 object-cover"
                />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                ihakken Services
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-6xl mx-auto">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">
              {error && "status" in error && error.status
                ? `Error ${error.status}: ${JSON.stringify(error.data)}`
                : error && "message" in error
                ? error.message
                : "An unknown error occurred"}
            </span>
          </div>
        )}

        {payloadData ? (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800">
                {payloadData.branch.name}
              </h1>
              <p className="text-lg text-gray-600 mt-2">Our Services</p>
            </div>

            {/* Use ServicesGrid component here */}
            <ServicesGrid
              services={transformedServices}
              branchId={payloadData.branch.id}
              hideLinks={false}
            />
          </div>
        ) : (
          !error && (
            <div className="text-center py-10">
              <p className="text-gray-500">Decoding payload...</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
