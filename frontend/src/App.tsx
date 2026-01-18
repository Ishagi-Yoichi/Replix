import React, { useEffect, useState } from "react";
import { fetchMetrics, MetricsData } from "./services/metrics";
import Dashboard from "./components/Dashboard";

type HistoryPoint = {
  timestamp: number;
  eps: number;
  lag: number;
};

function App() {
  const [latest, setLatest] = useState<MetricsData | null>(null);
  const [history,setHistory] = useState<HistoryPoint[]>([]);


  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const metrics = await fetchMetrics();
        setLatest(metrics);
        setHistory(prev =>[
          ...prev.slice(-300),//keep last 300 points(5 min @1s interval)
          {
            timestamp:Date.now(),
            eps:metrics.eventsPerSecond,
            lag:metrics.slotLagBytes ?? 0,
          }
        ]);
      } catch (err) {
        console.error("Metrics fetch failed:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Dashboard latest={latest} history={history}/>
   );
}

export default App;
