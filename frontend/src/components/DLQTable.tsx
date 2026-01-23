import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DLQTable() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await axios.get("http://localhost:3000/dlq");
      setRows(res.data.items);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  

  return (
    <div>
      <h4>Dead Letter Queue</h4>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Timestamp</th>
            <th className="text-left">Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.ts}</td>
              <td>{r.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
