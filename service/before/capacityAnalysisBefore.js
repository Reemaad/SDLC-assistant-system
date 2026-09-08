// BEFORE: One service handles everything.
// This violates the Single Responsibility Principle.

class CapacityAnalysisService {

    // Report responsibility
    getReport(report) {
      return report;
    }
  
    // Report responsibility
    getTeamMembers(report) {
      return report.teamMembers;
    }
  
    // Report responsibility
    addMember(report, member) {
      report.teamMembers.push(member);
    }
  
    // Report responsibility
    removeMember(report, memberId) {
      report.teamMembers = report.teamMembers.filter(
        member => member.id !== memberId
      );
    }
  
    // Report responsibility
    updateMember(report, memberId, updatedData) {
      const member = report.teamMembers.find(
        member => member.id === memberId
      );
  
      if (member) {
        Object.assign(member, updatedData);
      }
    }
  
    // Report responsibility
    getMemberCapacity(member) {
      return member.assignedHours;
    }
  
    // Capacity responsibility
    calculateTotalCapacity(report) {
      return report.teamMembers.reduce(
        (total, member) => total + member.assignedHours,
        0
      );
    }
  
    // Capacity responsibility
    calculateUtilization(report) {
      const totalCapacity = this.calculateTotalCapacity(report);
  
      if (report.availableHours === 0) {
        return 0;
      }
  
      return (totalCapacity / report.availableHours) * 100;
    }
  
    // Capacity responsibility
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
  
    // Analysis responsibility
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
  
  
  // -----------------------------
  // Application
  // -----------------------------
  
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
  
  
  const service = new CapacityAnalysisService();
  
  console.log("=== BEFORE ===");
  
  console.log("Team:");
  console.log(service.getTeamMembers(report));
  
  console.log("\nCapacity Analysis:");
  console.log(service.generateAnalysis(report));