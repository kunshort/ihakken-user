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

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const startStatusPolling = useCallback((callSessionId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const status = await serviceCallsAPI.getCallStatus(callSessionId);

        switch (status.status) {
          case "connected":
            setCallStatus("connected");
            toast.success("Call connected!");
            break;
          case "ended":
            setCallStatus("ended");
            setActiveCall(null);
            toast.info("Call ended");
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            break;
          case "failed":
            setCallStatus("failed");
            setError("Call failed");
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            break;
        }
      } catch (error) {
        console.error("Failed to poll call status:", error);
      }
    }, 3000);
  }, []);

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
            ...metadata,
          },
        });

        const serviceCall: ServiceCall = {
          id: response.call_session_id,
          serviceId,
          serviceName: response.service_name || serviceName,
          userId: `user-${Date.now()}`,
          userName: "Guest",
          roomName: response.room_name,
          status: "pending",
          createdAt: new Date(),
          token: response.token,
          serverUrl: response.server_url,
          serviceType: response.service_type,
        };

        setActiveCall(serviceCall);
        setCallStatus("connecting");

        startStatusPolling(response.call_session_id);

        toast.success(`Calling ${serviceName}...`);
        return serviceCall;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initiate call";
        setError(errorMessage);
        setCallStatus("idle");
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
          reason,
        });

        if (response.success) {
          setActiveCall(null);
          setCallStatus("ended");

          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
          }

          return true;
        } else {
          throw new Error(response.message || "Failed to end call");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to end call";
        setError(errorMessage);
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
          }
        }

        return updatedCall;
      });
    },
    [startDurationTimer]
  );

  const retryCall = useCallback(async () => {
    if (!activeCall) return null;

    setCallStatus("ringing");
    setError(null);

    try {
      return activeCall;
    } catch (error) {
      setCallStatus("failed");
      throw error;
    }
  }, [activeCall]);

  return {
    // State
    activeCall,
    isCalling,
    error,
    callStatus,
    callDuration,

    initiateCall,
    cancelCall,
    endCall,
    updateCallStatus,
    retryCall,

    clearError: () => setError(null),
    reset: () => {
      setActiveCall(null);
      setError(null);
      setCallStatus("idle");
      setCallDuration(0);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    },
  };
}
