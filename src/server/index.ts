import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import skyTicketsRouter from "./routes/skyTickets.js";

dotenv.config({ path: [".env.local", ".env"] });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for IP addresses
app.set("trust proxy", true);

// Routes
app.use("/api", skyTicketsRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Sky Ticket API Server running on port ${PORT}`);
});

// frontend/src/types/ticket.ts
export interface TicketData {
  id: string;
  ticketNumber: string;
  generatedAt: Date;
  skyType: "sky1" | "sky2";
  downloaded?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  ticket?: T;
  error?: string;
}
