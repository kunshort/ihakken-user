import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

interface Amenity {
  id: string
  name: string
  icon?: string
}

interface Accommodation {
  id: string
  lodge: string
  floor: string
  type: string
  typeName: string
  code: string
  description?: string
  available: boolean
  pricePerNight?: string
  maxGuests?: number
  recommendedGuests?: number
  roomSize?: number
  nRooms?: number
  nBeds?: number
  nBaths?: number
  childrenAllowed?: boolean
  bedConfiguration?: string
  amenities: Amenity[]
  mainImage?: { id: string; url: string }[]
  created_at: string
  updated_at: string
}

interface LodgingCategory {
  id: string
  name: string
  children?: LodgingCategory[]
}

interface ApiResponse<T> {
  erc: number
  msg: string
  total?: number
  data: T
}

// Base query configuration
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
})

export const lodgingApi = createApi({
  reducerPath: "lodgingApi",
  baseQuery,
  endpoints: (builder) => ({
    getAccommodations: builder.query<Accommodation[], string>({
      query: (branchId) => `/api/v1/core/branches/${branchId}/services/lodging`,
      transformResponse: (response: ApiResponse<Accommodation[]>) => {
        return Array.isArray(response.data) ? response.data : []
      },
    }),

    getAccommodationById: builder.query<Accommodation, { branchId: string; accommodationId: string }>({
      query: ({ branchId, accommodationId }) =>
        `/api/v1/core/branches/${branchId}/services/lodging/${accommodationId}`,
      transformResponse: (response: ApiResponse<Accommodation>) => response.data,
    }),

    getLodgingCategories: builder.query<LodgingCategory[], string>({
      query: (branchId) => `/api/v1/core/branches/${branchId}/services/lodging/categories`,
      transformResponse: (response: ApiResponse<LodgingCategory[]>) => response.data || [],
    }),

    searchAccommodations: builder.query<
      Accommodation[],
      { branchId: string; query: string }
    >({
      query: ({ branchId, query }) =>
        `/api/v1/core/branches/${branchId}/services/lodging/search?q=${encodeURIComponent(query)}`,
      transformResponse: (response: ApiResponse<Accommodation[]>) => {
        return Array.isArray(response.data) ? response.data : []
      },
    }),
  }),
})

export const {
  useGetAccommodationsQuery,
  useGetAccommodationByIdQuery,
  useGetLodgingCategoriesQuery,
  useSearchAccommodationsQuery,
} = lodgingApi
