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
    // Get all menu items
    getMenuItems: builder.query<MenuItem[], void>({
      queryFn: async () => {
        try {
          // Replace with actual API endpoint
          const response = await fetch("/api/menu-items")
          if (!response.ok) throw new Error("Failed to fetch menu items")
          const data = await response.json()
          return { data }
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Unknown error" }
        }
      },
    }),

    // Get single menu item by ID
    getMenuItemById: builder.query<MenuItem, number>({
      queryFn: async (id) => {
        try {
          const response = await fetch(`/api/menu-items/${id}`)
          if (!response.ok) throw new Error("Failed to fetch menu item")
          const data = await response.json()
          return { data }
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Unknown error" }
        }
      },
    }),

    // Get categories
    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        try {
          const response = await fetch("/api/categories")
          if (!response.ok) throw new Error("Failed to fetch categories")
          const data = await response.json()
          return { data }
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Unknown error" }
        }
      },
    }),

    // Search menu items
    searchMenuItems: builder.query<MenuItem[], string>({
      queryFn: async (query) => {
        try {
          const response = await fetch(`/api/menu-items/search?q=${encodeURIComponent(query)}`)
          if (!response.ok) throw new Error("Failed to search menu items")
          const data = await response.json()
          return { data }
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Unknown error" }
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
