import { useEffect, useState } from "react";

export function usePayload() {
  const [payload, setPayload] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("app_payload");
      if (stored) {
        setPayload(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to get payload from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { payload, isLoading };
}
