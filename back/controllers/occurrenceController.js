const Occurrence = require("../models/Occurrence");

// ---------------------------
// Helper: Log changes
// ---------------------------
const logChange = (doc, action, user, changes = {}) => {
  doc.changeHistory = doc.changeHistory || [];
  doc.changeHistory.push({
    action, // CREATE | UPDATE | DELETE
    changedBy: user.userid,
    changedAt: new Date(),
    changes,
  });
};

// ===========================
// CREATE OCCURRENCE
// ===========================
exports.createOccurrence = async (req, res) => {
  try {
    const payload = {};
    Object.entries(req.body).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") payload[key] = value;
    });

    const occurrence = new Occurrence({
      ...payload,
      reportSource: req.file ? `/uploads/${req.file.filename}` : req.body.reportSource,
      createdBy: req.user.userid,
    });

    logChange(occurrence, "CREATE", req.user);

    const saved = await occurrence.save();

    res.status(201).json({
      success: true,
      message: "Occurrence created successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Create occurrence error:", err);
    res.status(err.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: err.message
    });
  }
};

// ===========================
// READ ALL OCCURRENCES
// ===========================
exports.getOccurrences = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) filter.occurrenceDate = {};
    if (startDate) filter.occurrenceDate.$gte = new Date(startDate);
    if (endDate) filter.occurrenceDate.$lte = new Date(endDate);

    const occurrences = await Occurrence.find(filter).sort({ occurrenceDate: 1 });

    res.json({
      success: true,
      data: occurrences,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch occurrences" });
  }
};

// ===========================
// UPDATE OCCURRENCE
// ===========================
exports.updateOccurrence = async (req, res) => {
  try {
    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence)
      return res.status(404).json({ success: false, message: "Occurrence not found" });

    // 🚩 UPDATED LOGIC: Allow if leadership OR if they are the original creator
    const leadershipRoles = ["superadmin", "manager", "team_leader"];
    const isLeadership = leadershipRoles.includes(req.user.role);
    const isOwner = occurrence.createdBy === req.user.userid;

    if (!isLeadership && !isOwner) {
      return res.status(403).json({ success: false, message: "Access denied: Cannot edit this record" });
    }

    Object.entries(req.body).forEach(([key, value]) => {
      if (["_id", "__v", "createdAt", "createdBy"].includes(key)) return;
      if (value !== undefined && value !== null) occurrence[key] = value;
    });

    if (req.file) {
      occurrence.reportSource = `/uploads/${req.file.filename}`;
    }

    occurrence.updatedBy = req.user.userid;
    logChange(occurrence, "UPDATE", req.user, req.body);

    const updated = await occurrence.save();

    res.json({ success: true, message: "Occurrence updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed: " + err.message });
  }
};

// ===========================
// DELETE OCCURRENCE
// ===========================
exports.deleteOccurrence = async (req, res) => {
  try {
    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence)
      return res.status(404).json({ success: false, message: "Occurrence not found" });

    // 🚩 UPDATED LOGIC: Match your new role list
    const leadershipRoles = ["superadmin", "manager", "team_leader"];
    if (!leadershipRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied: Only leadership can delete" });
    }

    // Keep history by logging before actual deletion
    logChange(occurrence, "DELETE", req.user);
    await occurrence.deleteOne();

    res.json({ success: true, message: "Occurrence deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete occurrence" });
  }
};