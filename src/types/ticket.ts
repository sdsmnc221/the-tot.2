export interface RedisTicketRecord {
  ticketNumber: string;
  skyType: string;
  generatedAt: string;
  downloaded: boolean;
}

export interface TicketData {
  id: string;
  ticketNumber: string;
  generatedAt: Date;
  skyType: "sky1" | "sky2";
  downloaded?: boolean;
  passengerName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  ticket?: T;
  error?: string;
}
