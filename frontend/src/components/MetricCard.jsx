import React from "react";

export function MetricCard({ label, value, accent }) {
  return (
    <div style={{ background: "#11202b", border: "1px solid #254257", borderRadius: 12, padding: 16 }}>
      <div style={{ color: "#95b6cb", fontSize: 13 }}>{label}</div>
      <div style={{ color: accent || "#e8f1f8", fontSize: 30, fontWeight: 700, marginTop: 8 }}>{value}</div>
    </div>
  );
}
