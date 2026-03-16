const Schedule = require("../models/Schedule");
const User = require("../models/User");
const { sendScheduleEmail } = require("../emailrelated/mailer");

const ALLOWED_ROLES = ["superadmin", "manager", "scheduler", "team_leader"];

// Helper: log changes
const logChange = (doc, action, user, changes = {}) => {
  if (!doc.changeHistory) doc.changeHistory = [];
  doc.changeHistory.push({
    action,
    changedBy: user?.userid || "Unknown",
    changedAt: new Date(),
    changes,
  });
};

// Helper: notify assigned user
const notifyAssignee = async (schedule, action = "assigned") => {
  try {
    if (!schedule.assignedTo || schedule.assignedTo === "Unassigned") return;

    // Lookup by userid or email
    let user = await User.findOne({ userid: schedule.assignedTo });
    if (!user) user = await User.findOne({ email: schedule.assignedTo });
    if (!user) return;

    await sendScheduleEmail({
      toEmail: user.email,
      employeeName: `${user.firstname} ${user.lastname}`,
      schedule: {
        date: new Date(schedule.duedate).toDateString(),
        shift: schedule.activity,
        location: schedule.notes,
      },
    });

    console.log(`📧 Schedule email [${action}] sent to ${user.email}`);
  } catch (err) {
    console.error("⚠️ Email failed:", err.message);
  }
};

// GET public schedules (no auth required)
exports.getPublicSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ status: "Published" })
      .select("activity duedate assignedTo notes")
      .sort({ duedate: 1 });

    res.json({ success: true, data: schedules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch public schedules" });
  }
};

// GET schedules
exports.getSchedules = async (req, res) => {
  try {
    if (!ALLOWED_ROLES.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });

    const schedules = await Schedule.find()
      .populate("assignedTo", "firstname lastname email")
      .sort({ duedate: 1 });

    res.json({ success: true, data: schedules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch schedules" });
  }
};

// CREATE schedule
exports.createSchedule = async (req, res) => {
  try {
    if (!ALLOWED_ROLES.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });

    const { activity, startdate, duedate, assignedTo, notes, status } = req.body;

    if (!activity || !startdate || !duedate)
      return res.status(400).json({ message: "Missing required fields" });

    const schedule = new Schedule({
      activity,
      startdate,
      duedate,
      assignedTo: assignedTo || "Unassigned",
      status: status || "Pending",
      notes: notes || "Follow schedule as per assigned dates",
      createdBy: req.user.userid,
    });

    logChange(schedule, "CREATE", req.user, { activity, status, assignedTo });

    const saved = await schedule.save();

    // Notify the user asynchronously
    setImmediate(() => notifyAssignee(saved));

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create schedule" });
  }
};

// UPDATE schedule
exports.updateSchedule = async (req, res) => {
  try {
    if (!ALLOWED_ROLES.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    const changes = {};
    const updatableFields = ["activity", "status", "assignedTo", "startdate", "duedate", "notes"];

    updatableFields.forEach((field) => {
      if (req.body[field] === undefined) return;
      const oldVal = schedule[field];
      const newVal = req.body[field];
      if (String(oldVal) !== String(newVal)) {
        schedule[field] = newVal;
        changes[field] = { old: oldVal, new: newVal };
      }
    });

    if (Object.keys(changes).length > 0) logChange(schedule, "UPDATE", req.user, changes);

    const updated = await schedule.save();

    // Notify only if reassigned or status changed
    if (changes.assignedTo || changes.status) setImmediate(() => notifyAssignee(updated));

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update schedule" });
  }
};

// DELETE schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const allowedDeleteRoles = ["superadmin", "manager", "team_leader"];
    if (!allowedDeleteRoles.includes(req.user.role))
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot delete schedules",
      });

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    await Schedule.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Schedule deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete schedule" });
  }
};