"use client";
import { ServicesGrid } from "@/components/services-grid";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Service } from "@/lib/types/interfaces";
import { useDecodePayloadQuery } from "@/lib/api/lodging";
import { MapPin, Clock, Sparkles } from "lucide-react";

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

  const { data: payloadData, error, isLoading } = useDecodePayloadQuery(payload);

  const [transformedServices, setTransformedServices] = useState<Service[]>([]);

  useEffect(() => {
    if (payloadData) {
      setTransformedServices(transformServices(payloadData.services));
    }
  }, [payloadData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Header bar */}
        <header className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="/ih-logo.svg"
                    alt="ih Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {payloadData ? (
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Welcome to
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                {payloadData.branch.name}
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl">
                Discover our premium services designed to make your experience exceptional
              </p>

              {/* Quick info badges */}
              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{transformedServices.length} Services Available</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Open Now</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/80">Loading branch information...</p>
            </div>
          )}
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {error && (
          <div
            className="bg-destructive/10 border border-destructive/30 text-destructive px-6 py-4 rounded-xl mb-8"
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

        {payloadData && transformedServices.length > 0 && (
          <div>
            {/* Section header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Our Services
                </h2>
              </div>
              <p className="text-muted-foreground ml-5">
                Choose from our range of services below
              </p>
            </div>

            {/* Services Grid */}
            <ServicesGrid
              services={transformedServices}
              branchId={payloadData.branch.id}
              hideLinks={false}
            />
          </div>
        )}

        {payloadData && transformedServices.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Services Available</h3>
            <p className="text-muted-foreground">Check back later for available services.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-card">
                <img
                  src="/ih-logo.svg"
                  alt="ih Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                Powered by ihakken
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
