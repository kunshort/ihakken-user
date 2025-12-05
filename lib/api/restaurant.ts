import {
  createApi,
  FetchBaseQueryError,
  skipToken,
} from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import { MenuCategory, MenuCategoryResponse, MenuItem, ParentCategory } from "../types/interfaces";

// ---------- TYPES ----------
// export interface MenuItem {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   time: string;
//   image: string;
//   category: string;
//   ingredients?: Array<{ id: number; name: string; emoji: string }>;
//   addOns?: Array<{ id: number; name: string; price: number; image: string }>;
//   toppings?: Array<{ id: number; name: string; price: number; image: string }>;
//   complements?: Array<{
//     id: number;
//     name: string;
//     price: number;
//     image: string;
//   }>;
// }


// ---------- ERROR WRAPPER ----------
const wrapError = (error: unknown): FetchBaseQueryError => ({
  status: "CUSTOM_ERROR",
  data:
    error instanceof Error
      ? { message: error.message }
      : { message: "Unknown error" },
  error: error instanceof Error ? error.message : "Unknown error",
});

// ---------- API SLICE ----------
export const restaurantApi = createApi({
  reducerPath: "restaurantApi",
  baseQuery,
  endpoints: (builder) => ({
    getMenuItems: builder.query<MenuItem[], { serviceId: string }>({
      async queryFn({ serviceId }, _api, _extraOptions, fetchWithBQ) {
        try {
          const url = `api/v1/restaurant/menu-assignments/branch-service/${serviceId}/`;
          const result = await fetchWithBQ(url);
          if (result.error)
            return { error: result.error as FetchBaseQueryError };
          return { data: result.data as MenuItem[] };
        } catch (error) {
          return { error: wrapError(error) };
        }
      },
    }),

    getMenuItemById: builder.query<MenuItem, { id: number; branchId?: string }>(
      {
        async queryFn({ id, branchId }, _api, _extraOptions, fetchWithBQ) {
          try {
            const url = branchId
              ? `/menu-items/${id}?branchId=${branchId}`
              : `/menu-items/${id}`;
            const result = await fetchWithBQ(url);
            if (result.error)
              return { error: result.error as FetchBaseQueryError };
            return { data: result.data as MenuItem };
          } catch (error) {
            return { error: wrapError(error) };
          }
        },
      }
    ),

    // 3️⃣ GET MENU CATEGORIES FOR A SERVICE
    getMenuCategories: builder.query<MenuCategory[], { serviceId: string }>({
      async queryFn({ serviceId }, _api, _extraOptions, fetchWithBQ) {
        try {
          const url = `/api/v1/restaurant/menu-assignments/service/${serviceId}/categories/`;
          const result = await fetchWithBQ(url);

          if (result.error)
            return { error: result.error as FetchBaseQueryError };

          const response = result.data as MenuCategoryResponse;
          return { data: response.data };
        } catch (error) {
          return { error: wrapError(error) };
        }
      },
    }),

    // 4️⃣ SEARCH MENU ITEMS
    searchMenuItems: builder.query<
      MenuItem[],
      { query: string; branchId?: string }
    >({
      async queryFn({ query, branchId }, _api, _extraOptions, fetchWithBQ) {
        try {
          const url = branchId
            ? `/menu-items/search?q=${encodeURIComponent(
                query
              )}&branchId=${branchId}`
            : `/menu-items/search?q=${encodeURIComponent(query)}`;
          const result = await fetchWithBQ(url);
          if (result.error)
            return { error: result.error as FetchBaseQueryError };
          return { data: result.data as MenuItem[] };
        } catch (error) {
          return { error: wrapError(error) };
        }
      },
    }),
  }),
});

export const {
  useGetMenuItemsQuery,
  useGetMenuItemByIdQuery,
  useGetMenuCategoriesQuery,
  useSearchMenuItemsQuery,
} = restaurantApi;