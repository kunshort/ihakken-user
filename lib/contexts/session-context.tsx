"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface SessionContextType {
  isSessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const setSessionExpired = useCallback((expired: boolean) => {
    setIsSessionExpired(expired);
  }, []);

  return (
    <SessionContext.Provider value={{ isSessionExpired, setSessionExpired }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

// Singleton for non-React access (used by RTK Query baseQuery)
let sessionExpiredCallback: ((expired: boolean) => void) | null = null;

export function setSessionExpiredCallback(callback: (expired: boolean) => void) {
  sessionExpiredCallback = callback;
}

export function triggerSessionExpired() {
  if (sessionExpiredCallback) {
    sessionExpiredCallback(true);
  }
}
