const FdmEvent = require("../models/FdmEvent");

// =========================
// GET ALL
// =========================
exports.getAllFdmEvents = async (req, res) => {
  try {
    const events = await FdmEvent.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: events.length,
      data: { events },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// =========================
// GET ONE
// =========================
exports.getFdmEvent = async (req, res) => {
  try {
    const event = await FdmEvent.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ status: "fail", message: "Event not found" });
    }

    res.status(200).json({
      status: "success",
      data: { event },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// =========================
// CREATE
// =========================
exports.createFdmEvent = async (req, res) => {
  try {
    const event = await FdmEvent.create(req.body);

    res.status(201).json({
      status: "success",
      data: { event },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// =========================
// UPDATE
// =========================
exports.updateFdmEvent = async (req, res) => {
  try {
    const event = await FdmEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res
        .status(404)
        .json({ status: "fail", message: "Event not found" });
    }

    res.status(200).json({
      status: "success",
      data: { event },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// =========================
// DISCUSSION ENTRY
// =========================
exports.addDiscussionEntry = async (req, res) => {
  try {
    const event = await FdmEvent.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ status: "fail", message: "Event not found" });
    }

    event.discussionHistory.push({
      message: req.body.message,
      createdBy: req.body.createdBy || "system",
    });

    await event.save();

    res.status(201).json({
      status: "success",
      data: { event },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// =========================
// DELETE (optional but useful)
// =========================
exports.deleteFdmEvent = async (req, res) => {
  try {
    const event = await FdmEvent.findByIdAndDelete(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ status: "fail", message: "Event not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Event deleted",
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// =========================
// EXPORT SAFE (IMPORTANT FIX)
// =========================
module.exports = {
  getAllFdmEvents: exports.getAllFdmEvents,
  getFdmEvent: exports.getFdmEvent,
  createFdmEvent: exports.createFdmEvent,
  updateFdmEvent: exports.updateFdmEvent,
  addDiscussionEntry: exports.addDiscussionEntry,
  deleteFdmEvent: exports.deleteFdmEvent,
};