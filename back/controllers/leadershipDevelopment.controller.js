const Leadership = require("../models/LeadershipDevelopment.model");
const { sendTrainingEmail } = require("../emailrelated/mailer");

exports.getLeaderships = async (req, res) => {
  try {
    const data = await Leadership.find()
      .populate("trainingType", "topic")
      .populate({
        path: "employee",
        populate: { path: "userAccount", select: "firstname lastname userid email" }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createLeadership = async (req, res) => {
  try {
    const data = {
      ...req.body,
      preferredSchedule: req.body.preferredSchedule || null,
      createdBy: req.user.username,
      lastModifiedBy: req.user.username
    };

    const record = new Leadership(data);
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
        trainingType: "Leadership Development",
        details: {
          "Training Topic": record.trainingType?.topic || "N/A",
          "Groomed For Position": record.groomedForPosition,
          "Preferred Schedule": record.preferredSchedule
            ? new Date(record.preferredSchedule).toDateString() : "TBD",
          "Department": record.department || "N/A"
        }
      });
    }

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error("❌ Leadership Save Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateLeadership = async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      preferredSchedule: req.body.preferredSchedule || null,
      lastModifiedBy: req.user.username
    };

    const record = await Leadership.findByIdAndUpdate(
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
          trainingType: "Leadership Development",
          details: {
            "Training Topic": record.trainingType?.topic || "N/A",
            "Status Updated To": record.remark,
            "Groomed For Position": record.groomedForPosition
          }
        });
      }
    }

    res.json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: "Update Failed", error: err.message });
  }
};

exports.deleteLeadership = async (req, res) => {
  try {
    const authorizedRoles = ["superadmin", "manager", "team_leader"];
    if (!authorizedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Leadership role required to delete records." });
    }

    const record = await Leadership.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    res.json({ success: true, message: "Leadership record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete Failed" });
  }
};