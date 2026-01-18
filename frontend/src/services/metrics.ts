import axios from "axios";

export interface MetricsData {
  status: "UP" | "DOWN";
  slotLagBytes: number | null;
  eventsTotal: number;
  eventsPerSecond: number;
  dlqSize: number;
  lastLsn: string | null;
  uptimeMs: number;
}

export async function fetchMetrics(): Promise<MetricsData> {
  const res = await axios.get<MetricsData>("http://localhost:3000/metrics");
  return res.data;
}
