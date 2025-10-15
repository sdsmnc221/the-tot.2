import { Redis } from "@upstash/redis";

// Validate environment variables
const REDIS_URL = process.env.KV_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REDIS_REST_TOKEN;

if (!REDIS_URL || !REDIS_TOKEN) {
  throw new Error(
    "Missing required environment variables: KV_REDIS_REST_URL and KV_REDIS_REST_TOKEN"
  );
}

// Initialize Redis client
export const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

export const SKY_TICKETS_KEY = "sky-tickets";

export interface SkyTicketEntry {
  id: string;
  ticketNumber: string;
  skyType: "sky1" | "sky2";
  generatedAt: string | Date;
  downloaded: boolean;
  downloadedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
  passengerName?: string;
}

export async function getSkyTickets(limit = 50): Promise<SkyTicketEntry[]> {
  try {
    const tickets = await redis.get(SKY_TICKETS_KEY);
    const ticketsArray: SkyTicketEntry[] = Array.isArray(tickets)
      ? (tickets as SkyTicketEntry[])
      : [];

    // Convert date strings back to Date objects
    const convertedTickets = ticketsArray.map((ticket) => ({
      ...(ticket as SkyTicketEntry),
      generatedAt: new Date((ticket as SkyTicketEntry).generatedAt),
      downloadedAt: (ticket as SkyTicketEntry).downloadedAt
        ? new Date((ticket as any).downloadedAt)
        : undefined,
    }));

    return convertedTickets.slice(0, limit);
  } catch (error) {
    console.error("Error getting sky tickets from Redis:", error);
    return [];
  }
}

export async function getSkyTicketById(
  ticketNumber: string
): Promise<SkyTicketEntry | null> {
  try {
    // First try to get from individual key
    const ticket = await redis.get(`sky-ticket:${ticketNumber}`);
    if (ticket) {
      return {
        ...(ticket as SkyTicketEntry),
        generatedAt: new Date((ticket as SkyTicketEntry).generatedAt),
        downloadedAt: (ticket as SkyTicketEntry).downloadedAt
          ? new Date((ticket as any).downloadedAt)
          : undefined,
      };
    }

    // Fallback: search in tickets list
    const tickets = await getSkyTickets();
    return tickets.find((t) => t.ticketNumber === ticketNumber) || null;
  } catch (error) {
    console.error("Error getting sky ticket by number " + ticketNumber, error);
    return null;
  }
}

export async function saveSkyTicket(
  ticketData: SkyTicketEntry
): Promise<SkyTicketEntry> {
  try {
    // Get existing tickets
    const existingData = await redis.get(SKY_TICKETS_KEY);
    const tickets = Array.isArray(existingData) ? existingData : [];

    // Add new ticket to the beginning
    tickets.unshift(ticketData);

    // Keep only last 1000 tickets
    if (tickets.length > 1000) {
      tickets.splice(1000);
    }

    // Save the updated list back to Redis
    await redis.set(SKY_TICKETS_KEY, tickets);

    // Also save individual ticket with expiration (90 days)
    await redis.set(`sky-ticket:${ticketData.ticketNumber}`, ticketData, {
      ex: 90 * 24 * 60 * 60, // 90 days in seconds
    });

    return ticketData;
  } catch (error) {
    console.error("Error saving sky ticket to Redis:", error);
    return ticketData;
  }
}

export async function updateSkyTicket(
  ticketNumber: string,
  updates: Partial<SkyTicketEntry>
): Promise<SkyTicketEntry | null> {
  try {
    // Get the existing ticket
    const existingTicket = await getSkyTicketById(ticketNumber);
    if (!existingTicket) {
      return null;
    }

    // Merge updates
    const updatedTicket: SkyTicketEntry = {
      ...existingTicket,
      ...updates,
      ticketNumber, // Ensure ticket number doesn't change
    };

    // Save individual ticket
    await redis.set(`sky-ticket:${ticketNumber}`, updatedTicket, {
      ex: 90 * 24 * 60 * 60, // 90 days in seconds
    });

    // Update in the main list
    const existingData = await redis.get(SKY_TICKETS_KEY);
    const tickets = Array.isArray(existingData) ? existingData : [];

    const ticketIndex = tickets.findIndex(
      (ticket: any) => ticket.ticketNumber === ticketNumber
    );
    if (ticketIndex !== -1) {
      tickets[ticketIndex] = updatedTicket;
      await redis.set(SKY_TICKETS_KEY, tickets);
    }

    return updatedTicket;
  } catch (error) {
    console.error("Error updating sky ticket:", error);
    return null;
  }
}

export async function getSkyTicketStats() {
  try {
    const ticketsData = await redis.get(SKY_TICKETS_KEY);
    const tickets = Array.isArray(ticketsData) ? ticketsData : [];

    const downloadedCount = tickets.filter((t: any) => t.downloaded).length;
    const sky1Count = tickets.filter((t: any) => t.skyType === "sky1").length;
    const sky2Count = tickets.filter((t: any) => t.skyType === "sky2").length;
    const namedTicketsCount = tickets.filter(
      (t: any) => t.passengerName && t.passengerName.trim()
    ).length;

    return {
      totalTickets: tickets.length,
      downloadedTickets: downloadedCount,
      pendingTickets: tickets.length - downloadedCount,
      sky1Tickets: sky1Count,
      sky2Tickets: sky2Count,
      namedTickets: namedTicketsCount,
      anonymousTickets: tickets.length - namedTicketsCount,
      redisConnected: true,
    };
  } catch (error: any) {
    console.error("Error getting sky ticket storage stats:", error);
    return {
      totalTickets: 0,
      downloadedTickets: 0,
      pendingTickets: 0,
      sky1Tickets: 0,
      sky2Tickets: 0,
      namedTickets: 0,
      anonymousTickets: 0,
      redisConnected: false,
      error: error.message,
    };
  }
}
