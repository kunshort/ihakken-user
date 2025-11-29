import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/config";

export const baseQuery = fetchBaseQuery({
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

export const BASE_API_URL = API_BASE_URL;
