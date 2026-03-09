const RecurrentTraining = require("../models/RecurrentTraining.model");

// ===========================
// CREATE
// ===========================
exports.createRecurrentTraining = async (req, res) => {
  try {
    // 🚩 DATA SANITIZATION & AUDIT:
    const data = {
      ...req.body,
      lastPromotionDate: req.body.lastPromotionDate || null,
      nextPromotionDate: req.body.nextPromotionDate || null,
      // Track the person logging the training
      createdBy: req.user.userid,
      lastModifiedBy: req.user.userid
    };

    const training = new RecurrentTraining(data);
    await training.save();
    
    // Populate including costCenter for compliance reports
    await training.populate("employee", "firstName lastName regNo costCenter");
    
    res.status(201).json({ success: true, data: training });
  } catch (err) {
    console.error("❌ CREATE ERROR:", err.message);
    res.status(400).json({ 
      success: false, 
      message: "Validation Failed", 
      error: err.message 
    });
  }
};

// ===========================
// GET ALL
// ===========================
exports.getRecurrentTrainings = async (req, res) => {
  try {
    const trainings = await RecurrentTraining.find()
      .populate("trainingType", "topic") // ✅ THIS IS KEY: Fetches the 'topic' field
      .populate({
        path: "employee",
        populate: {
          path: "userAccount",
          select: "firstname lastname userid"
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: trainings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// ===========================
// GET BY EMPLOYEE ID
// ===========================
exports.getRecurrentTrainingByEmployee = async (req, res) => {
  try {
    const trainings = await RecurrentTraining.find({ employee: req.params.employeeId })
      .populate("employee", "firstName lastName regNo costCenter");
      
    res.json({ success: true, data: trainings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ===========================
// UPDATE
// ===========================
exports.updateRecurrentTraining = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastPromotionDate: req.body.lastPromotionDate || null,
      nextPromotionDate: req.body.nextPromotionDate || null,
      // Track the person updating the record
      lastModifiedBy: req.user.userid
    };

    const training = await RecurrentTraining.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate("employee", "firstName lastName regNo costCenter");

    if (!training) return res.status(404).json({ success: false, message: "Record not found" });
    res.json({ success: true, data: training });
  } catch (err) {
    res.status(400).json({ success: false, message: "Update Failed", error: err.message });
  }
};

// ===========================
// DELETE
// ===========================
exports.deleteRecurrentTraining = async (req, res) => {
  try {
    // 🚩 UPDATED PERMISSION: Included 'team_leader'
    const authorizedRoles = ["superadmin", "manager", "team_leader"];
    
    if (!authorizedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied: Leadership role required to delete training records." 
      });
    }

    const training = await RecurrentTraining.findByIdAndDelete(req.params.id);
    if (!training) return res.status(404).json({ success: false, message: "Record not found" });
    
    res.json({ success: true, message: "Training record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete Failed" });
  }
};