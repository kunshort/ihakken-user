// utils/jwt-decoder.ts
/**
 * Decodes a JWT token and logs its contents
 * @param token - The JWT token to decode
 * @returns The decoded token payload or null if invalid
 */
export function decodeJWT(token: string): any | null {
  if (!token) {
    console.error("No token provided");
    return null;
  }

  try {
    // JWT consists of three parts: header.payload.signature
    const parts = token.split(".");

    if (parts.length !== 3) {
      console.error("Invalid JWT format. Expected 3 parts, got:", parts.length);
      return null;
    }

    // Decode header and payload (they are base64url encoded)
    const header = JSON.parse(
      atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"))
    );
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    return {
      header,
      payload,
      raw: {
        header: parts[0],
        payload: parts[1],
        signature: parts[2],
      },
    };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Decodes and logs JWT token information for debugging
 * @param token - The JWT token to decode and log
 */
export function logJWTDetails(token: string): void {
  console.log("🔑 JWT Token Analysis");
  console.log("====================");

  if (!token) {
    console.error("❌ No token provided");
    return;
  }

  console.log("Token length:", token.length, "characters");
  console.log("Token preview:", token.substring(0, 50) + "...");

  const decoded = decodeJWT(token);

  if (!decoded) {
    console.error("❌ Failed to decode token");
    return;
  }

  console.log("\n📋 Header:");
  console.log(JSON.stringify(decoded.header, null, 2));

  console.log("\n📄 Payload:");
  console.log(JSON.stringify(decoded.payload, null, 2));

  console.log("\n📊 Claims:");
  console.log("Subject (sub):", decoded.payload.sub || "Not set");
  console.log("Issuer (iss):", decoded.payload.iss || "Not set");
  console.log("Issued At (iat):", decoded.payload.iat || "Not set");
  console.log("Expiration (exp):", decoded.payload.exp || "Not set");
  console.log("Not Before (nbf):", decoded.payload.nbf || "Not set");

  if (decoded.payload.exp) {
    const expDate = new Date(decoded.payload.exp * 1000);
    const now = new Date();
    const isExpired = expDate < now;
    console.log("Expires at:", expDate.toISOString());
    console.log("Is expired?", isExpired ? "❌ YES" : "✅ NO");
    console.log(
      "Time until expiry:",
      Math.floor((expDate.getTime() - now.getTime()) / 1000),
      "seconds"
    );
  }

  if (decoded.payload.nbf) {
    const nbfDate = new Date(decoded.payload.nbf * 1000);
    const now = new Date();
    const isActive = nbfDate <= now;
    console.log("Active from:", nbfDate.toISOString());
    console.log("Is active?", isActive ? "✅ YES" : "❌ NO (not yet valid)");
  }

  // Check for LiveKit specific claims
  console.log("\n🔍 LiveKit Specific:");
  const livekitClaims = [
    "video",
    "room",
    "roomJoin",
    "roomAdmin",
    "roomRecord",
    "canPublish",
    "canSubscribe",
  ];
  livekitClaims.forEach((claim) => {
    if (decoded.payload[claim] !== undefined) {
      console.log(`${claim}:`, decoded.payload[claim]);
    }
  });

  console.log("\n📝 Full token structure:");
  console.log("Header (base64):", decoded.raw.header);
  console.log("Payload (base64):", decoded.raw.payload);
  console.log(
    "Signature (base64):",
    decoded.raw.signature.substring(0, 30) + "..."
  );
}

/**
 * Validates if a JWT token has required claims for LiveKit
 * @param token - The JWT token to validate
 * @returns Validation result
 */
export function validateLiveKitToken(token: string): {
  isValid: boolean;
  errors: string[];
  decoded?: any;
} {
  const errors: string[] = [];
  const decoded = decodeJWT(token);

  if (!decoded) {
    errors.push("Invalid JWT format");
    return { isValid: false, errors };
  }

  // Check required claims
  if (!decoded.payload.sub) {
    errors.push("Missing subject (sub) claim");
  }

  if (!decoded.payload.iss) {
    errors.push("Missing issuer (iss) claim");
  }

  if (!decoded.payload.exp) {
    errors.push("Missing expiration (exp) claim");
  } else {
    const expDate = new Date(decoded.payload.exp * 1000);
    if (expDate < new Date()) {
      errors.push("Token has expired");
    }
  }

  // Check for LiveKit API key pattern
  const issuer = decoded.payload.iss;
  if (issuer && typeof issuer === "string") {
    if (issuer.includes("test") && !issuer.includes("live")) {
      console.warn("⚠️ Token appears to be using test API key");
    }

    if (!issuer.includes("livekit")) {
      errors.push("Issuer does not appear to be a LiveKit API key");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    decoded: decoded.payload,
  };
}
