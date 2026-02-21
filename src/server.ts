import express from "express";
import type { Metrics } from "./metrics.js";
import type { DeadLetterQueue } from "./dlq.js";
import dotenv from "dotenv";
import cors from "cors";
import { WebSocketServer } from "ws";

dotenv.config();
let wss: WebSocketServer;

export function startHttpServer(metrics: Metrics, dlq: DeadLetterQueue) {
  const app = express();

  const PORT = process.env.METRICS_PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Metrics API running on http://localhost:${PORT}`);
  });

  wss = new WebSocketServer({ server });
  console.log("[WS] WebSocket server started");

  wss.on("connection", (socket) => {
    console.log("[WS] Client connected");

    socket.on("close", () => {
      console.log("[WS] Client disconnected");
    });

    socket.on("error", (err) => {
      console.log("[WS SOCKET ERROR]", err.message);
    });
  });

  app.use(cors());
  app.set("etag", false); // optional for polling freshness
  // HEALTH ENDPOINT
  app.get("/health", (req, res) => {
    const snap = metrics.snapshot();
    res.status(snap.status === "UP" ? 200 : 503).json({ status: snap.status });
  });

  // METRICS ENDPOINT
  app.get("/metrics", async (req, res) => {
    // ensure DLQ size is fresh
    if (dlq.size) {
      const size = await dlq.size();
      metrics.updateDlqSize(size);
    }
    res.json(metrics.snapshot());
  });

  app.get("/dlq", async (req, res) => {
    try {
      const size = await dlq.size();
      const count = Math.min(size, 100);
      const items = size > 0 ? await dlq.peek(0, count - 1) : []; // cap at 100 items
      res.json({ size, items });
    } catch (err) {
      console.error("Failed to fetch DLQ:", err);
      res.status(500).json({ error: "DLQ fetch failed" });
    }
  });

  app.delete("/dlq", async (req, res) => {
    await dlq.clear();
    res.json({ status: "cleared" });
  });

  app.get("/", (req, res) => {
    res.send("Hello");
  });
}

export function broadcastEvent(event: any) {
  if (!wss) {
    console.log("[WS] No clients / WSS not ready");
    return;
  }
  const data = JSON.stringify(event);
  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch (err) {
        console.log("[WS SEND ERROR]", err);
      }
    }
  });
}
