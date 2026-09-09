const ReportService = require("./report/report-service.js");

const CapacityAnalysisService =
  require("./capacity_analysis/capacity-analysis.js");


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