import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQuery } from "./base"
import { AIChatMenuItem, AIChatRoomItem } from "@/components/shared/AiChatAssistant";
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
  items?: (AIChatMenuItem | AIChatRoomItem)[];
  cardType?: "menuItem" | "room";
}

export interface ChatbotConfig {
  id: string;
  displayName: string;
  greetingMessage: string;
  systemPrompt: string;
  bubbleStyle: 'bordered_bubble' | 'pill' | 'rounded' | 'speech_bubble';
  primaryColor: string;
  accentColor: string;
  avatar: string | null;
  resourceId: string;
}

/**
 * Generic type for the API response structure where data is nested.
 * e.g., { erc: 1, msg: "success", data: { ... } }
 */
interface NestedApiResponse<T> {
  data: T;
  [key: string]: any;
}

export const servicesApi = createApi({
  reducerPath: "servicesApi",
  baseQuery,
  tagTypes: ["Services", "ChatSessions", "ChatbotConfig"],
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
      transformResponse: (response: NestedApiResponse<ChatSession>) => response.data,
      invalidatesTags: ["ChatSessions"],
    }),
    // Fetch an existing chat session with its messages
    getChatSession: builder.query<ChatSession, string>({
      query: (sessionId) => `/api/v1/chatbot/sessions/${sessionId}/`,
      transformResponse: (response: NestedApiResponse<ChatSession>) => response.data,
      providesTags: (data, error, sessionId) => [
        { type: "ChatSessions", id: sessionId },
      ],
    }),
    // Fetch the configuration for the chatbot
    getChatbotConfig: builder.query<ChatbotConfig, string>({
      query: (branchServiceId) => `/api/v1/chatbot/chatbot-config/?branch_service_id=${branchServiceId}`,
      transformResponse: (response: NestedApiResponse<ChatbotConfig>) => response.data,
      providesTags: (result, error, branchServiceId) => [
        { type: "ChatbotConfig", id: branchServiceId },
      ],
    }),
  }),
})

export const {
  useGetServicesByBranchQuery,
  useCreateChatSessionMutation,
  useGetChatSessionQuery,
  useGetChatbotConfigQuery,
} = servicesApi
