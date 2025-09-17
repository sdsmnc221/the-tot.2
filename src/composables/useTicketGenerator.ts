import { ref, readonly } from "vue";
import type { TicketData, ApiResponse } from "../types/ticket";

export function useTicketGenerator() {
  const isGenerating = ref(false);
  const currentTicket = ref<TicketData | null>(null);
  const error = ref<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  // Generate unique ticket number in format: Sky.65087-001
  const generateTicketNumber = (): string => {
    const prefix = "Sky";
    // Generate 5-digit number (10000-99999)
    const mainNumber = Math.floor(Math.random() * 90000) + 10000;
    // Generate 3-digit sequence (001-999)
    const sequence = Math.floor(Math.random() * 999) + 1;
    const sequenceFormatted = sequence.toString().padStart(3, "0");
    return `${prefix}.${mainNumber}-${sequenceFormatted}`;
  };

  // Randomly select sky type
  const selectRandomSky = (): "sky1" | "sky2" => {
    return Math.random() < 0.5 ? "sky1" : "sky2";
  };

  // Generate ticket and save to Redis via API
  const generateTicket = async (): Promise<TicketData | null> => {
    try {
      isGenerating.value = true;
      error.value = null;

      const ticketNumber = generateTicketNumber();
      const skyType = selectRandomSky();

      // Call API to save ticket
      const response = await fetch(`${API_BASE}/sky-tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketNumber,
          skyType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();

      if (result.success && result.ticket) {
        const ticketData: TicketData = {
          id: result.ticket.id,
          ticketNumber: result.ticket.ticketNumber,
          skyType: result.ticket.skyType,
          generatedAt: new Date(result.ticket.generatedAt),
          downloaded: false,
        };

        currentTicket.value = ticketData;
        return ticketData;
      } else {
        throw new Error(result.error || "Failed to generate ticket");
      }
    } catch (err: any) {
      error.value = err.message || "Failed to generate ticket";
      console.error("Generation error:", err);
      return null;
    } finally {
      isGenerating.value = false;
    }
  };

  // Mark ticket as downloaded
  const markAsDownloaded = async (ticketNumber: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE}/sky-tickets/${ticketNumber}/download`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      return result.success;
    } catch (err) {
      console.error("Failed to mark as downloaded:", err);
      return false;
    }
  };

  // Get ticket stats
  const getStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/sky-tickets/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error("Failed to get stats:", err);
      return null;
    }
  };

  return {
    isGenerating: readonly(isGenerating),
    currentTicket: currentTicket,
    error: readonly(error),
    generateTicket,
    markAsDownloaded,
    getStats,
  };
}
