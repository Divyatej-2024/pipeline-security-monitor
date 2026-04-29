const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const fetchJson = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

export const api = {
  getMetrics: () => fetchJson("/api/metrics"),
  getAlerts: (risk = "") => fetchJson(`/api/alerts${risk ? `?risk=${risk}` : ""}`),
  getTrend: () => fetchJson("/api/events/trend"),
  getBreakdown: () => fetchJson("/api/threats/breakdown"),
  getTopAssets: () => fetchJson("/api/assets/top-risks"),
  acknowledgeAlert: (id) => fetchJson(`/api/alerts/${id}/acknowledge`, { method: "POST" }),
  health: () => fetchJson("/health"),
};

export { API_BASE };
