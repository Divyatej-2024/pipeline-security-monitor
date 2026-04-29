import React from "react";

export function FilterBar({ riskFilter, setRiskFilter, autoRefresh, setAutoRefresh, selectedIp }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
      <label>Risk Filter:
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
          <option value="">All</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>
      <label>
        <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} /> Auto-refresh
      </label>
      {selectedIp ? <div>Selected IP: <strong>{selectedIp}</strong></div> : null}
    </div>
  );
}
