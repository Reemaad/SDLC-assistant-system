// AFTER:
// Responsible only for capacity analysis.

class CapacityAnalysisService {

    calculateTotalCapacity(report) {
      return report.teamMembers.reduce(
        (total, member) => total + member.assignedHours,
        0
      );
    }
  
    calculateUtilization(report) {
      const totalCapacity = this.calculateTotalCapacity(report);
  
      if (report.availableHours === 0) {
        return 0;
      }
  
      return (totalCapacity / report.availableHours) * 100;
    }
  
    determineStatus(report) {
      const totalCapacity = this.calculateTotalCapacity(report);
  
      if (totalCapacity > report.availableHours) {
        return "OVERLOADED";
      }
  
      if (totalCapacity === report.availableHours) {
        return "FULL";
      }
  
      return "AVAILABLE";
    }
  
    generateAnalysis(report) {
      const totalCapacity = this.calculateTotalCapacity(report);
  
      const utilization = this.calculateUtilization(report);
  
      const status = this.determineStatus(report);
  
      return {
        totalCapacity,
        utilization,
        status
      };
    }
  }
  
  module.exports = CapacityAnalysisService;