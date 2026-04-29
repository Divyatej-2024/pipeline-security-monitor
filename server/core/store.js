const MAX_EVENTS = Number(process.env.MAX_EVENTS || 2500);

const state = {
  events: [],
  alerts: [],
  byIpRisk: new Map(),
  signalState: { byIp: new Map() },
  orgRiskScore: 0,
};

const appendWithCap = (arr, item) => {
  arr.unshift(item);
  if (arr.length > MAX_EVENTS) arr.pop();
};

const upsertIpRisk = (ipAddress, score) => {
  const current = state.byIpRisk.get(ipAddress) || 0;
  const next = current + score;
  state.byIpRisk.set(ipAddress, next);
  return next;
};

const resetStore = () => {
  state.events = [];
  state.alerts = [];
  state.byIpRisk = new Map();
  state.signalState = { byIp: new Map() };
  state.orgRiskScore = 0;
};

module.exports = {
  state,
  appendWithCap,
  upsertIpRisk,
  resetStore,
};
