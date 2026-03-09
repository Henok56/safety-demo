const Schedule = require("../models/Schedule");

// ===========================
// GET schedules for logged-in user
// ===========================
exports.getUserSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ assignedTo: req.user.userid }).sort({ duedate: 1 });

    res.json({
      success: true,
      message: schedules.length
        ? "Schedules fetched successfully"
        : "No schedules found",
      data: schedules,
    });
  } catch (err) {
    console.error("Fetch user schedules error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedules",
      data: [],
    });
  }
};
