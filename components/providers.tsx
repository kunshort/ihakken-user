"use client";

import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SessionProvider,
  useSession,
  setSessionExpiredCallback,
} from "@/lib/contexts/session-context";
import { SessionExpiredModal } from "@/components/session-expired-modal";

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
          <SessionCallbackConnector>{children}</SessionCallbackConnector>
        </SessionProvider>
      </ThemeProvider>
    </Provider>
  );
}
