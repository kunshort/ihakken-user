// Utility functions to manage payload storage in localStorage

interface StoredPayload {
  token?: string;
  router_id?: string;
  router_type?: string;
  branch?: {
    id: string;
    name: string;
  };
  device_fingerprint?: string;
  expires_at?: string;
  is_unique_visitor?: boolean;
  services?: Array<{
    id: string;
    name: string;
    serviceType: string;
    image?: string;
  }>;
}

const PAYLOAD_STORAGE_KEY = "app_payload";

export function storePayload(payload: StoredPayload): void {
  try {
    localStorage.setItem(PAYLOAD_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to store payload:", error);
  }
}

export function getStoredPayload(): StoredPayload | null {
  try {
    const stored = localStorage.getItem(PAYLOAD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to retrieve stored payload:", error);
    return null;
  }
}

export function clearStoredPayload(): void {
  try {
    localStorage.removeItem(PAYLOAD_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear stored payload:", error);
  }
}

export function isPayloadExpired(payload: StoredPayload | null): boolean {
  if (!payload || !payload.expires_at) return true;
  return new Date(payload.expires_at) < new Date();
}
