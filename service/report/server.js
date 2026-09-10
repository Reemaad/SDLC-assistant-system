// Load express, the library that listens for web requests and sends answers back.
const express = require("express");

// Create the application object. Everything is attached to this.
const app = express();

// Read the port number from the environment, or use 8080 if nobody set one.
// A port is the numbered door on the machine that this program listens at.
const PORT = process.env.PORT || 8080;

// A name for this service, used in every log line so we know who spoke.
const SERVICE = "report";

// The container id, so when we run three copies we can see which one answered.
// Docker sets HOSTNAME automatically to a short random id.
const INSTANCE = process.env.HOSTNAME || "local";

// A helper that prints one structured log line as JSON.
function log(fields) {
  const line = { ts: new Date().toISOString(), service: SERVICE, instance: INSTANCE };
  Object.assign(line, fields);
  console.log(JSON.stringify(line));
}

// A helper that prints one log line as JSON, on a single line.
// Structured logs can be searched by a machine. Free text cannot.
function log(fields) {
  // Start with the information that every line must carry.
  const line = {
    // When it happened, in a standard format that sorts correctly.
    ts: new Date().toISOString(),
    // Which service produced the line.
    service: SERVICE,
    // Which copy of the service produced the line.
    instance: INSTANCE
  };
  // Copy in the extra fields the caller gave us.
  Object.assign(line, fields);
  // Print the whole thing as one line of JSON text.
  console.log(JSON.stringify(line));
}

// Door 1: the health check. Monitoring calls this to ask "are you alive?".
app.get("/health", function (req, res) {
  // Answer with a small JSON object and the default status 200.
  res.json({ status: "ok", service: SERVICE, instance: INSTANCE });
});

// Start listening. The first argument is the port, the second runs once we are ready.
app.listen(PORT, function () {
  // Announce that we are open for business.
  log({ level: "info", event: "started", port: PORT });
});