import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type HistoryPoint = {
  timestamp: number;
  eps: number;
  lag: number;
};

export default function EventsChart({ history }: { history: HistoryPoint[] }) {
  return (
    <div>
      <h4>Events Per Second (EPS)</h4>
      <LineChart width={600} height={250} data={history}>
        <Line type="monotone" dataKey="eps" stroke="#82ca9d" dot={false} />
        <CartesianGrid stroke="#1f2933" />
        <XAxis
          dataKey="timestamp"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickFormatter={(t) => new Date(t).toLocaleTimeString()}
        />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #1f2933",
          }}
        />
      </LineChart>
    </div>
  );
}
