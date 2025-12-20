import { useState, useEffect, useCallback, useRef } from "react";

export type CallState =
  | "calling"
  | "ringing"
  | "connected"
  | "ended"
  | "failed";
export type WebSocketMessage = {
  type: "call_state_update";
  call_state: CallState;
  call_session_id: string;
  timestamp: string;
  data?: {
    participant_joined?: boolean;
    participant_left?: boolean;
    duration?: number;
  };
};

interface UseCallWebSocketProps {
  callSessionId: string;
  onStateUpdate?: (state: CallState, data?: any) => void;
  onConnected?: () => void;
  onError?: (error: Error) => void;
}

export function useCallWebSocket({
  callSessionId,
  onStateUpdate,
  onConnected,
  onError,
}: UseCallWebSocketProps) {
  const [callState, setCallState] = useState<CallState>("calling");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = useCallback(() => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.dev.ihakken.com";
      const wsUrl = baseUrl
        .replace("https://", "wss://")
        .replace("http://", "ws://");
      const socketUrl = `${wsUrl}/api/v1/staffunits/calls/${callSessionId}/`;

      console.log("🔌 Connecting to WebSocket:", socketUrl);

      const socket = new WebSocket(socketUrl);

      socket.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;
        onConnected?.();
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("📩 WebSocket message received:", message);

          if (message.type === "call_state_update") {
            setCallState(message.call_state);
            onStateUpdate?.(message.call_state, message.data);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      socket.onerror = (event) => {
        const error = new Error("WebSocket error occurred");
        console.error("❌ WebSocket error:", event);
        setError("Connection error");
        onError?.(error);
      };

      socket.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        setIsConnected(false);

        // Attempt reconnection if not a normal closure
        if (
          event.code !== 1000 &&
          reconnectAttemptRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptRef.current += 1;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptRef.current),
            10000
          );

          console.log(
            `🔄 Attempting reconnect ${reconnectAttemptRef.current}/${maxReconnectAttempts} in ${delay}ms`
          );

          setTimeout(() => {
            if (callSessionId) {
              connectWebSocket();
            }
          }, delay);
        }
      };

      wsRef.current = socket;
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setError("Failed to establish connection");
      onError?.(err as Error);
    }
  }, [callSessionId, onConnected, onError, onStateUpdate]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      console.log("🛑 Manually disconnecting WebSocket");
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (callSessionId) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [callSessionId, connectWebSocket, disconnectWebSocket]);

  return {
    callState,
    isConnected,
    error,
    sendMessage,
    disconnectWebSocket,
  };
}
