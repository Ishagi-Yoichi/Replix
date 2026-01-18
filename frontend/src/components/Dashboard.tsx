import React from "react";
import { MetricsData } from "../services/metrics";
import LagChart from "./LagChart";
import EventsChart from "./EventsChart";

interface Props {
  data: MetricsData;
}

function Dashboard({ data }: Props) {
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <strong>Status:</strong>{" "}
        <span style={{ color: data.status === "UP" ? "green" : "red" }}>
          {data.status}
        </span>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <strong>DLQ Size:</strong> {data.dlqSize}
      </div>

      <EventsChart eventsPerSecond={data.eventsPerSecond} />
      <LagChart slotLagBytes={data.slotLagBytes ?? 0} />
    </div>
  );
}

export default Dashboard;
