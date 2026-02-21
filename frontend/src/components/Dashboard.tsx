import React from "react";
import { MetricsData } from "../services/metrics";
import LagChart from "./LagChart";
import EventsChart from "./EventsChart";
import DLQTable from "./DLQTable";
import ChartCard from "./ChartCard";
import EventStream from "./EventStreams";

type HistoryPoint = {
  timestamp: number;
  eps: number;
  lag: number;
};

interface Props {
  latest: MetricsData | null;
  history: HistoryPoint[];
}

function Dashboard({ latest, history }: Props) {
  if (!latest) return <div>Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="flex flex-wrap gap-4">
        {/* STATUS */}
        <div className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 shadow">
          <span
            className={`font-semibold ${
              latest.status === "UP" ? "text-green-400" : "text-red-400"
            }`}
          >
            ● {latest.status}
          </span>
        </div>

        {/* DLQ */}
        <div className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 shadow">
          DLQ: <span className="text-yellow-400">{latest.dlqSize}</span>
        </div>

        {/* TOTAL EVENTS */}
        <div className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 shadow">
          Events: <span className="text-blue-400">{latest.eventsTotal}</span>
        </div>

        {/* EPS */}
        <div className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 shadow">
          EPS: <span className="text-purple-400">{latest.eventsPerSecond}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <ChartCard title="Events Per Second">
          <EventsChart history={history} />
        </ChartCard>

        <ChartCard title="Replication Slot Lag">
          <LagChart history={history} />
        </ChartCard>

        <EventStream />
      </div>
      <DLQTable />
    </div>
  );
}

export default Dashboard;
