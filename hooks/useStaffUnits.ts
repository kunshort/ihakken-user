// hooks/useStaffUnits.ts
import { useState, useEffect, useCallback } from "react";
import { staffUnitsAPI } from "@/lib/api/staff-units-api";
import { Service } from "@/lib/types/service-calls";
import {
  Users,
  Utensils,
  ShoppingCart,
  Wrench,
  Shield,
  Phone,
  Bell,
  Key,
  Sprout,
  Droplets,
  Heart,
  Coffee,
  Car,
} from "lucide-react";
import { toast } from "sonner";

const iconMap: Record<string, any> = {
  "fa-phone": Phone,
  MdOutlineSecurity: Shield,
  "fa-bell": Bell,
  "fa-key": Key,
  "fa-utensils": Utensils,
  "fa-broom": ShoppingCart,
  "fa-tools": Wrench,
  "fa-spa": Sprout,
  "fa-wine-glass": Droplets,
  "fa-heart": Heart,
  "fa-coffee": Coffee,
  "fa-car": Car,
  default: Users,
};

export function useStaffUnits(branchServiceId?: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const getIconComponent = useCallback((iconName: string) => {
    return iconMap[iconName] || iconMap.default;
  }, []);

  const getColorScheme = useCallback(
    (serviceName: string, isActive: boolean) => {
      const colorSchemes: Record<
        string,
        { color: string; bgColor: string; borderColor: string }
      > = {
        Reception: {
          color: isActive ? "text-teal-600" : "text-gray-400",
          bgColor: isActive ? "bg-teal-50" : "bg-gray-100",
          borderColor: isActive
            ? "border-teal-500 hover:border-teal-600"
            : "border-gray-300",
        },
        "Security Unit": {
          color: isActive ? "text-red-600" : "text-gray-400",
          bgColor: isActive ? "bg-red-50" : "bg-gray-100",
          borderColor: isActive
            ? "border-red-500 hover:border-red-600"
            : "border-gray-300",
        },
        "Room Service": {
          color: isActive ? "text-amber-600" : "text-gray-400",
          bgColor: isActive ? "bg-amber-50" : "bg-gray-100",
          borderColor: isActive
            ? "border-amber-500 hover:border-amber-600"
            : "border-gray-300",
        },
        Housekeeping: {
          color: isActive ? "text-blue-600" : "text-gray-400",
          bgColor: isActive ? "bg-blue-50" : "bg-gray-100",
          borderColor: isActive
            ? "border-blue-500 hover:border-blue-600"
            : "border-gray-300",
        },
        Maintenance: {
          color: isActive ? "text-purple-600" : "text-gray-400",
          bgColor: isActive ? "bg-purple-50" : "bg-gray-100",
          borderColor: isActive
            ? "border-purple-500 hover:border-purple-600"
            : "border-gray-300",
        },
      };

      return (
        colorSchemes[serviceName] || {
          color: isActive ? "text-green-600" : "text-gray-400",
          bgColor: isActive ? "bg-green-50" : "bg-gray-100",
          borderColor: isActive
            ? "border-green-500 hover:border-green-600"
            : "border-gray-300",
        }
      );
    },
    []
  );

  const fetchStaffUnits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const staffUnits = await staffUnitsAPI.getStaffUnits(branchServiceId);

      const formattedServices: Service[] = staffUnits.map((unit) => {
        const colorScheme = getColorScheme(unit.name, unit.isActive);

        return {
          id: unit.id,
          name: unit.name,
          description: unit.description || "",
          icon: getIconComponent(unit.icon),
          isActive: unit.isActive,
          branchService: unit.branchService,
          branchId: unit.branchId,
          branchServiceName: unit.branchServiceName,
          available: unit.isActive,
          staffUnitId: unit.id,
          status: unit.isActive ? "active" : "inactive",
          ...colorScheme,
        };
      });

      setServices(formattedServices);

      if (formattedServices.length === 0) {
        toast.warning("No services available for this branch");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load services";
      setError(errorMessage);

      // Auto-retry logic (max 3 retries)
      if (retryCount < 3) {
        setTimeout(
          () => {
            setRetryCount((prev) => prev + 1);
          },
          2000 * (retryCount + 1)
        );
      } else {
        toast.error("Unable to load services. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [branchServiceId, getIconComponent, getColorScheme, retryCount]);

  useEffect(() => {
    if (branchServiceId) {
      fetchStaffUnits();
    } else {
      setIsLoading(false);
      setServices([]);
      toast.info("Select a branch service to view available services");
    }
  }, [branchServiceId, fetchStaffUnits]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    fetchStaffUnits();
  }, [fetchStaffUnits]);

  return {
    services,
    isLoading,
    error,
    refetch,
    hasServices: services.length > 0,
    activeServices: services.filter((s) => s.isActive),
    inactiveServices: services.filter((s) => !s.isActive),
  };
}
