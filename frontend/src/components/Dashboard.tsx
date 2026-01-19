import React from "react";
import { MetricsData } from "../services/metrics";
import LagChart from "./LagChart";
import EventsChart from "./EventsChart";

type HistoryPoint = {
    timestamp: number;
    eps: number;
    lag: number;
  };

interface Props {
  latest:MetricsData | null;
  history: HistoryPoint[];
}

function Dashboard({ latest,history }: Props) {
    if (!latest) return <div>Loading...</div>;
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded text-white ${latest.status === "UP" ? "bg-green-600" : "bg-red-600"}`}>
            {latest.status}
          </span>
          <span className="px-3 py-1 bg-gray-200 rounded">
            DLQ: {latest.dlqSize}
          </span>
          <span className="px-3 py-1 bg-gray-200 rounded">
            Total Events: {latest.eventsTotal}
          </span>
        </div>
    
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EventsChart history={history} />
          <LagChart history={history} />
        </div>
      </div>
    );
    
}

export default Dashboard;
