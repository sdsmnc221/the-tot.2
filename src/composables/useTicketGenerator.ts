import { ref, readonly } from "vue";
import type { TicketData, ApiResponse } from "../types/ticket";

export function useTicketGenerator() {
  const isGenerating = ref(false);
  const currentTicket = ref<TicketData | null>(null);
  const error = ref<string | null>(null);

  // Use the Vercel domain for production
  const API_BASE = import.meta.env.VITE_API_URL!;

  // Randomly select sky type
  const selectRandomSky = (): "sky1" | "sky2" => {
    return Math.random() < 0.5 ? "sky1" : "sky2";
  };

  // Generate ticket and save to Redis via API
  const generateTicket = async (passengerName?: string): Promise<TicketData | null> => {
    try {
      isGenerating.value = true;
      error.value = null;

      const skyType = selectRandomSky();

      // Prepare request body (server will generate unique ticket number)
      const requestBody: any = {
        skyType,
      };

      // Add passenger name if provided
      if (passengerName && passengerName.trim()) {
        requestBody.passengerName = passengerName.trim();
      }

      // Call serverless API
      const response = await fetch(`${API_BASE}/sky-tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
          passengerName: result.ticket.passengerName,
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
    error: error,
    generateTicket,
    markAsDownloaded,
    getStats,
  };
}