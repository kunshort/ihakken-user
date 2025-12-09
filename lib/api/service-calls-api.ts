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
    this.baseUrl = "/api/v1/staffunits/calls";
  }

  async initiateCall(
    request: InitiateCallRequest
  ): Promise<InitiateCallResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/initiate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
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

      const data: InitiateCallResponse = await response.json();
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
      const response = await fetch(`${this.baseUrl}/end/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
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
      const response = await fetch(`${this.baseUrl}/status/${callSessionId}/`, {
        headers: {
          Accept: "application/json",
        },
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`Failed to get call status: ${response.status}`);
      }

      const data: CallStatusResponse = await response.json();
      return data;
    } catch (error) {
      console.error("[ServiceCallsAPI] Get call status error:", error);
      throw error;
    }
  }
}

export const serviceCallsAPI = new ServiceCallsAPI();
