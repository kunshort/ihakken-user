import { configureStore } from "@reduxjs/toolkit"
import { restaurantApi } from "./api/restaurant"
import { lodgingApi } from "./api/lodging"
import { servicesApi } from "./api/services-api"

export const store = configureStore({
  reducer: {
    [restaurantApi.reducerPath]: restaurantApi.reducer,
    [lodgingApi.reducerPath]: lodgingApi.reducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(restaurantApi.middleware)
      .concat(lodgingApi.middleware)
      .concat(servicesApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
