// api/sky-tickets/index.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { saveSkyTicket, SkyTicketEntry } from "../utils/redis.js";
import {
  getClientIP,
  getUserAgent,
  validateTicketData,
} from "../utils/helpers.js";

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
