const Coaching = require("../models/Coaching.model");

/**
 * @desc    Get all coaching records with deep nested population
 * @route   GET /api/coaching
 */
exports.getCoachings = async (req, res) => {
  try {
    const data = await Coaching.find()
      .populate({
        path: "employee",
        populate: {
          path: "userAccount",
          select: "firstname lastname userid"
        }
      })
      .populate("trainingType", "topic category") // Crucial for dashboard display
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    console.error("❌ Get Coaching Error:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Create new coaching record
 * @route   POST /api/coaching
 */
exports.createCoaching = async (req, res) => {
  try {
    // 🚩 ALIGNMENT: Matching schema keys exactly (PascalCase for Start/End)
    const sanitizedData = {
      employee: req.body.employee,             // Required ObjectId
      trainingType: req.body.trainingType,     // Required ObjectId
      proposedPLLevel: req.body.proposedPLLevel, // Required String
      coachingScheduleStartMonth: req.body.coachingScheduleStartMonth || null,
      coachingScheduleEndMonth: req.body.coachingScheduleEndMonth || null,
      remark: req.body.remark || "pending",
      costCenter: req.body.costCenter,
      department: req.body.department,
      createdBy: req.user.username,
      lastModifiedBy: req.user.username
    };

    const record = new Coaching(sanitizedData);
    await record.save();

    // Deep populate for immediate frontend feedback
    await record.populate([
      { path: "employee", populate: { path: "userAccount", select: "firstname lastname userid" } },
      { path: "trainingType", select: "topic" }
    ]);

    res.status(201).json({
      success: true,
      message: "Coaching record created successfully",
      data: record
    });
  } catch (err) {
    console.error("❌ Validation Failed:", err.message);
    res.status(400).json({
      success: false,
      message: "Validation Failed: Check required fields (trainingType, proposedPLLevel)",
      error: err.message
    });
  }
};

/**
 * @desc    Update an existing coaching record
 * @route   PUT /api/coaching/:id
 */
exports.updateCoaching = async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      // Ensure we use the schema's PascalCase naming
      coachingScheduleStartMonth: req.body.coachingScheduleStartMonth || null,
      coachingScheduleEndMonth: req.body.coachingScheduleEndMonth || null,
      lastModifiedBy: req.user.username
    };

    const record = await Coaching.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    ).populate([
      { path: "employee", populate: { path: "userAccount", select: "firstname lastname userid" } },
      { path: "trainingType", select: "topic" }
    ]);

    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    res.status(200).json({ success: true, message: "Coaching record updated", data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: "Update Failed", error: err.message });
  }
};

/**
 * @desc    Delete a coaching record
 * @route   DELETE /api/coaching/:id
 */
exports.deleteCoaching = async (req, res) => {
  try {
    const authorizedRoles = ["superadmin", "manager", "team_leader"];
    if (!authorizedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access Denied: Leadership role required." });
    }

    const record = await Coaching.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    res.status(200).json({ success: true, message: "Coaching record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete Failed" });
  }
};