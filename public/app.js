const eventsList = document.getElementById("events");
const alertsList = document.getElementById("alerts");
const eventCount = document.getElementById("event-count");
const alertCount = document.getElementById("alert-count");
const lastAlert = document.getElementById("last-alert");
let eventsData = [];
let alertsData = [];

const alertBuckets = {
  labels: ["Critical", "High", "Medium", "Low"],
  data: [0, 0, 0, 0],
};

const chart = new Chart(document.getElementById("alertChart"), {
  type: "bar",
  data: {
    labels: alertBuckets.labels,
    datasets: [
      {
        label: "Alerts",
        data: alertBuckets.data,
        backgroundColor: ["#e11d48", "#f97316", "#facc15", "#38bdf8"],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  },
});

const renderList = (list, items, formatter) => {
  list.innerHTML = "";
  items.slice(0, 10).forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = formatter(item);
    list.appendChild(li);
  });
};

const updateStats = (events, alerts) => {
  eventCount.textContent = events.length;
  alertCount.textContent = alerts.length;
  lastAlert.textContent = alerts[0]?.type || "None";
};

const updateChart = (alerts) => {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  alerts.forEach((alert) => {
    const key = (alert.severity || "low").toLowerCase();
    if (counts[key] !== undefined) counts[key] += 1;
  });
  alertBuckets.data[0] = counts.critical;
  alertBuckets.data[1] = counts.high;
  alertBuckets.data[2] = counts.medium;
  alertBuckets.data[3] = counts.low;
  chart.update();
};

const refresh = async () => {
  const [eventsRes, alertsRes] = await Promise.all([
    fetch("/api/events"),
    fetch("/api/alerts"),
  ]);

  const eventsPayload = await eventsRes.json();
  const alertsPayload = await alertsRes.json();

  eventsData = eventsPayload.events || [];
  alertsData = alertsPayload.alerts || [];

  renderList(eventsList, eventsData, (event) => {
    return `<strong>${event.type}</strong> ${event.message}<small>${event.timestamp}</small>`;
  });
  renderList(alertsList, alertsData, (alert) => {
    return `<strong>${alert.type}</strong> ${alert.message}<small>${alert.timestamp}</small>`;
  });
  updateStats(eventsData, alertsData);
  updateChart(alertsData);
};

const simulate = async (scenario) => {
  await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario }),
  });
};

document.getElementById("simulate-login").addEventListener("click", () => {
  simulate("failed_login");
});
document.getElementById("simulate-scan").addEventListener("click", () => {
  simulate("port_scan");
});
document.getElementById("simulate-secret").addEventListener("click", () => {
  simulate("secret");
});

refresh();
setInterval(refresh, 3000);
