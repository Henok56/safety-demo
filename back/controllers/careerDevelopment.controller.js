const CareerDevelopment = require("../models/CareerDevelopment.model");
const { sendTrainingEmail } = require("../emailrelated/mailer");

// ===========================
// CREATE
// ===========================
exports.createCareer = async (req, res) => {
  try {
    const careerData = {
      ...req.body,
      createdBy: req.user.userid,
      lastModifiedBy: req.user.userid
    };

    const career = new CareerDevelopment(careerData);
    const savedCareer = await career.save();

    // ✅ Added email to select
    await savedCareer.populate({
      path: "employee",
      populate: {
        path: "userAccount",
        select: "firstname lastname userid email"
      }
    });

    // ✅ Send email notification
    const user = savedCareer.employee?.userAccount;
    if (user?.email) {
      await sendTrainingEmail({
        toEmail: user.email,
        employeeName: `${user.firstname} ${user.lastname}`,
        trainingType: "Career Development",
        details: {
          "Topic": savedCareer.topic,
          "Tentative Schedule": savedCareer.tentativeScheduleMonth || "TBD",
          "Status": savedCareer.remark || "Pending",
          "Department": savedCareer.costCenter || "N/A"
        }
      });
    }

    res.status(201).json({ success: true, data: savedCareer });
  } catch (err) {
    console.error("❌ Career Save Error:", err.message);
    res.status(400).json({ success: false, message: "Database Save Failed", error: err.message });
  }
};

// ===========================
// GET ALL
// ===========================
exports.getCareers = async (req, res) => {
  try {
    const careers = await CareerDevelopment.find()
      .populate({
        path: "employee",
        populate: {
          path: "userAccount",
          select: "firstname lastname userid email"
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: careers.length, data: careers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ===========================
// GET ONE
// ===========================
exports.getCareer = async (req, res) => {
  try {
    const career = await CareerDevelopment.findById(req.params.id)
      .populate({
        path: "employee",
        populate: {
          path: "userAccount",
          select: "firstname lastname userid email"
        }
      });

    if (!career) return res.status(404).json({ success: false, message: "Career not found" });
    res.json({ success: true, data: career });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ===========================
// UPDATE
// ===========================
exports.updateCareer = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.userid
    };

    const career = await CareerDevelopment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: "employee",
      populate: {
        path: "userAccount",
        select: "firstname lastname userid email"
      }
    });

    if (!career) return res.status(404).json({ success: false, message: "Career not found" });

    // ✅ Notify if remark/status changed
    if (req.body.remark && req.body.remark !== "pending") {
      const user = career.employee?.userAccount;
      if (user?.email) {
        await sendTrainingEmail({
          toEmail: user.email,
          employeeName: `${user.firstname} ${user.lastname}`,
          trainingType: "Career Development",
          details: {
            "Topic": career.topic,
            "Status Updated To": career.remark,
            "Tentative Schedule": career.tentativeScheduleMonth || "TBD"
          }
        });
      }
    }

    res.json({ success: true, data: career });
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid Data" });
  }
};

// ===========================
// DELETE
// ===========================
exports.deleteCareer = async (req, res) => {
  try {
    const authorizedRoles = ["superadmin", "manager", "team_leader"];
    if (!authorizedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Leadership role required." });
    }

    const career = await CareerDevelopment.findByIdAndDelete(req.params.id);
    if (!career) return res.status(404).json({ success: false, message: "Career record not found" });

    res.json({ success: true, message: "Career track deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};