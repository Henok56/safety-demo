const Schedule = require("../models/Schedule");

// @desc    Get all schedules (Admin & Trend)
exports.getSchedules = async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = {};

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(new Date(to).setHours(23, 59, 59, 999));

      // Return tasks that overlap the selected date range
      query.$or = [
        // Starts inside the range
        { startdate: { $gte: fromDate, $lte: toDate } },

        // Ends inside the range
        { duedate: { $gte: fromDate, $lte: toDate } },

        // Spans across the entire range
        {
          startdate: { $lte: fromDate },
          duedate: { $gte: toDate }
        }
      ];
    }

    const schedules = await Schedule.find(query)
      .populate("assignedTo", "firstname lastname email")
      .sort({ startdate: 1 });

    res.status(200).json({ success: true, data: schedules });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get public schedules (Monthly)
exports.getPublicSchedules = async (req, res) => {
  try {
    const { from, to } = req.query;
    let start, end;

    if (from && to) {
      // Subtract 3hrs from start and add 3hrs to end to catch UTC+3 saved dates
      start = new Date(from + "T00:00:00.000Z");
      start.setHours(start.getHours() - 3);

      end = new Date(to + "T23:59:59.999Z");
      end.setHours(end.getHours() + 3);
    } else {
      const now = new Date(new Date().getTime() + 3 * 60 * 60 * 1000);
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      start = new Date(Date.UTC(year, month, 1));
      start.setHours(start.getHours() - 3);
      end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      end.setHours(end.getHours() + 3);
    }

    const schedules = await Schedule.find({
      $or: [
        { startdate: { $gte: start, $lte: end } },
        { duedate: { $gte: start, $lte: end } },
        { startdate: { $lte: start }, duedate: { $gte: end } }
      ]
    }).populate("assignedTo", "firstname lastname");

    res.status(200).json({ success: true, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// @desc    Create Schedule
exports.createSchedule = async (req, res) => {
  try {
    const newSchedule = new Schedule({ ...req.body, createdBy: req.user.userid });
    await newSchedule.save();
    res.status(201).json({ success: true, data: newSchedule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update Schedule
exports.updateSchedule = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete Schedule
exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};