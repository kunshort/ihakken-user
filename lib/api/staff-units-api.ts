// lib/api/staff-units-api.ts
import { ApiResponse, StaffUnit } from "@/lib/types/service-calls";
import { toast } from "sonner";

class StaffUnitsAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "/api/v1/staffunits";
  }

  async getStaffUnits(branchServiceId?: string): Promise<StaffUnit[]> {
    try {
      let url = `${this.baseUrl}/staff-units/`;

      if (branchServiceId) {
        url += `?branch_service=${branchServiceId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<StaffUnit> = await response.json();

      if (data.erc !== 1) {
        throw new Error(data.msg || "Failed to fetch staff units");
      }

      return data.data.map((unit) => ({
        ...unit,
        description: unit.description || this.getDefaultDescription(unit.name),
      }));
    } catch (error) {
      console.error("[StaffUnitsAPI] Error fetching staff units:", error);

      if (error instanceof Error) {
        toast.error(`Failed to load services: ${error.message}`);
      } else {
        toast.error("Failed to load services. Please try again.");
      }

      throw error;
    }
  }

  async checkStaffUnitAvailability(staffUnitId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/staff-units/${staffUnitId}/availability/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.isActive === true;
    } catch (error) {
      console.error("[StaffUnitsAPI] Error checking availability:", error);
      return false;
    }
  }

  private getDefaultDescription(serviceName: string): string {
    const descriptions: Record<string, string> = {
      Reception: "Contact the front desk for assistance",
      "Security Unit": "Report security concerns or emergencies",
      "Room Service": "Order food and beverages to your room",
      Housekeeping: "Request cleaning, towels, or amenities",
      Maintenance: "Report maintenance issues or repairs needed",
      Janitorial: "Request janitorial or cleaning services",
      Concierge: "Get assistance with bookings and reservations",
      "Bell Service": "Request luggage assistance",
      Valet: "Request valet parking services",
      Spa: "Book spa appointments and services",
      Restaurant: "Make dining reservations",
      Pool: "Poolside service requests",
    };

    return descriptions[serviceName] || `Contact ${serviceName} department`;
  }
}

export const staffUnitsAPI = new StaffUnitsAPI();
