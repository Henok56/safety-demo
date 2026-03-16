const Coaching = require("../models/Coaching.model");
const { sendScheduleEmail } = require("../emailrelated/mailer");

exports.getCoachings = async (req, res) => {
  try {
    const data = await Coaching.find()
      .populate({
        path: "employee",
        populate: { path: "userAccount", select: "firstname lastname userid email" }
      })
      .populate("trainingType", "topic category")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    console.error("❌ Get Coaching Error:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createCoaching = async (req, res) => {
  try {
    const sanitizedData = {
      employee: req.body.employee,
      trainingType: req.body.trainingType,
      proposedPLLevel: req.body.proposedPLLevel,
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

    // ✅ Added email to select
    await record.populate([
      { path: "employee", populate: { path: "userAccount", select: "firstname lastname userid email" } },
      { path: "trainingType", select: "topic" }
    ]);

    // ✅ Send email notification
    const user = record.employee?.userAccount;
    if (user?.email) {
      await sendTrainingEmail({
        toEmail: user.email,
        employeeName: `${user.firstname} ${user.lastname}`,
        trainingType: "Coaching",
        details: {
          "Training Topic": record.trainingType?.topic || "N/A",
          "Proposed PL Level": record.proposedPLLevel,
          "Start Month": record.coachingScheduleStartMonth
            ? new Date(record.coachingScheduleStartMonth).toDateString() : "TBD",
          "End Month": record.coachingScheduleEndMonth
            ? new Date(record.coachingScheduleEndMonth).toDateString() : "TBD",
          "Department": record.department || "N/A"
        }
      });
    }

    res.status(201).json({ success: true, message: "Coaching record created successfully", data: record });
  } catch (err) {
    console.error("❌ Validation Failed:", err.message);
    res.status(400).json({
      success: false,
      message: "Validation Failed: Check required fields (trainingType, proposedPLLevel)",
      error: err.message
    });
  }
};

exports.updateCoaching = async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      coachingScheduleStartMonth: req.body.coachingScheduleStartMonth || null,
      coachingScheduleEndMonth: req.body.coachingScheduleEndMonth || null,
      lastModifiedBy: req.user.username
    };

    const record = await Coaching.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    ).populate([
      { path: "employee", populate: { path: "userAccount", select: "firstname lastname userid email" } },
      { path: "trainingType", select: "topic" }
    ]);

    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    // ✅ Notify on status change
    if (req.body.remark) {
      const user = record.employee?.userAccount;
      if (user?.email) {
        await sendTrainingEmail({
          toEmail: user.email,
          employeeName: `${user.firstname} ${user.lastname}`,
          trainingType: "Coaching",
          details: {
            "Training Topic": record.trainingType?.topic || "N/A",
            "Status Updated To": record.remark,
            "Proposed PL Level": record.proposedPLLevel
          }
        });
      }
    }

    res.status(200).json({ success: true, message: "Coaching record updated", data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: "Update Failed", error: err.message });
  }
};

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