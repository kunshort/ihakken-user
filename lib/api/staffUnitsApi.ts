import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, StaffUnit } from "@/lib/types/service-calls";
import { baseQuery } from "./base";

export const staffUnitsApi = createApi({
  reducerPath: "staffUnitsApi",
  baseQuery,
  tagTypes: ["StaffUnits"],
  endpoints: (builder) => ({
    getStaffUnits: builder.query<StaffUnit[], string | undefined>({
      query: (branchServiceId) => {
        const params = new URLSearchParams();
        if (branchServiceId) {
          params.append("branch_service", branchServiceId);
        }

        const queryString = params.toString();
        return {
          url: `/api/v1/staffunits/staff-units/${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: ApiResponse<StaffUnit>) => {
        if (response.erc !== 1) {
          throw new Error(response.msg || "Failed to fetch staff units");
        }

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

        return response.data.map((unit) => ({
          ...unit,
          description:
            unit.description ||
            descriptions[unit.name] ||
            `Contact ${unit.name} department`,
        }));
      },
      providesTags: ["StaffUnits"],
    }),

    checkStaffUnitAvailability: builder.query<boolean, string>({
      query: (staffUnitId) => ({
        url: `/api/v1/staffunits/staff-units/${staffUnitId}/availability/`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.isActive === true,
    }),
  }),
});

export const {
  useGetStaffUnitsQuery,
  useLazyGetStaffUnitsQuery,
  useCheckStaffUnitAvailabilityQuery,
} = staffUnitsApi;
