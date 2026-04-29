import React from "react";

const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };

export function AlertsTable({ alerts, onAcknowledge, onSelectIp }) {
  const sorted = [...alerts].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div style={{ background: "#11202b", border: "1px solid #254257", borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Live Alerts</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Threat</th><th>IP</th><th>Priority</th><th>Risk</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((a) => (
            <tr key={a.id}>
              <td>{a.threat_type}</td>
              <td><button onClick={() => onSelectIp(a.source_ip)}>{a.source_ip}</button></td>
              <td style={{ textTransform: "capitalize" }}>{a.priority}</td>
              <td>{a.risk_score}</td>
              <td>{a.status}</td>
              <td>
                {a.status === "open" ? (
                  <button onClick={() => onAcknowledge(a.id)}>Acknowledge</button>
                ) : "Done"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
