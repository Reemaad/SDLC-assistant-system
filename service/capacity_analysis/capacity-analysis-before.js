
// Two slashes start a comment in JavaScript. The computer ignores these lines.

// This file calculates team capacity from DEV and QA reports.

// This function takes DEV and QA reports and calculates the total capacity.

function calculateCapacity(devReport, qaReport) {

  // JOB 1: get the capacity from the DEV report.
  const devCapacity = devReport.assignedHours;

  // JOB 2: get the capacity from the QA report.
  const qaCapacity = qaReport.assignedHours;

  // JOB 3: combine DEV and QA capacity.
  const totalCapacity = devCapacity + qaCapacity;

  // JOB 4: determine the capacity status.
  const status = totalCapacity > 0 ? "ALLOCATED" : "AVAILABLE";

  // Return the capacity result.
  return {
    devCapacity,
    qaCapacity,
    totalCapacity,
    status
  };
}


// Below are sample DEV and QA reports so we can run the file.

// In a real system, these reports would come from the DEV and QA systems.

const devReport = {

  // DEV team's assigned workload in hours.
  assignedHours: 80
};

const qaReport = {

  // QA team's assigned workload in hours.
  assignedHours: 40
};


// Run the capacity calculation.

const result = calculateCapacity(devReport, qaReport);


// Display the calculated capacity.

console.log(result);

