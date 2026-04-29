const threatTypes = [
  "failed_login",
  "port_scan",
  "suspicious_traffic",
  "malware_download",
  "policy_violation",
  "anomalous_login",
];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPick = (arr) => arr[random(0, arr.length - 1)];

const buildSyntheticEvent = () => {
  const ip = `${random(11, 223)}.${random(0, 255)}.${random(0, 255)}.${random(1, 254)}`;
  const assetId = `asset-${random(1, 45).toString().padStart(3, "0")}`;
  const eventType = randomPick(threatTypes);
  const port = random(1, 65535);
  const bytesOut = random(100, 900000);

  return {
    sourceIp: ip,
    assetId,
    eventType,
    occurredAt: new Date().toISOString(),
    metadata: {
      port,
      bytesOut,
      userAgent: randomPick(["curl/8.6", "python-requests/2.31", "chrome/123", "node-fetch"]),
      region: randomPick(["eu-west", "us-east", "ap-south"]),
    },
  };
};

module.exports = { buildSyntheticEvent };
