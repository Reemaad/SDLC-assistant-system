const axios = require("axios");
const { createClient } = require("redis");

const REPORT_SERVICE_URL = process.env.REPORT_SERVICE_URL || "http://report:8080";
const CAPACITY_ANALYSIS_SERVICE_URL = process.env.CAPACITY_ANALYSIS_SERVICE_URL || "http://capacity-analysis:8083";

const reportPayload = {
  id: 1,
  availableHours: 240,
  teamMembers: [
    {
      id: 1,
      name: "Ahmed",
      role: "Developer",
      assignedHours: 80
    },
    {
      id: 2,
      name: "Mohammed",
      role: "Developer",
      assignedHours: 60
    },
    {
      id: 3,
      name: "Sara",
      role: "QA",
      assignedHours: 40
    }
  ]
};

async function main() {
  try {
    console.log("=== AFTER ===");

    // 1. HTTP Call to Report Service
    const teamResponse = await axios.post(
      `${REPORT_SERVICE_URL}/team-members`,
      reportPayload
    );
    console.log("Team:");
    console.log(teamResponse.data);

    // 2. HTTP Call to Capacity Analysis Service
    const capacityResponse = await axios.post(
      `${CAPACITY_ANALYSIS_SERVICE_URL}/generate-analysis`,
      reportPayload
    );
    console.log("\nCapacity Analysis:");
    console.log(capacityResponse.data);

  } catch (error) {
    console.error("HTTP Request Error:", error.response?.data || error.message);
  }
}

main();


const express = require("express");

const app = express();

const PORT = process.env.PORT || 8080;

const SERVICE = "core";

const INSTANCE = process.env.HOSTNAME || "local";

const SESSION_STORE = process.env.SESSION_STORE || "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

const REPORTS = [{
  "report_id": "REP-2026-001",
  "devs_capacity": [
    {
      "id": "DEV-101",
      "name": "Sarah Ahmed",
      "capacity": 40
    },
    {
      "id": "DEV-102",
      "name": "Tariq Mansour",
      "capacity": 35
    },
    {
      "id": "DEV-103",
      "name": "Lina Khan",
      "capacity": 20
    }
  ],
  "issues": [
    {
      "id": "ISSUE-501",
      "estimation": 8
    },
    {
      "id": "ISSUE-502",
      "estimation": 13
    },
    {
      "id": "ISSUE-503",
      "estimation": 5
    }
  ]
}];

const memoryReport = {};

let redis = null;

let redisReady = false;

function log(fields) {
  const line = { ts: new Date().toISOString(), service: SERVICE, instance: INSTANCE };
  Object.assign(line, fields);
  console.log(JSON.stringify(line));
}

async function connectRedis() {
  if (SESSION_STORE !== "redis") {
    log({ level: "warn", event: "session_store", store: "memory", note: "carts are not shared between copies" });
    return;
  }
  redis = createClient({ url: REDIS_URL });
  redis.on("error", function (err) {
    redisReady = false;
    log({ level: "error", event: "redis_error", message: String(err.message) });
  });
  await redis.connect();
  redisReady = true;
  log({ level: "info", event: "session_store", store: "redis", url: REDIS_URL });
}

async function readReport(sessionId) {
  if (SESSION_STORE !== "redis") {
    return memoryReport[sessionId] || [];
  }
  const text = await redis.get("report:" + sessionId);
  if (!text) {
    return [];
  }
  return JSON.parse(text);
}


async function writeReport(sessionId, lines) {
  if (SESSION_STORE !== "redis") {
    memoryReport[sessionId] = lines;
    return;
  }
  await redis.set("report:" + sessionId, JSON.stringify(lines), { EX: 3600 });
}


function log(fields) {
  const line = {
    ts: new Date().toISOString(),
    service: SERVICE,
    instance: INSTANCE
  };
  Object.assign(line, fields);
  console.log(JSON.stringify(line));
}

app.get("/health", function (req, res) {
  res.json({ status: "ok", service: SERVICE, instance: INSTANCE });
});


app.get("/v1/report/:sessionId/save/:sku", async function (req, res) {
  const sessionId = req.params.sessionId;
  const sku = req.params.sku;
  if (!REPORTS[sku]) {
    res.status(404).json({ error: "report_not_found", message: "No report with sku " + sku });
    return;
  }
  const lines = await readReport(sessionId);
  lines.push({ sku: sku, quantity: 1, added_by: INSTANCE });
  await writeReport(sessionId, lines);
  log({ level: "info", event: "report_saved", session: sessionId, sku: sku, lines: lines.length });
  res.json({ session: sessionId, served_by: INSTANCE, store: SESSION_STORE, lines: lines });
});


app.get("/v1/report/:sessionId", async function (req, res) {
  const sessionId = req.params.sessionId;
  const lines = await readReport(sessionId);
  log({ level: "info", event: "report_read", session: sessionId, lines: lines.length });
  res.json({ session: sessionId, served_by: INSTANCE, store: SESSION_STORE, lines: lines });
});

const redisPort = process.env.REDIS_PORT || 6379;

connectRedis()
  .then(function () {
    app.listen(redisPort, function () {
      log({ level: "info", event: "started", port: redisPort, store: SESSION_STORE });
    });
  })
  .catch(function (err) {
    log({ level: "error", event: "startup_failed", message: String(err.message) });
    process.exit(1);
  });





app.listen(PORT, function () {
  log({ level: "info", event: "started", port: PORT });
});