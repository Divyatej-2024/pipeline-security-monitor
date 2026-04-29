import React from "react";

export function BreakdownPanel({ breakdown }) {
  return (
    <div style={{ background: "#11202b", border: "1px solid #254257", borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Threat Breakdown (24h)</h3>
      <ul>
        {breakdown.map((item) => (
          <li key={item.threat_type}>{item.threat_type}: {item.count}</li>
        ))}
      </ul>
    </div>
  );
}
