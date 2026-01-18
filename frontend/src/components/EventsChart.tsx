import React from "react";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip
} from "recharts";

interface Props {
  eventsPerSecond: number;
}

export default function EventsChart({ eventsPerSecond }: Props) {
  const data = [{ name: "eps", value: eventsPerSecond }];

  return (
    <div>
      <h4>Events Per Second</h4>
      <LineChart width={400} height={200} data={data}>
        <Line type="monotone" dataKey="value" stroke="#82ca9d" />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
      </LineChart>
    </div>
  );
}
