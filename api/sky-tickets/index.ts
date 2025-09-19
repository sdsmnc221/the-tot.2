import type { VercelRequest, VercelResponse } from "@vercel/node";
import { saveSkyTicket, getSkyTicketById, SkyTicketEntry } from "../utils/redis.js";
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

      const { skyType, passengerName } = req.body;

      // Generate a unique ticket number (server-side)
      const ticketNumber = await generateUniqueTicketNumber();

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
        passengerName: passengerName || undefined,
      };

      await saveSkyTicket(ticketData);

      return res.status(200).json({
        success: true,
        ticket: {
          id: ticketData.id,
          ticketNumber: ticketData.ticketNumber,
          skyType: ticketData.skyType,
          generatedAt: ticketData.generatedAt,
          passengerName: ticketData.passengerName,
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

// Generate a unique ticket number with database check
async function generateUniqueTicketNumber(): Promise<string> {
  const MAX_ATTEMPTS = 10;
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const prefix = "Sky";
    // Generate 5-digit number (10000-99999)
    const mainNumber = Math.floor(Math.random() * 90000) + 10000;
    // Generate 3-digit sequence (001-999)
    const sequence = Math.floor(Math.random() * 999) + 1;
    const sequenceFormatted = sequence.toString().padStart(3, "0");
    const ticketNumber = `${prefix}.${mainNumber}-${sequenceFormatted}`;

    // Check if this ticket number already exists
    const existingTicket = await getSkyTicketById(ticketNumber);
    
    if (!existingTicket) {
      return ticketNumber; // Found a unique number!
    }

    console.log(`Ticket number ${ticketNumber} already exists, attempt ${attempt}/${MAX_ATTEMPTS}`);
    
    // If we've exhausted attempts, use timestamp-based approach
    if (attempt === MAX_ATTEMPTS) {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      return `Sky.${timestamp}-${Math.floor(Math.random() * 999) + 1}`;
    }
  }

  // This should never happen, but just in case
  throw new Error("Failed to generate unique ticket number");
}

  return res.status(405).json({
    success: false,
    error: "Method not allowed",
  });
}