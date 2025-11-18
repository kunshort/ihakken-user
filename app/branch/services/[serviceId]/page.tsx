"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// It's good practice to define the shape of your data.
interface Service {
  id: string;
  name: string;
  service_type: string;
}

interface DecodedPayload {
  branch: {
    id: string;
    name: string;
  };
  services: Service[];
  // Add other properties from your payload as needed
}

function decodePayload(payload: string): DecodedPayload | null {
  // The user's output shows "Manual URL-safe" was the successful method.
  // We can prioritize that, but keep others as fallbacks.
  try {
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("Failed to decode payload:", e);
    // You could try other decoding methods here if necessary.
    return null;
  }
}

export default function ServicePage() {
  const searchParams = useSearchParams();
  const [payloadData, setPayloadData] = useState<DecodedPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const payload = searchParams.get("payload");

    if (payload) {
      const data = decodePayload(payload);
      if (data) {
        setPayloadData(data);
      } else {
        setError("Failed to decode payload. Check console for details.");
      }
    } else {
      setError("No payload found in URL.");
    }
  }, [searchParams]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {payloadData ? (
        <div>
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              {payloadData.branch.name}
            </h1>
            <p className="text-lg text-gray-500">Our Services</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {payloadData.services.map((service) => (
              <div
                key={service.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h2 className="text-2xl font-semibold text-gray-900">
                  {service.name}
                </h2>
                <p className="text-gray-600 mt-2 capitalize">
                  Type: {service.service_type.replace("_", " ")}
                </p>
              </div>
            ))}
          </div>

          {/* You can keep a debug section if you need it during development */}
          <details className="mt-8 bg-gray-50 p-4 rounded">
            <summary className="font-mono text-sm cursor-pointer">
              Show Debug Info
            </summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(payloadData, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        !error && (
          <div className="text-center py-10">
            <p className="text-gray-500">Decoding payload...</p>
          </div>
        )
      )}
    </div>
  );
}
