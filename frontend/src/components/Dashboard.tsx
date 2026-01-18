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
    <div>
    <h3>Status: <span style={{ color: latest.status === "UP" ? "green" : "red" }}>{latest.status}</span></h3>
    <h4>DLQ Size: {latest.dlqSize}</h4>

    <EventsChart history={history} />
    <LagChart history={history} />
  </div>
  );
}

export default Dashboard;
