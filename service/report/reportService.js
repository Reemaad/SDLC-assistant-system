// AFTER:
// Responsible only for reports and team members.

class ReportService {

    getReport(report) {
      return report;
    }
  
    getTeamMembers(report) {
      return report.teamMembers;
    }
  
    addMember(report, member) {
      report.teamMembers.push(member);
    }
  
    removeMember(report, memberId) {
      report.teamMembers = report.teamMembers.filter(
        member => member.id !== memberId
      );
    }
  
    updateMember(report, memberId, updatedData) {
      const member = report.teamMembers.find(
        member => member.id === memberId
      );
  
      if (member) {
        Object.assign(member, updatedData);
      }
    }
  
    getMemberCapacity(member) {
      return member.assignedHours;
    }
  }
  
  module.exports = ReportService;