const Succession = require("../models/SuccessionPlanning.model");

exports.getSuccessions = async (req, res) => {
  try {
    const data = await Succession.find()
      .populate({
        path: "employee",
        populate: { path: "userAccount", select: "firstname lastname userid email" }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error("❌ Fetch Error:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getSuccession = async (req, res) => {
  try {
    const data = await Succession.findById(req.params.id)
      .populate({
        path: "employee",
        populate: { path: "userAccount", select: "firstname lastname userid email" }
      });

    if (!data) return res.status(404).json({ success: false, message: "Succession record not found" });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createSuccession = async (req, res) => {
  try {
    const data = {
      ...req.body,
      createdBy: req.user.username,
      lastModifiedBy: req.user.username
    };

    const record = new Succession(data);
    await record.save();

    await record.populate({
      path: "employee",
      populate: { path: "userAccount", select: "firstname lastname userid email" }
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error("❌ Succession Save Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateSuccession = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.username
    };

    const record = await Succession.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: "employee",
      populate: { path: "userAccount", select: "firstname lastname userid email" }
    });

    if (!record) return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteSuccession = async (req, res) => {
  try {
    const authorizedRoles = ["superadmin", "manager", "team_leader"];
    if (!authorizedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: You do not have permission to delete succession plans." });
    }

    const record = await Succession.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    res.json({ success: true, message: "Succession plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};