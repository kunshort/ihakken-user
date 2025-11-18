import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQuery } from "./base"

export interface Service {
  id: string
  title: string
  description: string
  available: boolean
  icon?: string
  image?: string
  slug?: string
  type?: string
}

export interface ApiResponse<T> {
  erc: number
  msg: string
  data: T
}

export const servicesApi = createApi({
  reducerPath: "servicesApi",
  baseQuery,
  tagTypes: ["Services"],
  endpoints: (builder) => ({
    getServicesByBranch: builder.query<
      Service[],
      { branchId: string; serviceSlug?: string }
    >({
      query: ({ branchId, serviceSlug }) => {
        let url = `/api/v1/core/branches/${branchId}/services/`
        if (serviceSlug) {
          url += `?services=${serviceSlug}`
        }
        return url
      },
      transformResponse: (response: ApiResponse<Service[]>) => response.data,
      providesTags: (data, error, arg) => [
        { type: "Services", id: arg.branchId },
      ],
    }),
  }),
})

export const { useGetServicesByBranchQuery } = servicesApi
