// hooks/useServiceCall.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { serviceCallsAPI } from "@/lib/api/service-calls-api";
import { ServiceCall, CallStatus } from "@/lib/types/service-calls";
import { toast } from "sonner";

export function useServiceCall() {
  const [activeCall, setActiveCall] = useState<ServiceCall | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callDuration, setCallDuration] = useState(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  const startStatusPolling = useCallback(
    (callSessionId: string) => {
      // Clear any existing polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      // Set connection timeout (30 seconds)
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      connectionTimeoutRef.current = setTimeout(() => {
        if (callStatus === "ringing" || callStatus === "connecting") {
          setCallStatus("failed");
          setError("Connection timeout. Please try again.");
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        }
      }, 30000);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await serviceCallsAPI.getCallStatus(callSessionId);

          // Clear connection timeout if connected
          if (status.status === "connected" && connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
          }

          switch (status.status) {
            case "active":
              setCallStatus("connected");
              toast.success("Call connected!", {
                description: "You can now speak with an AI Agent",
              });
              break;
            case "ai_active":
              setCallStatus("connected");
              toast.success("Call connected!", {
                description: "You can now speak with an AI Agent",
              });
              break;
            case "staffunit_active":
              setCallStatus("connected");
              toast.success("Call connected!", {
                description: "You can now speak with the service staff",
              });
              break;
            case "ended":
              setCallStatus("ended");
              setActiveCall(null);
              toast.info("Call ended successfully");
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
              }
              break;
            case "failed":
              setCallStatus("failed");
              setError("Call failed to connect");
              toast.error("Call failed. Please try again.");
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
              }
              break;
          }
        } catch (error) {
          console.error("Failed to poll call status:", error);
          // Don't set error here to avoid interrupting the call
        }
      }, 3000);
    },
    [callStatus]
  );

  const startDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    setCallDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const initiateCall = useCallback(
    async (
      serviceId: string,
      serviceName: string,
      staffUnitId: string,
      metadata?: Record<string, any>
    ) => {
      setIsCalling(true);
      setError(null);
      setCallStatus("ringing");

      try {
        const response = await serviceCallsAPI.initiateCall({
          staff_unit_id: staffUnitId,
          service_type: serviceId,
          metadata: {
            service_name: serviceName,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        });

        const serviceCall: ServiceCall = {
          id: response.call_session_id,
          serviceId,
          serviceName: response.service_name || serviceName,
          userId: `guest-${Date.now()}`,
          userName: "Guest User",
          roomName: response.room_name,
          status: "pending",
          createdAt: new Date(),
          token: response.token,
          serverUrl: response.server_url,
          serviceType: response.service_type,
        };

        setActiveCall(serviceCall);
        setCallStatus("connecting");

        // Start polling for status updates
        startStatusPolling(response.call_session_id);

        toast.success(`Calling ${serviceName}...`, {
          description: "Please wait while we connect you",
        });

        return serviceCall;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initiate call";
        setError(errorMessage);
        setCallStatus("idle");

        toast.error("Call failed to start", {
          description: errorMessage,
        });

        throw err;
      } finally {
        setIsCalling(false);
      }
    },
    [startStatusPolling]
  );

  const endCall = useCallback(
    async (callSessionId: string, reason?: string) => {
      try {
        const response = await serviceCallsAPI.endCall({
          call_session_id: callSessionId,
          reason: reason || "user_ended",
        });

        if (response.success) {
          setActiveCall(null);
          setCallStatus("ended");

          // Clean up intervals
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }

          toast.success("Call ended", {
            description: `Duration: ${response.call_duration || 0} seconds`,
          });

          return true;
        } else {
          throw new Error(response.message || "Failed to end call");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to end call";
        setError(errorMessage);

        toast.error("Failed to end call properly");

        return false;
      }
    },
    []
  );

  const cancelCall = useCallback(async () => {
    if (activeCall) {
      return await endCall(activeCall.id, "user_cancelled");
    }
    return true;
  }, [activeCall, endCall]);

  const updateCallStatus = useCallback(
    (status: ServiceCall["status"]) => {
      setActiveCall((prev) => {
        if (!prev) return null;

        const updatedCall = { ...prev, status };

        if (status === "in-progress") {
          setCallStatus("connected");
          startDurationTimer();
        } else if (status === "completed" || status === "cancelled") {
          setCallStatus("ended");
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
        }

        return updatedCall;
      });
    },
    [startDurationTimer]
  );

  const retryCall = useCallback(async () => {
    if (!activeCall) {
      toast.error("No active call to retry");
      return null;
    }

    setCallStatus("ringing");
    setError(null);

    toast.info("Retrying call...");

    try {
      // Simulate retry - in production, you might want to re-initiate the call
      startStatusPolling(activeCall.id);
      return activeCall;
    } catch (error) {
      setCallStatus("failed");
      setError("Failed to retry call");
      throw error;
    }
  }, [activeCall, startStatusPolling]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setActiveCall(null);
    setError(null);
    setCallStatus("idle");
    setCallDuration(0);

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  return {
    // State
    activeCall,
    isCalling,
    error,
    callStatus,
    callDuration,

    // Actions
    initiateCall,
    cancelCall,
    endCall,
    updateCallStatus,
    retryCall,
    clearError,
    reset,
  };
}
