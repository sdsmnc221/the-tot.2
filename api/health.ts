import type { VercelRequest, VercelResponse } from "@vercel/node";
import { redis } from "./utils/redis.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      // Test Redis connection
      await redis.ping();

      return res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        redis: "connected",
        env: {
          hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
          hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
          nodeEnv: process.env.NODE_ENV || "development",
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "ERROR",
        timestamp: new Date().toISOString(),
        redis: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: "Method not allowed",
  });
}
