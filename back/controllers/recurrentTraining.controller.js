const RecurrentTraining = require("../models/RecurrentTraining.model");

exports.createRecurrentTraining = async (req, res) => {
  try {
    const data = {
      ...req.body,
      lastPromotionDate: req.body.lastPromotionDate || null,
      nextPromotionDate: req.body.nextPromotionDate || null,
      createdBy: req.user.userid,
      lastModifiedBy: req.user.userid
    };

    const training = new RecurrentTraining(data);
    await training.save();

    await training.populate([
      { path: "employee", populate: { path: "userAccount", select: "firstname lastname userid email" } },
      { path: "trainingType", select: "topic" }
    ]);

    res.status(201).json({ success: true, data: training });
  } catch (err) {
    console.error("❌ CREATE ERROR:", err.message);
    res.status(400).json({ success: false, message: "Validation Failed", error: err.message });
  }
};

exports.getRecurrentTrainings = async (req, res) => {
  try {
    const trainings = await RecurrentTraining.find()
      .populate("trainingType", "topic")
      .populate({
        path: "employee",
        populate: { path: "userAccount", select: "firstname lastname userid email" }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: trainings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getRecurrentTrainingByEmployee = async (req, res) => {
  try {
    const trainings = await RecurrentTraining.find({ employee: req.params.employeeId })
      .populate("trainingType", "topic")
      .populate({
        path: "employee",
        populate: { path: "userAccount", select: "firstname lastname userid email" }
      });

    res.json({ success: true, data: trainings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateRecurrentTraining = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastPromotionDate: req.body.lastPromotionDate || null,
      nextPromotionDate: req.body.nextPromotionDate || null,
      lastModifiedBy: req.user.userid
    };

    const training = await RecurrentTraining.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "employee", populate: { path: "userAccount", select: "firstname lastname userid email" } },
      { path: "trainingType", select: "topic" }
    ]);

    if (!training) return res.status(404).json({ success: false, message: "Record not found" });

    res.json({ success: true, data: training });
  } catch (err) {
    res.status(400).json({ success: false, message: "Update Failed", error: err.message });
  }
};

exports.deleteRecurrentTraining = async (req, res) => {
  try {
    const authorizedRoles = ["superadmin", "manager", "team_leader"];
    if (!authorizedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access Denied: Leadership role required to delete training records." });
    }

    const training = await RecurrentTraining.findByIdAndDelete(req.params.id);
    if (!training) return res.status(404).json({ success: false, message: "Record not found" });

    res.json({ success: true, message: "Training record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete Failed" });
  }
};