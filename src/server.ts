import express from "express";
import type { Metrics } from "./metrics.js";
import type { DeadLetterQueue } from "./dlq.js";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

export function startHttpServer(
  metrics: Metrics,
  getDlqSize?:()=>Promise<number>
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
   if(getDlqSize){
    const size = await getDlqSize();
    metrics.updateDlqSize(size);
   }
   res.json(metrics.snapshot());
  });

  app.get("/",(req,res)=>{
    res.send("Hello");
  })

  const PORT = process.env.METRICS_PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Metrics API running on http://localhost:${PORT}`);
  });
}
