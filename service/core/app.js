const ReportService = require("../report/report-service.js");

const CapacityAnalysisService =
  require("../capacity_analysis/capacity-analysis.js");


const report = {
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


const reportService = new ReportService();

const capacityAnalysisService =
  new CapacityAnalysisService();


console.log("=== AFTER ===");

console.log("Team:");
console.log(
  reportService.getTeamMembers(report)
);

console.log("\nCapacity Analysis:");
console.log(
  capacityAnalysisService.generateAnalysis(report)
);



// ---------------------------------------------------------------------
// CIRCUIT BREAKER
// A circuit breaker is the electrical fuse in your home, for software.
// After several failures in a row, it stops trying for a while, so we
// fail fast instead of making every shopper wait for a dead system.
// ---------------------------------------------------------------------

// How many failures in a row we have had.
let breakerFailures = 0;

// The time, in milliseconds, until which the breaker stays open.
let breakerOpenUntil = 0;

// How many failures we allow before we stop trying.
const BREAKER_THRESHOLD = 3;

// How long we stop trying for, in milliseconds. 10000 is ten seconds.
const BREAKER_COOLDOWN_MS = 10000;


// Ask the outside shipping partner for a price, with a timeout and a breaker.
async function getSprintStatusFromJira(sku) {
  // Read the clock once.
  const now = Date.now();

  // If the breaker is open, do not even try. Fail immediately.
  if (now < breakerOpenUntil) {
    // Report that we skipped the call on purpose.
    log({ level: "warn", event: "breaker_open", sku: sku, reopens_in_ms: breakerOpenUntil - now });
    // Throw a clear reason the caller can turn into a message.
    throw new Error("circuit_open");
  }

  // The address of an outside shipping partner. It does not exist, on purpose.
const JIRA_URL = process.env.JIRA_URL || "http://jira.invalid/sprint";
const JIRA_TIMEOUT_MS = Number(process.env.JIRA_TIMEOUT_MS || 800);

  // Try the call.
  try {
    // AbortSignal.timeout cancels the request if it takes too long.
    // Without this, one slow partner can hold every one of our workers.
    const response = await fetch(JIRA_URL + "?sku=" + sku, {
      signal: AbortSignal.timeout(JIRA_TIMEOUT_MS)
    });
    // Read the answer.
    const body = await response.json();
    // The call worked, so reset the failure count to zero.
    breakerFailures = 0;
    // Hand the answer back.
    return body;
  } catch (err) {
    // The call failed or timed out. Count it.
    breakerFailures = breakerFailures + 1;
    // Write down what went wrong and how many failures we have now.
    log({ level: "error", event: "shipping_call_failed", failures: breakerFailures, message: String(err.message) });
    // If we have failed enough times, open the breaker and stop trying.
    if (breakerFailures >= BREAKER_THRESHOLD) {
      breakerOpenUntil = Date.now() + BREAKER_COOLDOWN_MS;
      log({ level: "warn", event: "breaker_opened", cooldown_ms: BREAKER_COOLDOWN_MS });
    }
    // Pass the failure up to the caller.
    throw new Error("jira_unavailable");
  }
}
