import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

type HistoryPoint ={
    timestamp: number;
    eps: number;
    lag: number;
}
export default function LagChart({ history}:{history:HistoryPoint[]} ) {
  return (
    <div>
      <h4>Slot Lag (bytes)</h4>
      <LineChart width={600} height={250} data={history}>
        <Line type="monotone" dataKey="lag" stroke="#8884d8" dot={false} />
        <CartesianGrid stroke="#ccc" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(t) => new Date(t).toLocaleTimeString()}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(t) => new Date(t).toLocaleTimeString()}
        />
      </LineChart>
    </div>
  );
}
