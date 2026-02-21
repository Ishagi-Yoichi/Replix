import React from "react";

export default function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow transition-all duration-200 hover:border-gray-700">
      <h3 className="text-sm text-gray-400 mb-2">{title}</h3>
      {children}
    </div>
  );
}
