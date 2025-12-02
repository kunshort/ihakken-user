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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail ||
            data.error ||
            `Failed to initiate call: ${response.status} ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error("[API] Initiate call error:", error);

      if (error instanceof Error) {
        toast.error(error.message);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail ||
            data.error ||
            `Failed to end call: ${response.status} ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error("[API] End call error:", error);

      if (error instanceof Error) {
        toast.error(error.message);
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
      });

      if (!response.ok) {
        throw new Error(`Failed to get call status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[API] Get call status error:", error);
      throw error;
    }
  }

  async checkServiceAvailability(staffUnitId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/availability/${staffUnitId}/`
      );
      return response.ok;
    } catch (error) {
      console.error("[API] Check availability error:", error);
      return false;
    }
  }
}

export const serviceCallsAPI = new ServiceCallsAPI();
