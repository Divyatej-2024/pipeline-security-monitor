import React from "react";

export function TrendPanel({ trend }) {
  const max = Math.max(...trend.map((t) => t.count), 1);

  return (
    <div style={{ background: "#11202b", border: "1px solid #254257", borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Event Trend (last 2 hours)</h3>
      <div style={{ display: "flex", alignItems: "end", gap: 3, minHeight: 120 }}>
        {trend.slice(-50).map((point) => (
          <div key={point.time} title={`${point.time}: ${point.count}`} style={{ width: 7, height: `${Math.max(5, (point.count / max) * 110)}px`, background: "#22d3ee" }} />
        ))}
      </div>
    </div>
  );
}
