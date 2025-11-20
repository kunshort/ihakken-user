"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Service } from "@/lib/types/interfaces";

interface ServicesGridProps {
  services: Service[];
  branchId: string;
  hideLinks?: boolean;
}

export function ServicesGrid({
  services,
  branchId,
  hideLinks = false,
}: ServicesGridProps) {
  const searchParams = useSearchParams();
  const payload = searchParams.get("payload") || "";

  // Function to generate the correct route based on service type
  const getServiceRoute = (service: Service) => {
    const serviceType = service.service_type.toLowerCase();

    // FIXED: Use branchId in the route
    const routeMap: Record<string, string> = {
      restaurant: `/branch/${branchId}/services/restaurant`,
      lodging: `/branch/${branchId}/services/lodging`,  // ✅ Fixed: includes branchId
      // Add more service types as needed
    };

    const route = routeMap[serviceType] || `/branch/services/${service.id}`;

    // Append payload if it exists
    return payload ? `${route}?payload=${payload}` : route;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => {
        const CardWrapper = hideLinks ? "div" : Link;
        const cardProps = hideLinks ? {} : { href: getServiceRoute(service) };

        return (
          <CardWrapper key={service.id} {...cardProps}>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
              <div className="relative h-48 overflow-hidden bg-linear-to-br from-teal-500 to-teal-700">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-6xl text-white opacity-80">
                      {service.icon || "🏢"}
                    </span>
                  </div>
                )}

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-semibold text-teal-700 capitalize">
                    {service.service_type}
                  </span>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="font-bold text-xl text-foreground mb-2 group-hover:text-teal-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>

                {service.available ? (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">
                      Available
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 font-medium">
                      Coming Soon
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardWrapper>
        );
      })}
    </div>
  );
}


