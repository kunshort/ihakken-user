import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import { Accommodation } from "@/lib/types/interfaces";
import { FloorData } from "@/lib/types/interfaces";
import { ApiResponse } from "../types/responseformat";
import { LodgingCategory } from "@/lib/types/interfaces";
import { NestedApiResponse } from "@/lib/types/interfaces";

// Base64 URL decode function
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }
  return atob(base64);
}

export const lodgingApi = createApi({
  reducerPath: "lodgingApi",
  baseQuery,
  tagTypes: ["Accommodations", "Accommodation", "DecodedPayload"],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    decodePayload: builder.query<any, string>({
      queryFn: (payload) => {
        if (!payload) {
          return { data: null };
        }
        try {
          const decodedString = base64UrlDecode(payload);
          const decoded = JSON.parse(decodedString);
          return { data: decoded };
        } catch (error) {
          return {
            error: {
              status: "PARSING_ERROR",
              error: "Failed to decode payload",
            },
          };
        }
      },
      providesTags: (result, error, payload) => [
        { type: "DecodedPayload", id: payload },
      ],
    }),
    getAccommodations: builder.query<Accommodation[], string>({
      query: (serviceId) =>
        `api/v1/lodging/accommodations/by-branch-service/?branch_service_id=${serviceId}`,
      providesTags: (result, error, serviceId) => [
        { type: "Accommodations", id: serviceId },
      ],
      transformResponse: (response: NestedApiResponse) => {
        console.log("Fetching accommodations...");

        const floors = response?.data?.data;
        if (!Array.isArray(floors)) {
          return [];
        }
        const allAccommodations = floors.flatMap((floor: FloorData) => {
          if (!Array.isArray(floor.accommodations)) {
            return [];
          }
          return floor.accommodations;
        });
        return allAccommodations;
      },
    }),

    getAccommodationById: builder.query<
      Accommodation,
      { branchId: string; accommodationId: string }
    >({
      query: ({ branchId, accommodationId }) =>
        `/api/v1/core/branches/${branchId}/services/lodging/${accommodationId}`,
      transformResponse: (response: ApiResponse<Accommodation>) =>
        response.data,
    }),

    getLodgingCategories: builder.query<LodgingCategory[], string>({
      query: (branchId) =>
        `/api/v1/core/branches/${branchId}/services/lodging/categories`,
      transformResponse: (response: ApiResponse<LodgingCategory[]>) =>
        response.data || [],
    }),

    searchAccommodations: builder.query<
      Accommodation[],
      { branchId: string; query: string }
    >({
      query: ({ branchId, query }) =>
        `/api/v1/core/branches/${branchId}/services/lodging/search?q=${encodeURIComponent(
          query
        )}`,
      transformResponse: (response: ApiResponse<Accommodation[]>) => {
        return Array.isArray(response.data) ? response.data : [];
      },
    }),
  }),
});

export const {
  useDecodePayloadQuery,
  useGetAccommodationsQuery,
  useGetAccommodationByIdQuery,
  useGetLodgingCategoriesQuery,
  useSearchAccommodationsQuery,
} = lodgingApi;
