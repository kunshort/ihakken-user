import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.dev.ihakken.com",
  prepareHeaders: (headers) => {
    return headers
  },
})
