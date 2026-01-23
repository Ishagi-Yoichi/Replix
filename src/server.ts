import express from "express";
import type { Metrics } from "./metrics.js";
import type { DeadLetterQueue } from "./dlq.js";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

export function startHttpServer(
  metrics: Metrics,
  dlq:DeadLetterQueue
) {
  const app = express();

  app.use(cors());
  app.set('etag', false); // optional for polling freshness
  // HEALTH ENDPOINT
  app.get("/health", (req, res) => {
    const snap = metrics.snapshot();
    if (snap.status === "UP") {
      res.json({ status: "UP" });
    } else {
      res.status(503).json({ status: "DOWN" });
    }
  });

  // METRICS ENDPOINT
  app.get("/metrics", async (req, res) => {
    // ensure DLQ size is fresh
   if(dlq.size){
    const size = await dlq.size();
    metrics.updateDlqSize(size);
   }
   res.json(metrics.snapshot());
  });

  app.get("/dlq", async (req, res) => {
    try {
      const size = await dlq.size();
      const items = await dlq.peek(0, Math.min(size - 1, 100)); // cap at 100 items
      res.json({ size, items });
    } catch (err) {
      console.error("Failed to fetch DLQ:", err);
      res.status(500).json({ error: "DLQ fetch failed" });
    }
  });
  
  

  app.get("/",(req,res)=>{
    res.send("Hello");
  })

  const PORT = process.env.METRICS_PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Metrics API running on http://localhost:${PORT}`);
  });
}
