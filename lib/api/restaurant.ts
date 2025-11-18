import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  time: string
  image: string
  category: string
  ingredients?: Array<{ id: number; name: string; emoji: string }>
  addOns?: Array<{ id: number; name: string; price: number; image: string }>
  toppings?: Array<{ id: number; name: string; price: number; image: string }>
  complements?: Array<{ id: number; name: string; price: number; image: string }>
}

interface Category {
  id: string
  name: string
  children: Category[]
}

// Base query configuration
const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
})

export const restaurantApi = createApi({
  reducerPath: "restaurantApi",
  baseQuery,
  endpoints: (builder) => ({
    // Get all menu items for a specific branch
    getMenuItems: builder.query<MenuItem[], string | void>({
      queryFn: async (branchId, _api, _extraOptions, fetchWithBQ) => {
        try {
          const url = branchId 
            ? `/menu-items?branchId=${branchId}` 
            : `/menu-items`;
          const result = await fetchWithBQ(url)
          if (result.error) return { error: result.error }
          return { data: result.data as MenuItem[] }
        } catch (error) {
          return { 
            error: { 
              status: "CUSTOM_ERROR", 
              data: error instanceof Error ? error.message : "Unknown error",
              error: error instanceof Error ? error.message : "Unknown error"
            } 
          }
        }
      },
    }),

    // Get single menu item by ID
    getMenuItemById: builder.query<MenuItem, { id: number; branchId?: string }>({
      queryFn: async ({ id, branchId }, _api, _extraOptions, fetchWithBQ) => {
        try {
          const url = branchId 
            ? `/menu-items/${id}?branchId=${branchId}` 
            : `/menu-items/${id}`;
          const result = await fetchWithBQ(url)
          if (result.error) return { error: result.error }
          return { data: result.data as MenuItem }
        } catch (error) {
          return { 
            error: { 
              status: "CUSTOM_ERROR", 
              data: error instanceof Error ? error.message : "Unknown error",
              error: error instanceof Error ? error.message : "Unknown error"
            } 
          }
        }
      },
    }),

    // Get categories for a specific branch
    getCategories: builder.query<Category[], string | void>({
      queryFn: async (branchId, _api, _extraOptions, fetchWithBQ) => {
        try {
          const url = branchId 
            ? `/categories?branchId=${branchId}` 
            : `/categories`;
          const result = await fetchWithBQ(url)
          if (result.error) return { error: result.error }
          return { data: result.data as Category[] }
        } catch (error) {
          return { 
            error: { 
              status: "CUSTOM_ERROR", 
              data: error instanceof Error ? error.message : "Unknown error",
              error: error instanceof Error ? error.message : "Unknown error"
            } 
          }
        }
      },
    }),

    // Search menu items
    searchMenuItems: builder.query<MenuItem[], { query: string; branchId?: string }>({
      queryFn: async ({ query, branchId }, _api, _extraOptions, fetchWithBQ) => {
        try {
          const url = branchId 
            ? `/menu-items/search?q=${encodeURIComponent(query)}&branchId=${branchId}`
            : `/menu-items/search?q=${encodeURIComponent(query)}`;
          const result = await fetchWithBQ(url)
          if (result.error) return { error: result.error }
          return { data: result.data as MenuItem[] }
        } catch (error) {
          return { 
            error: { 
              status: "CUSTOM_ERROR", 
              data: error instanceof Error ? error.message : "Unknown error",
              error: error instanceof Error ? error.message : "Unknown error"
            } 
          }
        }
      },
    }),
  }),
})

export const {
  useGetMenuItemsQuery,
  useGetMenuItemByIdQuery,
  useGetCategoriesQuery,
  useSearchMenuItemsQuery,
} = restaurantApi