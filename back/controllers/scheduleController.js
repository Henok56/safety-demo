const Schedule = require("../models/Schedule");

// ---------------- Helper: Log changes ----------------
const logChange = (doc, action, user, changes = {}) => {
  if (!doc.changeHistory) doc.changeHistory = [];
  
  doc.changeHistory.push({
    action, // CREATE | UPDATE | DELETE
    changedBy: user?.userid || "Unknown Admin",
    changedAt: new Date(),
    changes,
  });
};

// Roles allowed to view and manage schedules
const ALLOWED_SCHEDULE_ROLES = ["superadmin", "manager", "scheduler", "team_leader"];

// ================= PUBLIC =================
exports.getPublicSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ duedate: 1 });
    res.json({
      success: true,
      data: schedules,
      message: "Public schedules fetched successfully",
    });
  } catch (err) {
    console.error("Fetch public schedules error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch schedules" });
  }
};

// ================= STAFF / MANAGEMENT =================

// GET all schedules
exports.getSchedules = async (req, res) => {
  try {
    if (!ALLOWED_SCHEDULE_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }

    const { from, to } = req.query;
    const query = {};

    if (from || to) query.duedate = {};
    if (from) query.duedate.$gte = new Date(from);
    if (to) query.duedate.$lte = new Date(to);

    const schedules = await Schedule.find(query).sort({ duedate: 1 });

    res.json({
      success: true,
      data: schedules,
      message: "Staff schedules retrieved successfully",
    });
  } catch (err) {
    console.error("Fetch schedules error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch schedules" });
  }
};

// CREATE schedule
exports.createSchedule = async (req, res) => {
  try {
    if (!ALLOWED_SCHEDULE_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
    }

    const { activity, description, startdate, duedate, month, assignedTo, status, notes, comments } = req.body;
    
    // Normalize field names
    const finalActivity = activity || description;
    const finalNotes = notes || comments;
    const finalDueDate = duedate || month;

    if (!finalActivity || !startdate || !finalDueDate) {
      return res.status(400).json({ success: false, message: "Missing required fields (Activity, Start Date, Due Date)." });
    }

    const schedule = new Schedule({
      activity: finalActivity,
      startdate: new Date(startdate),
      duedate: new Date(finalDueDate),
      assignedTo: assignedTo || "Unassigned",
      status: status || "Pending",
      notes: finalNotes || "Follow schedule as per assigned dates",
      createdBy: req.user.userid,
    });

    logChange(schedule, "CREATE", req.user, {
      activity: { new: schedule.activity },
      status: { new: schedule.status },
    });

    const saved = await schedule.save();

    res.status(201).json({
      success: true,
      data: saved,
      message: "Schedule created and logged successfully",
    });
  } catch (err) {
    console.error("Create schedule error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to create schedule" });
  }
};

// UPDATE schedule
exports.updateSchedule = async (req, res) => {
  try {
    if (!ALLOWED_SCHEDULE_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
    }

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    const changes = {};
    const updatableFields = ["activity", "description", "status", "assignedTo", "startdate", "duedate", "month", "notes", "comments"];

    updatableFields.forEach((field) => {
      let incomingValue = req.body[field];
      if (incomingValue === undefined) return;

      // Map alias fields to Schema fields
      let schemaField = field;
      if (field === "description") schemaField = "activity";
      if (field === "comments") schemaField = "notes";
      if (field === "month") schemaField = "duedate";

      let newValue = incomingValue;
      if (schemaField.includes("date") || schemaField === "duedate") {
        newValue = incomingValue ? new Date(incomingValue) : null;
      }

      // Comparison for Audit Log
      const oldValueStr = schedule[schemaField] != null ? schedule[schemaField].toString() : "";
      const newValueStr = newValue != null ? newValue.toString() : "";

      if (oldValueStr !== newValueStr) {
        changes[schemaField] = { old: schedule[schemaField], new: newValue };
        schedule[schemaField] = newValue;
      }
    });

    if (Object.keys(changes).length > 0) {
      logChange(schedule, "UPDATE", req.user, changes);
      schedule.markModified('changeHistory');
    }

    const updated = await schedule.save();

    res.json({
      success: true,
      data: updated,
      message: "Schedule updated and audit log synchronized",
    });
  } catch (err) {
    console.error("Update schedule error:", err);
    res.status(500).json({ success: false, message: "Failed to update schedule" });
  }
};

// DELETE schedule
exports.deleteSchedule = async (req, res) => {
  try {
    // 🚩 SPECIFIC RESTRICTION: Scheduler is excluded from deletion
    const deleteAuthorized = ["superadmin", "manager", "team_leader"].includes(req.user.role);
    
    if (!deleteAuthorized) {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Schedulers cannot delete records. Please contact a Team Leader or Manager." 
      });
    }

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    await Schedule.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Schedule record purged from database" });
  } catch (err) {
    console.error("Delete schedule error:", err);
    res.status(500).json({ success: false, message: "Failed to delete schedule" });
  }
};