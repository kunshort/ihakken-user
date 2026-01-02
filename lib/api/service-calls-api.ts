// lib/api/service-calls-api.ts
import {
  CallStatusResponse,
  EndCallRequest,
  EndCallResponse,
  InitiateCallRequest,
  InitiateCallResponse,
} from "@/lib/types/service-calls";
import { toast } from "sonner";

class ServiceCallsAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL + "/api/v1/staffunits/calls";
  }

  async initiateCall(
    request: InitiateCallRequest
  ): Promise<InitiateCallResponse> {
    try {
      const token = localStorage.getItem("auth_token");
      let headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["X-Proxy-Token"] = token;
      }
      const response = await fetch(`${this.baseUrl}/initiate/`, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));

        throw new Error(
          errorData.message ||
            errorData.detail ||
            errorData.error ||
            `Failed to initiate call (${response.status})`
        );
      }

      const json = await response.json();
      // API returns { erc, msg, data: { callSessionId, roomName, userToken, status } }
      // Transform to expected InitiateCallResponse format
      const apiData = json.data;
      const data: InitiateCallResponse = {
        call_session_id: apiData.callSessionId,
        room_name: apiData.roomName,
        token: apiData.userToken,
        server_url:
          apiData.serverUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || "",
        status: apiData.status,
        service_name: apiData.serviceName,
        service_type: apiData.serviceType,
        metadata: apiData.metadata,
      };
      return data;
    } catch (error) {
      console.error("[ServiceCallsAPI] Initiate call error:", error);

      if (error instanceof Error) {
        toast.error(`Call failed: ${error.message}`);
      } else {
        toast.error("Failed to start call. Please try again.");
      }

      throw error;
    }
  }

  async endCall(request: EndCallRequest): Promise<EndCallResponse> {
    try {
      const token = localStorage.getItem("auth_token");
      let headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["X-Proxy-Token"] = token;
      }
      const response = await fetch(`${this.baseUrl}/end/`, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));

        throw new Error(
          errorData.message ||
            errorData.detail ||
            errorData.error ||
            `Failed to end call (${response.status})`
        );
      }

      const data: EndCallResponse = await response.json();
      return data;
    } catch (error) {
      console.error("[ServiceCallsAPI] End call error:", error);

      if (error instanceof Error) {
        toast.error(`Failed to end call: ${error.message}`);
      } else {
        toast.error("Failed to end call properly.");
      }

      throw error;
    }
  }

  async getCallStatus(callSessionId: string): Promise<CallStatusResponse> {
    try {
      const token = localStorage.getItem("auth_token");
      let headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["X-Proxy-Token"] = token;
      }
      const response = await fetch(`${this.baseUrl}/status/${callSessionId}/`, {
        headers,
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`Failed to get call status: ${response.status}`);
      }

      const data: any = await response.json();
      return data.data;
    } catch (error) {
      console.error("[ServiceCallsAPI] Get call status error:", error);
      throw error;
    }
  }
}

export const serviceCallsAPI = new ServiceCallsAPI();
