// controllers/hazardTrackingController.js
const HazardTracking = require("../models/HazardTracking");

exports.logHazard = async (req, res) => {
  try {
    console.log("📝 Request body:", req.body);
    
    const { sequentialNumber, submittedAt } = req.body;
    
    if (!sequentialNumber) {
      return res.status(400).json({
        success: false,
        message: "Sequential number is required"
      });
    }
    
    // Generate hazard ID
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hazardId = `HAZ-FLT-${sequentialNumber}-${month}${year}`;
    const monthYear = `${month}-${year}`;
    
    console.log("Generated ID:", hazardId);
    console.log("MonthYear:", monthYear);
    
    // Check for duplicate
    const existing = await HazardTracking.findOne({ hazardId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Hazard ${hazardId} already exists`,
        data: existing
      });
    }
    
    // Create new hazard
    const hazard = new HazardTracking({
      hazardId,
      sequentialNumber,
      monthYear,  // Set manually
      submittedAt: submittedAt || new Date()
    });
    
    await hazard.save();
    console.log("✅ Hazard saved:", hazard._id);
    
    // Get monthly count
    const monthlyHazards = await HazardTracking.find({ monthYear, status: "active" });
    
    res.status(201).json({
      success: true,
      data: hazard,
      compliance: {
        submitted: monthlyHazards.length,
        required: 4,
        compliant: monthlyHazards.length >= 4,
        remaining: Math.max(0, 4 - monthlyHazards.length),
        hazardIds: monthlyHazards.map(h => h.hazardId)
      },
      message: `Hazard ${hazardId} logged successfully`
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This Hazard ID already exists"
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: error.stack
    });
  }
};

// Get status
exports.getMyStatus = async (req, res) => {
  try {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const monthYear = `${month}-${year}`;
    
    const hazards = await HazardTracking.find({ monthYear, status: "active" });
    
    res.json({
      success: true,
      data: {
        submitted: hazards.length,
        required: 4,
        compliant: hazards.length >= 4,
        remaining: Math.max(0, 4 - hazards.length),
        hazardIds: hazards.map(h => h.hazardId)
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get history
exports.getMyHistory = async (req, res) => {
  try {
    const hazards = await HazardTracking.find({ status: "active" }).sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      data: {
        total: hazards.length,
        all: hazards,
        monthly: []
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete hazard
exports.deleteHazard = async (req, res) => {
  try {
    const { id } = req.params;
    const hazard = await HazardTracking.findByIdAndUpdate(
      id, 
      { status: "archived" }, 
      { new: true }
    );
    
    if (!hazard) {
      return res.status(404).json({ success: false, message: "Hazard not found" });
    }
    
    res.json({ success: true, message: "Hazard archived successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};