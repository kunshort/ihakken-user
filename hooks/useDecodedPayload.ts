// hooks/useDecodedPayload.ts
import { useState, useEffect } from 'react';

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }
  return atob(base64);
}

export function useDecodedPayload(payload: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!payload) {
      setLoading(false);
      return;
    }

    try {
      const decodedString = base64UrlDecode(payload);
      const decoded = JSON.parse(decodedString);
      setData(decoded);
      setError(null);
    } catch (err) {
      setError('Failed to decode payload');
      console.error('Decoding error:', err);
    } finally {
      setLoading(false);
    }
  }, [payload]);

  return { data, loading, error };
}