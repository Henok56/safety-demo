
const Occurrence = require("../models/Occurrence");
const Schedule = require("../models/Schedule");

// ===========================
// GET OCCURRENCE AUDIT LOGS
// ===========================
exports.getOccurrenceAudit = async (req, res) => {
  try {
    // 🚩 SECURITY: Only Superadmin and Manager should view audit trails
    const leadershipRoles = ["superadmin", "manager"];
    if (!leadershipRoles.includes(req.user.role)) {
      console.warn(`🛑 Audit Access Denied: ${req.user.userid} tried to access Occurrence Logs`);
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied: You do not have permission to view audit history." 
      });
    }

    console.log("🟢 Fetching Occurrence Audit Logs...");

    // Fetch occurrences, specifically requesting the changeHistory array
    const data = await Occurrence.find({})
      .select("spi occurrenceDate reportType changeHistory") 
      .sort({ updatedAt: -1 }); // Show most recently changed first
    
    return res.json({ 
      success: true, 
      count: data.length,
      data 
    });
  } catch (err) {
    console.error("🔴 Occurrence Audit Controller Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// GET SCHEDULE AUDIT LOGS
// ===========================
exports.getScheduleAudit = async (req, res) => {
  try {
    // 🚩 SECURITY: Only Superadmin and Manager
    const leadershipRoles = ["superadmin", "manager"];
    if (!leadershipRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied: Insufficient permissions for Schedule Audit." 
      });
    }

    console.log("🟢 Fetching Schedule Audit Logs...");

    const data = await Schedule.find({})
      .select("activity date crewMember changeHistory")
      .sort({ updatedAt: -1 });

    return res.json({ 
      success: true, 
      count: data.length,
      data 
    });
  } catch (err) {
    console.error("🔴 Schedule Audit Controller Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};