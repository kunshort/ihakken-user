// components/service-call-room.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { ServiceCall } from "@/lib/types/service-calls";
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff, Phone, RotateCw } from "lucide-react";
import { CallStatus } from "@/lib/types/service-calls";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";

const LIVEKIT_SERVER_URL =
  process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://call.kunshort.com";

interface ServiceCallRoomProps {
  serviceCall: ServiceCall;
  onCallEnd: () => void;
  onCallAccepted: () => void;
  callStatus: CallStatus;
  callDuration: number;
  onRetry?: () => void;
  retrying?: boolean;
}

export function ServiceCallRoom({
  serviceCall,
  onCallEnd,
  callStatus,
  callDuration,
  onRetry,
  retrying = false,
}: ServiceCallRoomProps) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [localCallStatus, setLocalCallStatus] =
    useState<CallStatus>(callStatus);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalCallStatus(callStatus);
  }, [callStatus]);

  // Handle ringing sound
  useEffect(() => {
    if (
      localCallStatus === "ringing" ||
      localCallStatus === "connecting"
    ) {
      const playRingTone = () => {
        try {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext ||
              (window as any).webkitAudioContext)();
          }
          const ctx = audioContextRef.current;

          // Play two-tone ring
          const playTone = (freq: number, startTime: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = "sine";
            gain.gain.setValueAtTime(0.08, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            osc.start(startTime);
            osc.stop(startTime + duration);
          };

          const now = ctx.currentTime;
          playTone(440, now, 0.4);
          playTone(480, now, 0.4);
          playTone(440, now + 0.5, 0.4);
          playTone(480, now + 0.5, 0.4);
        } catch (error) {
          console.error("Error playing ringtone:", error);
        }
      };

      playRingTone();
      intervalRef.current = setInterval(playRingTone, 3000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  }, [localCallStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const isRinging = localCallStatus === "ringing" || localCallStatus === "connecting";
  const isConnected = localCallStatus === "connected";
  const isEnded = localCallStatus === "ended" || localCallStatus === "failed";

  return (
    <div className="bg-gradient-to-b from-card to-muted dark:from-zinc-900 dark:to-zinc-950 text-foreground rounded-2xl overflow-hidden border border-border shadow-lg mx-2">
      <div className="h-[400px] flex flex-col items-center justify-between py-10 px-4">
        {/* Avatar and Status */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Avatar with ring animation */}
          <div className="relative mb-6">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold ${
                isConnected
                  ? "bg-green-500 text-white"
                  : isEnded
                  ? "bg-muted-foreground/50 text-background"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {serviceCall.serviceName?.charAt(0).toUpperCase() || "S"}
            </div>

            {/* Ringing animation rings */}
            {isRinging && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-primary/70 animate-ping opacity-30" />
                <div
                  className="absolute -inset-2 rounded-full border-2 border-primary/50 animate-ping opacity-20"
                  style={{ animationDelay: "0.3s" }}
                />
                <div
                  className="absolute -inset-4 rounded-full border-2 border-primary/30 animate-ping opacity-10"
                  style={{ animationDelay: "0.6s" }}
                />
              </>
            )}

            {/* Connected indicator */}
            {isConnected && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-card dark:border-zinc-900" />
            )}
          </div>

          {/* Service Name */}
          <h2 className="text-2xl font-semibold mb-2 text-foreground">
            {serviceCall.serviceName || "Service"}
          </h2>

          {/* Status Text */}
          <div className="text-muted-foreground text-lg">
            {isRinging && <span className="text-primary">Calling...</span>}
            {isConnected && (
              <span className="text-green-500 dark:text-green-400 font-mono text-2xl">
                {formatTime(callDuration)}
              </span>
            )}
            {localCallStatus === "failed" && (
              <span className="text-destructive">Call Failed</span>
            )}
            {localCallStatus === "ended" && (
              <span className="text-muted-foreground">Call Ended</span>
            )}
          </div>
        </div>

        {/* LiveKit Room for connected calls */}
        {isConnected && serviceCall.token && (
          <LiveKitRoom
            token={serviceCall.token}
            serverUrl={LIVEKIT_SERVER_URL}
            connect={true}
            audio={true}
          >
            <RoomAudioRenderer />
          </LiveKitRoom>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-6">
          {/* Mute Button - only show when connected */}
          {isConnected && (
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleAudio}
              className={`w-16 h-16 rounded-full ${
                !audioEnabled
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {audioEnabled ? (
                <Mic className="w-7 h-7" />
              ) : (
                <MicOff className="w-7 h-7" />
              )}
            </Button>
          )}

          {/* End/Retry Call Button */}
          {isEnded ? (
            <div className="flex gap-4">
              {localCallStatus === "failed" && onRetry && (
                <Button
                  onClick={onRetry}
                  disabled={retrying}
                  className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {retrying ? (
                    <RotateCw className="w-7 h-7 animate-spin" />
                  ) : (
                    <Phone className="w-7 h-7" />
                  )}
                </Button>
              )}
              <Button
                onClick={onCallEnd}
                className="w-16 h-16 rounded-full bg-muted hover:bg-muted/80 text-foreground"
              >
                <PhoneOff className="w-7 h-7" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={onCallEnd}
              className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <PhoneOff className="w-7 h-7" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
