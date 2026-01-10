"use client";

import { ReactNode, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SessionProvider,
  useSession,
  setSessionExpiredCallback,
} from "@/lib/contexts/session-context";
import { SessionExpiredModal } from "@/components/session-expired-modal";

// Component to handle payload storage in localStorage
function PayloadHandler({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const payload = searchParams.get("payload");
    
    if (payload) {
      try {
        // Decode and validate the payload
        let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        const decoded = JSON.parse(atob(base64));
        
        // Store in localStorage
        localStorage.setItem("app_payload", JSON.stringify(decoded));
        
        // Store auth token and device fingerprint if available
        if (decoded.token) {
          localStorage.setItem("auth_token", decoded.token);
        }
        if (decoded.device_fingerprint) {
          localStorage.setItem("device_fingerprint", decoded.device_fingerprint);
        }
      } catch (error) {
        console.error("Failed to process payload:", error);
      }
    }
  }, [searchParams]);

  return children;
}

// Component that connects the session context to the callback used by baseQuery
function SessionCallbackConnector({ children }: { children: ReactNode }) {
  const { isSessionExpired, setSessionExpired } = useSession();

  useEffect(() => {
    setSessionExpiredCallback(setSessionExpired);
  }, [setSessionExpired]);

  return (
    <>
      {children}
      <SessionExpiredModal isOpen={isSessionExpired} />
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={true}
        disableTransitionOnChange
      >
        <SessionProvider>
          <PayloadHandler>
            <SessionCallbackConnector>{children}</SessionCallbackConnector>
          </PayloadHandler>
        </SessionProvider>
      </ThemeProvider>
    </Provider>
  );
}
