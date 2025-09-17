import type { VercelRequest, VercelResponse } from "@vercel/node";
import { updateSkyTicket } from "../utils/redis.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "PATCH") {
    try {
      const { ticketNumber } = req.query;

      if (!ticketNumber || typeof ticketNumber !== "string") {
        return res.status(400).json({
          success: false,
          error: "Ticket number required",
        });
      }

      const updatedTicket = await updateSkyTicket(ticketNumber, {
        downloaded: true,
        downloadedAt: new Date(),
      });

      if (!updatedTicket) {
        return res.status(404).json({
          success: false,
          error: "Ticket not found",
        });
      }

      return res.status(200).json({
        success: true,
        ticket: updatedTicket,
      });
    } catch (error) {
      console.error("Error marking ticket as downloaded:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update ticket",
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: "Method not allowed",
  });
}
