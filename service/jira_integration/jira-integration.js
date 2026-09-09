const express = require("express");
const { Kafka } = require("kafkajs");

// ============================================================
// CONFIGURATION
// ============================================================

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8082;

const KAFKA_BROKER =
  process.env.KAFKA_BROKER || "localhost:9092";

const REQUEST_TOPIC = "jira.requests";
const RESPONSE_TOPIC = "jira.responses";
const CONSUMER_GROUP = "jira-integration-group";
const SERVICE_NAME = "jira-integration";

// ============================================================
// KAFKA
// ============================================================

const kafka = new Kafka({
  clientId: SERVICE_NAME,
  brokers: [KAFKA_BROKER]
});

const producer = kafka.producer();

const consumer = kafka.consumer({
  groupId: CONSUMER_GROUP
});

// ============================================================
// LOGGING
// ============================================================

function log(level, event, data = {}) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: SERVICE_NAME,
      level,
      event,
      ...data
    })
  );
}

// ============================================================
// MOCK JIRA
// ============================================================

function getJiraIssue(issueKey) {
  return {
    key: issueKey,
    summary: "Mock Jira Issue",
    status: "In Progress",
    assignee: "John Doe"
  };
}

// ============================================================
// SEND RESPONSE TO KAFKA
// ============================================================

async function sendResponse(response) {
  await producer.send({
    topic: RESPONSE_TOPIC,
    messages: [
      {
        key: response.requestId,
        value: JSON.stringify(response)
      }
    ]
  });
}

// ============================================================
// PROCESS JIRA REQUEST
// ============================================================

async function processJiraRequest(request) {
  const { requestId, issueKey } = request;

  if (!requestId) {
    throw new Error("requestId is required");
  }

  if (!issueKey) {
    throw new Error("issueKey is required");
  }

  log("info", "processing_jira_request", {
    requestId,
    issueKey
  });

  // Mock Jira call
  const jiraIssue = getJiraIssue(issueKey);

  // Build response
  const response = {
    requestId,
    success: true,
    issue: jiraIssue
  };

  // Publish response
  await sendResponse(response);

  log("info", "jira_request_completed", {
    requestId,
    issueKey
  });
}

// ============================================================
// KAFKA CONSUMER
// ============================================================

async function startConsumer() {
  await consumer.connect();

  log("info", "kafka_consumer_connected");

  await consumer.subscribe({
    topic: REQUEST_TOPIC,
    fromBeginning: false
  });

  log("info", "kafka_consumer_subscribed", {
    topic: REQUEST_TOPIC
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const rawMessage = message.value?.toString();

      if (!rawMessage) {
        log("warn", "empty_kafka_message");
        return;
      }

      try {
        const request = JSON.parse(rawMessage);

        log("info", "jira_request_received", {
          topic,
          partition,
          requestId: request.requestId,
          issueKey: request.issueKey
        });

        await processJiraRequest(request);

      } catch (error) {
        log("error", "jira_request_failed", {
          error: error.message
        });

        try {
          const request = JSON.parse(rawMessage);

          if (request.requestId) {
            await sendResponse({
              requestId: request.requestId,
              success: false,
              error: error.message
            });
          }

        } catch (responseError) {
          log("error", "failed_to_send_error_response", {
            error: responseError.message
          });
        }
      }
    }
  });
}

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: SERVICE_NAME
  });
});

// ============================================================
// START APPLICATION
// ============================================================

async function start() {
  try {
    log("info", "starting_service", {
      port: PORT,
      kafkaBroker: KAFKA_BROKER
    });

    // Connect Kafka producer
    await producer.connect();

    log("info", "kafka_producer_connected");

    // Start Kafka consumer
    await startConsumer();

    // Start HTTP server
    app.listen(PORT, () => {
      log("info", "service_started", {
        port: PORT
      });
    });

  } catch (error) {
    log("error", "service_startup_failed", {
      error: error.message
    });

    process.exit(1);
  }
}

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

async function shutdown() {
  log("info", "shutting_down");

  try {
    await consumer.disconnect();
    await producer.disconnect();

    log("info", "kafka_connections_closed");

    process.exit(0);

  } catch (error) {
    log("error", "shutdown_failed", {
      error: error.message
    });

    process.exit(1);
  }
}

// ============================================================
// SIGNALS
// ============================================================

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// ============================================================
// RUN
// ============================================================

start();