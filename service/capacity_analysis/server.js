// Load Express, the library that listens for web requests and sends answers back.
const express = require("express");

// Create the application object. Everything is attached to this.
const app = express();

// Allow the application to read JSON request bodies.
app.use(express.json());

// Read the port number from the environment, or use 8080 if nobody set one.
const PORT = process.env.PORT || 8080;

// A name for this service, used in every log line.
const SERVICE = "capacity-analysis";

// Docker automatically sets HOSTNAME to the container ID.
const INSTANCE = process.env.HOSTNAME || "local";

// A helper that prints one structured JSON log on a single line.
function log(fields) {
  const line = {
    ts: new Date().toISOString(),
    service: SERVICE,
    instance: INSTANCE,
  };

  Object.assign(line, fields);

  console.log(JSON.stringify(line));
}

// Door 1: health check.
app.get("/health", function (req, res) {
  res.json({
    status: "ok",
    service: SERVICE,
    instance: INSTANCE,
  });
});

// Door 2: generate a capacity analysis.
//
// Expected request:
// {
//   "availableHours": 240,
//   "teamMembers": [
//     {
//       "id": 1,
//       "name": "Ahmed",
//       "role": "Developer",
//       "assignedHours": 80
//     }
//   ]
// }
app.post("/capacity-analysis", function (req, res) {
  const report = req.body;

  // Validate the top-level report.
  if (
    !report ||
    typeof report.availableHours !== "number" ||
    !Number.isFinite(report.availableHours) ||
    report.availableHours <= 0 ||
    !Array.isArray(report.teamMembers)
  ) {
    log({
      level: "warn",
      event: "invalid_report",
      status: 400,
    });

    return res.status(400).json({
      error: "invalid_report",
      message:
        "availableHours must be a number greater than zero and teamMembers must be an array",
    });
  }

  // Validate every team member.
  const invalidMember = report.teamMembers.find(function (member) {
    return (
      !member ||
      !Number.isInteger(member.id) ||
      typeof member.name !== "string" ||
      member.name.trim() === "" ||
      typeof member.role !== "string" ||
      member.role.trim() === "" ||
      typeof member.assignedHours !== "number" ||
      !Number.isFinite(member.assignedHours) ||
      member.assignedHours < 0
    );
  });

  if (invalidMember) {
    log({
      level: "warn",
      event: "invalid_team_member",
      memberId: invalidMember.id,
      status: 400,
    });

    return res.status(400).json({
      error: "invalid_team_member",
      message:
        "Each team member must have id, name, role, and a non-negative assignedHours value",
    });
  }

  // Add the assigned hours for all team members.
  const totalCapacity = report.teamMembers.reduce(function (total, member) {
    return total + member.assignedHours;
  }, 0);

  // Calculate what percentage of the available hours has been assigned.
  const utilization = Number(
    ((totalCapacity / report.availableHours) * 100).toFixed(2)
  );

  // Determine the capacity status.
  let status;

  if (utilization > 100) {
    status = "OVERLOADED";
  } else if (utilization === 100) {
    status = "FULL";
  } else {
    status = "AVAILABLE";
  }

  const analysis = {
    totalCapacity: totalCapacity,
    utilization: utilization,
    status: status,
  };

  log({
    level: "info",
    event: "capacity_analysis_generated",
    totalCapacity: totalCapacity,
    utilization: utilization,
    status: status,
    httpStatus: 200,
  });

  res.status(200).json(analysis);
});

// Handle invalid JSON request bodies.
app.use(function (error, req, res, next) {
  if (error instanceof SyntaxError) {
    log({
      level: "warn",
      event: "invalid_json",
      status: 400,
    });

    return res.status(400).json({
      error: "invalid_json",
      message: "The request body must contain valid JSON",
    });
  }

  next(error);
});

// Start listening on all network interfaces so it works inside Docker.
app.listen(PORT, "0.0.0.0", function () {
  log({
    level: "info",
    event: "started",
    port: PORT,
  });
});