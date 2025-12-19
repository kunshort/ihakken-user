// lib/api/service-calls-rtk-api.ts
import {
  ApiInitiateCallResponse,
  EndCallRequest,
  EndCallResponse,
  InitiateCallRequest,
  InitiateCallResponse,
} from "@/lib/types/service-calls";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";

export const serviceCallsAPI = createApi({
  reducerPath: "serviceCallsRtkApi",
  baseQuery,
  tagTypes: ["Call"],
  endpoints: (builder) => ({
    initiateCall: builder.mutation<InitiateCallResponse, InitiateCallRequest>({
      query: (request) => ({
        url: "/api/v1/staffunits/calls/initiate/",
        method: "POST",
        body: request,
      }),
      transformResponse: (
        response: ApiInitiateCallResponse
      ): InitiateCallResponse => {
        if (response.erc !== 1) {
          throw new Error(response.msg || "Failed to initiate call");
        }

        const callData = response.data;
        return {
          call_session_id: callData.callSessionId,
          room_name: callData.roomName,
          userToken: callData.userToken,
          status: callData.status,
        };
      },
      invalidatesTags: ["Call"],
    }),

    endCall: builder.mutation<EndCallResponse, EndCallRequest>({
      query: (request) => ({
        url: "/api/v1/staffunits/calls/end/",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["Call"],
    }),
  }),
});

export const { useInitiateCallMutation, useEndCallMutation } = serviceCallsAPI;
