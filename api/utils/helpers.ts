import type { VercelRequest } from "@vercel/node";

export function getClientIP(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return ip || req.socket?.remoteAddress || "unknown";
}

export function getUserAgent(req: VercelRequest): string {
  return req.headers["user-agent"] || "unknown";
}

export function validateTicketData(body: any): {
  valid: boolean;
  error?: string;
} {
  const { ticketNumber, skyType, passengerName } = body;

  if (!ticketNumber || typeof ticketNumber !== "string") {
    return { valid: false, error: "Missing or invalid ticketNumber" };
  }

  if (!skyType || !["sky1", "sky2"].includes(skyType)) {
    return { valid: false, error: "Invalid skyType. Must be sky1 or sky2" };
  }

  // Validate passenger name if provided
  if (passengerName !== undefined) {
    if (typeof passengerName !== "string") {
      return { valid: false, error: "Invalid passengerName. Must be a string" };
    }

    // Check length limits
    if (passengerName.length > 50) {
      return {
        valid: false,
        error: "passengerName must be 50 characters or less",
      };
    }

    // Optional: Check for potentially harmful content
    const trimmedName = passengerName.trim();
    if (trimmedName.length === 0) {
      // Empty string after trimming is okay, we'll treat it as undefined
    }
  }

  return { valid: true };
}
