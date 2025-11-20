"use client";

import { useEffect, useState } from "react";

interface DecodedService {
  id: string;
  name: string;
  service_type: string;
}

export interface DecodedPayload {
  token?: string;
  device_fingerprint?: string;
  branch: {
    id: string;
    name: string;
    description?: string;
  };
  services: DecodedService[];
}

function decodePayload(payload: string): DecodedPayload | null {
  try {
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    while (base64.length % 4) {
      base64 += "=";
    }

    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Failed to decode payload:", e);
    return null;
  }
}

export function useDecodedPayload(payload: string | null) {
  const [data, setData] = useState<DecodedPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!payload) {
      setError("No payload found.");
      setLoading(false);
      return;
    }

    const decoded = decodePayload(payload);

    if (!decoded) {
      setError("Failed to decode payload.");
      setLoading(false);
      return;
    }

    // 🔥 Save security headers (ONLY these)
    if (decoded.token) {
      localStorage.setItem("auth_token", decoded.token);
    }

    if (decoded.device_fingerprint) {
      localStorage.setItem("device_fingerprint", decoded.device_fingerprint);
    }

    // Optional but useful
    if (decoded.branch?.id) {
      localStorage.setItem("branch_id", decoded.branch.id);
    }

    if (decoded.services) {
      localStorage.setItem("services", JSON.stringify(decoded.services));
    }

    setData(decoded);
    setLoading(false);
  }, [payload]);

  return { data, error, loading };
}
