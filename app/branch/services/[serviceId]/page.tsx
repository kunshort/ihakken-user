"use client";
import { ServicesGrid } from "@/components/services-grid";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Service } from "@/lib/types/interfaces";

interface DecodedService {
  id: string;
  name: string;
  service_type: string;
}

interface DecodedPayload {
  branch: {
    id: string;
    name: string;
    description?: string;
  };
  services: DecodedService[];
}

function decodePayload(payload: string): DecodedPayload | null {
  try {
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("Failed to decode payload:", e);
    return null;
  }
}

// Transform decoded services to match ServicesGrid's expected format
function transformServices(decodedServices: DecodedService[]): Service[] {
  return decodedServices.map((service) => ({
    id: service.id,
    name: service.name,
    title: service.name,
    description: `Explore our ${service.name.toLowerCase()} service`,
    available: true,
    slug: service.id.toLowerCase(),
    type: service.service_type,
    service_type: service.service_type,
    icon: undefined,
    image: undefined,
  }));
}

export default function ServicePage() {
  const searchParams = useSearchParams();
  const [payloadData, setPayloadData] = useState<DecodedPayload | null>(null);
  const [transformedServices, setTransformedServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const payload = searchParams.get("payload");

    if (payload) {
      const data = decodePayload(payload);
      if (data) {
        setPayloadData(data);
        setTransformedServices(transformServices(data.services));
      } else {
        setError("Failed to decode payload. Check console for details.");
      }
    } else {
      setError("No payload found in URL.");
    }
  }, [searchParams]);

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
            <span className="block sm:inline">{error}</span>
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

        {/* Debug section */}
        <details className="mt-8 bg-gray-50 p-4 rounded">
          <summary className="font-mono text-sm cursor-pointer">
            Show Debug Info
          </summary>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify({ payloadData, transformedServices }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}