import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";

interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

interface Accommodation {
  id: string;
  lodge: string;
  floor: string;
  type: string;
  typeName: string;
  code: string;
  description?: string;
  available: boolean;
  pricePerNight?: string;
  maxGuests?: number;
  recommendedGuests?: number;
  roomSize?: number;
  nRooms?: number;
  nBeds?: number;
  nBaths?: number;
  childrenAllowed?: boolean;
  bedConfiguration?: string;
  amenities: Amenity[];
  mainImage?: { id: string; url: string }[];
  created_at: string;
  updated_at: string;
}

interface FloorData {
  floor: string;
  floorName: string;
  accommodations: Accommodation[];
}

interface LodgingCategory {
  id: string;
  name: string;
  children?: LodgingCategory[];
}

interface ApiResponse<T> {
  erc: number;
  msg: string;
  total?: number;
  next?: string | null;
  data: T;
}

// Nested response structure from the backend
interface NestedApiResponse {
  erc: number;
  msg: string;
  total: number;
  next: string | null;
  data: {
    erc: number;
    msg: string;
    total: number;
    next: string | null;
    data: FloorData[];
  };
}

export const lodgingApi = createApi({
  reducerPath: "lodgingApi",
  baseQuery,
  endpoints: (builder) => ({
    getAccommodations: builder.query<Accommodation[], string>({
      query: (branchId) =>
        `api/v1/lodging/accommodations/by-branch-service/?branch_service_id=2e6685b4-92a8-4495-9598-b270a3f11b5e`,
      transformResponse: (response: NestedApiResponse) => {
        console.log('🔄 Raw API Response:', response);
        
        // Handle the nested structure: response.data.data is an array of floors
        const floors = response?.data?.data;
        
        if (!Array.isArray(floors)) {
          console.warn('⚠️ Floors data is not an array:', floors);
          return [];
        }

        // Flatten all accommodations from all floors into a single array
        const allAccommodations = floors.flatMap((floor: FloorData) => {
          if (!Array.isArray(floor.accommodations)) {
            console.warn('⚠️ Floor accommodations is not an array:', floor);
            return [];
          }
          return floor.accommodations;
        });

        console.log('✅ Flattened accommodations:', allAccommodations);
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
  useGetAccommodationsQuery,
  useGetAccommodationByIdQuery,
  useGetLodgingCategoriesQuery,
  useSearchAccommodationsQuery,
} = lodgingApi;