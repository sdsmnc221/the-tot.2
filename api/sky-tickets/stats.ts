import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSkyTicketStats } from "../utils/redis.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      const stats = await getSkyTicketStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error getting ticket stats:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to get stats",
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: "Method not allowed",
  });
}
