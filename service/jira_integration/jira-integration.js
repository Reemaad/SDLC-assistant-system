const express = require("express");

const app = express();

const PORT = 8082;

const JIRA_URL =
  process.env.JIRA_URL || "http://jira.invalid/sprint";

const JIRA_TIMEOUT_MS =
  Number(process.env.JIRA_TIMEOUT_MS || 800);


// ============================================================
// JIRA INTEGRATION
// ============================================================

async function getSprintStatusFromJira(sku) {

  console.log(`Calling Jira: ${JIRA_URL}?sku=${sku}`);

  try {

    const response = await fetch(
      JIRA_URL + "?sku=" + sku,
      {
        signal: AbortSignal.timeout(JIRA_TIMEOUT_MS)
      }
    );

    if (!response.ok) {
      throw new Error(`Jira returned ${response.status}`);
    }

    return await response.json();

  } catch (error) {

    console.log("Jira call failed:", error.message);

    // Mock Jira response
    return {
      sku: sku,
      sprint: "Sprint 10",
      status: "IN_PROGRESS"
    };
  }
}


// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/health", (req, res) => {

  res.json({
    status: "UP",
    service: "jira-integration"
  });

});


// ============================================================
// JIRA API
// ============================================================

app.get("/jira/:sku", async (req, res) => {

  const result =
    await getSprintStatusFromJira(req.params.sku);

  res.json(result);

});


// ============================================================
// START
// ============================================================

app.listen(PORT, () => {

  console.log(
    `Jira Integration running on port ${PORT}`
  );

});


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getSprintStatusFromJira
};