import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { API_BASE_URL } from "@/lib/config";
import { triggerSessionExpired } from "@/lib/contexts/session-context";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    // read auth token and device fingerprint from localStorage
    const token = localStorage.getItem("auth_token");
    const fingerprint = localStorage.getItem("device_fingerprint");

    if (token) {
      headers.set("X-Proxy-Token", token);
    }

    if (fingerprint) {
      headers.set("X-Device-Fingerprint", fingerprint);
    }

    return headers;
  },
});

// Wrapper that intercepts 401 responses and triggers session expired modal
export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // Check for 401 Unauthorized response
  if (result.error && result.error.status === 401) {
    triggerSessionExpired();
  }

  return result;
};

export const BASE_API_URL = API_BASE_URL;
