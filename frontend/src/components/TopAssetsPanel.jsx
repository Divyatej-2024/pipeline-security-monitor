import React from "react";

export function TopAssetsPanel({ assets }) {
  return (
    <div style={{ background: "#11202b", border: "1px solid #254257", borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Top Risky Assets</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th>Asset</th><th>IP</th><th>Risk</th><th>Open Alerts</th></tr></thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.asset_id}>
              <td>{asset.asset_id}</td><td>{asset.ip_address}</td><td>{asset.risk_score}</td><td>{asset.alert_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
