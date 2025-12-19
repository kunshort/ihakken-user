// useServiceCall.ts - UPDATED
import {
  useEndCallMutation,
  useInitiateCallMutation,
} from "@/lib/api/service-calls-api";
import { CallStatus, ServiceCall } from "@/lib/types/service-calls";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useServiceCall() {
  const [activeCall, setActiveCall] = useState<ServiceCall | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [isLiveKitConnected, setIsLiveKitConnected] = useState(false);

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // RTK Query hooks
  const [initiateCallMutation] = useInitiateCallMutation();
  const [endCallMutation] = useEndCallMutation();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const startDurationTimer = useCallback(() => {
    console.log("⏱️ Starting call duration timer");
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    setCallDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    console.log("⏱️ Stopping call duration timer");
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const initiateCall = useCallback(
    async (
      serviceId: string,
      serviceName: string,
      staffUnitId: string,
      metadata?: Record<string, any>
    ) => {
      console.log("📞 Initiating call:", {
        serviceId,
        serviceName,
        staffUnitId,
      });
      setIsCalling(true);
      setError(null);
      setCallStatus("ringing");
      setIsLiveKitConnected(false); // Reset LiveKit connection status

      try {
        const response = await initiateCallMutation({
          staff_unit_id: staffUnitId,
          service_type: serviceId,
          metadata: {
            service_name: serviceName,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        }).unwrap();

        console.log("✅ Call initiated successfully:", response);

        const serviceCall: ServiceCall = {
          id: response.call_session_id,
          serviceId,
          serviceName: response.service_name || serviceName,
          userId: `guest-${Date.now()}`,
          userName: "Guest User",
          roomName: response.room_name,
          status: "pending",
          createdAt: new Date(),
          token: response.userToken,
          serverUrl: response.server_url,
          serviceType: response.service_type,
        };

        setActiveCall(serviceCall);
        setCallStatus("connecting"); // Set to connecting, NOT connected yet
        setIsLiveKitConnected(false); // LiveKit not connected yet

        toast.success(`Calling ${serviceName}...`, {
          description: "Please wait while we connect you",
        });

        return serviceCall;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initiate call";
        setError(errorMessage);
        setCallStatus("idle");
        setIsLiveKitConnected(false);

        toast.error("Call failed to start", {
          description: errorMessage,
        });

        throw err;
      } finally {
        setIsCalling(false);
      }
    },
    [initiateCallMutation]
  );

  const endCall = useCallback(
    async (callSessionId: string, reason?: string) => {
      console.log("📴 Ending call:", { callSessionId, reason });
      setIsEndingCall(true);
      setError(null);

      try {
        const response = await endCallMutation({
          call_session_id: callSessionId,
          reason: reason || "user_ended",
        }).unwrap();

        if (response.success) {
          // Update local state
          setActiveCall(null);
          setCallStatus("ended");
          setIsLiveKitConnected(false);

          // Clean up intervals
          stopDurationTimer();

          toast.success("Call ended", {
            description: `Duration: ${response.call_duration || 0} seconds`,
          });

          return true;
        } else {
          // Even if backend fails, update local state
          console.warn(
            "Backend end call failed, but updating local state:",
            response.message
          );
          setActiveCall(null);
          setCallStatus("ended");
          setIsLiveKitConnected(false);

          stopDurationTimer();

          toast.success("Call ended locally", {
            description: "Connection closed on your device",
          });

          return true;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to end call";
        setError(errorMessage);

        // Even on error, update local state
        setActiveCall(null);
        setCallStatus("ended");
        setIsLiveKitConnected(false);

        stopDurationTimer();

        console.error("Error ending call, but cleaned up locally:", err);

        toast.warning("Call ended locally", {
          description:
            "There was an issue with the server, but your connection was closed",
        });

        return true;
      } finally {
        setIsEndingCall(false);
      }
    },
    [endCallMutation, stopDurationTimer]
  );

  const cancelCall = useCallback(async () => {
    console.log("❌ Cancelling call");
    if (activeCall) {
      return await endCall(activeCall.id, "user_cancelled");
    }
    // If no active call, just clean up local state
    setActiveCall(null);
    setCallStatus("ended");
    setIsLiveKitConnected(false);
    return true;
  }, [activeCall, endCall]);

  const updateCallStatus = useCallback(
    (status: ServiceCall["status"]) => {
      console.log("🔄 Updating call status in hook:", {
        oldStatus: callStatus,
        newStatus: status,
      });

      setActiveCall((prev) => {
        if (!prev) return null;

        const updatedCall = { ...prev, status };

        if (status === "in-progress") {
          console.log(
            "✅ Call in-progress - but NOT marking as connected yet, waiting for LiveKit"
          );
          // Don't set to connected here - wait for LiveKit
          setCallStatus("connecting");
          // DO NOT start timer here - wait for LiveKit connection
        } else if (status === "completed" || status === "cancelled") {
          console.log("📵 Call completed/cancelled, updating to ended state");
          setCallStatus("ended");
          setIsLiveKitConnected(false);
          stopDurationTimer();
        } else if (status === "pending") {
          console.log("⏳ Call pending, keeping as connecting state");
          setCallStatus("connecting");
        }

        return updatedCall;
      });
    },
    [callStatus, stopDurationTimer]
  );

  const updateCallStatusDirect = useCallback(
    (status: CallStatus) => {
      console.log("🔄 Direct call status update:", {
        old: callStatus,
        new: status,
      });
      setCallStatus(status);

      if (status === "connected") {
        startDurationTimer();
      } else if (status === "ended" || status === "failed") {
        setIsLiveKitConnected(false);
        stopDurationTimer();
      }
    },
    [callStatus, startDurationTimer, stopDurationTimer]
  );

  // NEW: Callback for when LiveKit connects
  const handleLiveKitConnected = useCallback(() => {
    console.log("✅ LiveKit connected - marking as truly connected");
    setIsLiveKitConnected(true);
    setCallStatus("connected");
    startDurationTimer();

    toast.success("Call connected!", {
      description: "You are now connected to the audio call",
    });
  }, [startDurationTimer]);

  // NEW: Callback for when LiveKit disconnects
  const handleLiveKitDisconnected = useCallback(() => {
    console.log("🔌 LiveKit disconnected");
    setIsLiveKitConnected(false);

    if (callStatus === "connected") {
      setCallStatus("ended");
      stopDurationTimer();
    }
  }, [callStatus, stopDurationTimer]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    console.log("🔄 Resetting call state");
    setActiveCall(null);
    setError(null);
    setCallStatus("idle");
    setCallDuration(0);
    setIsEndingCall(false);
    setIsLiveKitConnected(false);

    stopDurationTimer();
  }, [stopDurationTimer]);

  const retryCall = useCallback(async () => {
    console.log("🔄 Retrying call");
    if (!activeCall) return;

    try {
      setError(null);
      setCallStatus("connecting");
      setIsLiveKitConnected(false);

      toast.info("Reconnecting call...");

      // Reset connection state
      setIsLiveKitConnected(false);
      setCallStatus("connecting");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to retry call";
      setError(errorMessage);
      setCallStatus("failed");
      setIsLiveKitConnected(false);
    }
  }, [activeCall]);

  return {
    // State
    activeCall,
    isCalling,
    error,
    callStatus,
    callDuration,
    isEndingCall,
    isLiveKitConnected, // NEW

    // Actions
    initiateCall,
    cancelCall,
    endCall,
    updateCallStatus,
    updateCallStatusDirect,
    clearError,
    reset,
    retryCall,
    handleLiveKitConnected, // NEW
    handleLiveKitDisconnected, // NEW
  };
}
