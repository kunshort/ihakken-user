import { useMemo } from "react";
import { useGetStaffUnitsQuery } from "@/lib/api/staffUnitsApi";
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

  const {
    data: staffUnits = [],
    isLoading,
    error,
    refetch,
  } = useGetStaffUnitsQuery(branchServiceId ?? undefined, {
    skip: !branchServiceId,
  });

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || iconMap.default;
  };

  const getColorScheme = (serviceName: string, isActive: boolean) => {
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
  };

  const services: Service[] = useMemo(() => {
    if (!staffUnits || staffUnits.length === 0) return [];

    return staffUnits.map((unit) => {
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
  }, [staffUnits]);

  const errorMessage = useMemo(() => {
    if (!error) return null;

    if ("status" in error) {
      switch (error.status) {
        case 401:
          return "Authentication failed. Please try again.";
        case 404:
          return "No services found for this branch.";
        case 500:
          return "Server error. Please try again later.";
        case "FETCH_ERROR":
          return "Unable to connect to the server. Check your internet connection.";
        default:
          return "Failed to load services.";
      }
    }

    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }

    return "Failed to load services.";
  }, [error]);

  useMemo(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    } else if (!isLoading && staffUnits.length === 0 && branchServiceId) {
      toast.warning("No services available for this branch");
    } else if (!branchServiceId && !isLoading) {
      toast.info("Select a branch service to view available services");
    }
  }, [errorMessage, isLoading, staffUnits.length, branchServiceId]);

  return {
    services,
    isLoading,
    error: errorMessage,
    refetch,
    hasServices: services.length > 0,
    activeServices: services.filter((s) => s.isActive),
    inactiveServices: services.filter((s) => !s.isActive),
  };
}
