import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DLQTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get("http://localhost:3000/dlq");
        setRows(res.data.items || []);
      } catch (err) {
        console.error("DLQ fetch failed:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow mt-6">
      <h3 className="text-sm text-gray-400 mb-3">Dead Letter Queue</h3>
      <button
        onClick={async () => {
          await axios.delete("http://localhost:3000/dlq");
        }}
        className="text-xs text-gray-50 hover:text-red-400 bg-gray-700 px-4 py-2 rounded-lg mb-2"
      >
        Clear DLQ
      </button>

      {rows.length === 0 ? (
        <div className="text-gray-500 text-sm">No failed events 🎉</div>
      ) : (
        <div className="max-h-64 overflow-y-auto border border-gray-800 rounded-lg">
          {rows.map((row, i) => (
            <div key={i} className="border-b border-gray-800 last:border-none">
              {/* ROW HEADER */}
              <div
                className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-800"
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              >
                <div className="text-sm">
                  <span
                    className={`font-medium ${row.reason.includes("REDIS") ? "text-yellow-400" : "text-red-400"}`}
                  ></span>
                  <span className="text-gray-500 ml-2">
                    {new Date(row.ts).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-gray-500 text-xs">
                  {expandedIndex === i ? "▲" : "▼"}
                </div>
              </div>

              {/* EXPANDED PAYLOAD */}
              {expandedIndex === i && (
                <div className="bg-black bg-opacity-30 p-3 text-xs text-gray-300 font-mono overflow-x-auto">
                  <pre>{JSON.stringify(row.event, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
