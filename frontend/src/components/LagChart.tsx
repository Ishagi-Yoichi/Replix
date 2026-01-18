import React from "react";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip
} from "recharts";

interface Props {
  slotLagBytes: number;
}

export default function LagChart({ slotLagBytes }: Props) {
  const data = [{ name: "lag", value: slotLagBytes }];

  return (
    <div>
      <h4>Slot Lag (bytes)</h4>
      <LineChart width={400} height={200} data={data}>
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
      </LineChart>
    </div>
  );
}
