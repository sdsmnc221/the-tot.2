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
  const { ticketNumber, skyType } = body;

  if (!ticketNumber || typeof ticketNumber !== "string") {
    return { valid: false, error: "Missing or invalid ticketNumber" };
  }

  if (!skyType || !["sky1", "sky2"].includes(skyType)) {
    return { valid: false, error: "Invalid skyType. Must be sky1 or sky2" };
  }

  return { valid: true };
}

// api/sky-tickets/index.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { saveSkyTicket, SkyTicketEntry } from "../utils/redis";
import {
  getClientIP,
  getUserAgent,
  validateTicketData,
} from "../utils/helpers";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const validation = validateTicketData(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
        });
      }

      const { ticketNumber, skyType } = req.body;

      // Get client info
      const userAgent = getUserAgent(req);
      const ipAddress = getClientIP(req);

      const ticketData: SkyTicketEntry = {
        id: crypto.randomUUID(),
        ticketNumber,
        skyType,
        generatedAt: new Date().toISOString(),
        downloaded: false,
        userAgent,
        ipAddress,
      };

      await saveSkyTicket(ticketData);

      return res.status(200).json({
        success: true,
        ticket: {
          id: ticketData.id,
          ticketNumber: ticketData.ticketNumber,
          skyType: ticketData.skyType,
          generatedAt: ticketData.generatedAt,
        },
      });
    } catch (error) {
      console.error("Error creating sky ticket:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create ticket",
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: "Method not allowed",
  });
}
