
const axios = require("axios");

// ============================================================
// CONFIGURATION
// ============================================================

// When this app runs on your Mac:
const JIRA_INTEGRATION_URL =
  process.env.JIRA_INTEGRATION_URL || "http://jira-integration:8080";

// When this app runs inside Docker Compose, use:
// http://jira-integration:8082

const SKU = "WVP-490";

// ============================================================
// JIRA INTEGRATION TEST
// ============================================================

async function testJiraIntegration() {
  console.log("=================================");
  console.log("JIRA INTEGRATION TEST");
  console.log("=================================");

  console.log("Jira Integration URL:", JIRA_INTEGRATION_URL);
  console.log("SKU:", SKU);

  try {
    // ----------------------------------------------------------
    // 1. Check Jira Integration health
    // ----------------------------------------------------------

    console.log("\n1. Checking Jira Integration health...");

    const healthResponse = await axios.get(
      `${JIRA_INTEGRATION_URL}/health`
    );

    console.log("Health response:");
    console.log(healthResponse.data);

    // ----------------------------------------------------------
    // 2. Call Jira Integration
    // ----------------------------------------------------------

    console.log("\n2. Calling Jira Integration...");

    const jiraResponse = await axios.get(
      `${JIRA_INTEGRATION_URL}/jira/${SKU}`
    );

    console.log("Jira response:");
    console.log(jiraResponse.data);

    // ----------------------------------------------------------
    // 3. Print result
    // ----------------------------------------------------------

    console.log("\n=================================");
    console.log("JIRA INTEGRATION TEST SUCCESS");
    console.log("=================================");

  } catch (error) {
    console.error("\n=================================");
    console.error("JIRA INTEGRATION TEST FAILED");
    console.error("=================================");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

// ============================================================
// START
// ============================================================

testJiraIntegration();