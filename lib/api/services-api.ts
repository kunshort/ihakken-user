import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQuery } from "./base"
import { Service } from "@/lib/types/interfaces"
import { ApiResponse } from "@/lib/types/responseformat"

// Session types - matching actual backend response
export interface BackendChatMessage {
  id: string;
  role: "user" | "assistant"; // backend uses "assistant" not "ai"
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  medium: string;
  resourceId: string; // camelCase as per actual API
  messages?: BackendChatMessage[];
}

export interface ChatMessage {
  text?: string;
  sender: "user" | "ai";
  items?: any[];
  cardType?: "menuItem" | "room";
}

export const servicesApi = createApi({
  reducerPath: "servicesApi",
  baseQuery,
  tagTypes: ["Services", "ChatSessions"],
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
    // Create a new chat session for a branch service
    createChatSession: builder.mutation<
      ChatSession,
      { resource_id: string; medium?: string }
    >({
      query: ({ resource_id, medium = "branch_service" }) => ({
        url: "/api/v1/chatbot/sessions/",
        method: "POST",
        body: {
          resource_id,
          medium,
        },
      }),
      transformResponse: (response: any) => response.data, // Unwrap the data field from the API response
      invalidatesTags: ["ChatSessions"],
    }),
    // Fetch an existing chat session with its messages
    getChatSession: builder.query<ChatSession, string>({
      query: (sessionId) => `/api/v1/chatbot/sessions/${sessionId}/`,
      transformResponse: (response: any) => response.data, // Unwrap the data field from the API response
      providesTags: (data, error, sessionId) => [
        { type: "ChatSessions", id: sessionId },
      ],
    }),
  }),
})

export const {
  useGetServicesByBranchQuery,
  useCreateChatSessionMutation,
  useGetChatSessionQuery,
} = servicesApi

