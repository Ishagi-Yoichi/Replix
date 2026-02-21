import React, { useEffect, useState } from "react";

export default function EventStream() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000/");
    ws.onopen = () => console.log("[WS] Open");
    ws.onclose = () => console.log("[WS Close");
    ws.onerror = (err) => console.log("[WS ERROR]", err);
    ws.onmessage = (msg) => {
      const event = JSON.parse(msg.data);

      setEvents((prev) => [
        event,
        ...prev.slice(0, 50), // keep last 50 events
      ]);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow mt-6">
      <h3 className="text-sm text-gray-400 mb-3">Live Event Stream</h3>

      <div className="max-h-64 overflow-y-auto space-y-2">
        {events.map((e, i) => (
          <div
            key={i}
            className="text-xs font-mono bg-black bg-opacity-30 px-2 py-1 rounded"
          >
            <span
              className={
                e.type === "insert"
                  ? "text-green-400"
                  : e.type === "update"
                    ? "text-yellow-400"
                    : "text-red-400"
              }
            >
              {e.type.toUpperCase()}
            </span>

            <span className="text-gray-500 ml-2">{e.table}</span>

            <span className="text-gray-600 ml-2">
              {new Date(e.ts).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
