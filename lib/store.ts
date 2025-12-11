import { configureStore } from "@reduxjs/toolkit"
import { restaurantApi } from "./api/restaurant"
import { lodgingApi } from "./api/lodging"
import { servicesApi } from "./api/services-api"
import { setupListeners } from "@reduxjs/toolkit/query";
import { staffUnitsApi } from "@/lib/api/staffUnitsApi";

export const store = configureStore({
  reducer: {
    [restaurantApi.reducerPath]: restaurantApi.reducer,
    [lodgingApi.reducerPath]: lodgingApi.reducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
    [staffUnitsApi.reducerPath]: staffUnitsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(restaurantApi.middleware)
      .concat(lodgingApi.middleware)
      .concat(servicesApi.middleware)
      .concat(staffUnitsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
