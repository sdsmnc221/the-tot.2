import express from "express";
import {
  saveSkyTicket,
  updateSkyTicket,
  getSkyTicketStats,
  type SkyTicketEntry,
} from "../utils/redis";

const router = express.Router();

// POST /api/sky-tickets - Create new ticket
router.post("/sky-tickets", async (req, res) => {
  try {
    const { ticketNumber, skyType } = req.body;

    if (!ticketNumber || !skyType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: ticketNumber, skyType",
      });
    }

    // Validate skyType
    if (!["sky1", "sky2"].includes(skyType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid skyType. Must be sky1 or sky2",
      });
    }

    // Get client info
    const userAgent = req.headers["user-agent"] || "";
    const ipAddress = req.ip || req.connection.remoteAddress || "";

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

    res.json({
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
    res.status(500).json({
      success: false,
      error: "Failed to create ticket",
    });
  }
});

// PATCH /api/sky-tickets/:ticketNumber/download - Mark as downloaded
router.patch("/sky-tickets/:ticketNumber/download", async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    if (!ticketNumber) {
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

    res.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error marking ticket as downloaded:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update ticket",
    });
  }
});

// GET /api/sky-tickets/stats - Get ticket statistics
router.get("/sky-tickets/stats", async (_req, res) => {
  try {
    const stats = await getSkyTicketStats();
    res.json(stats);
  } catch (error) {
    console.error("Error getting ticket stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get stats",
    });
  }
});

export default router;
