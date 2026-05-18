const Training = require("../models/Training.model");

// ===========================
// GET ALL (Supports filtering by Category)
// ===========================
exports.getTrainings = async (req, res) => {
  try {
    const { category } = req.query;
    // Handles 'All' or specific categories (Coaching, Leadership, etc.)
    const query = category && category !== "All" ? { category } : {};
    
    const data = await Training.find(query).sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      count: data.length,
      data 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// CREATE
// ===========================
exports.createTraining = async (req, res) => {
  try {
    // Audit tracking using the authenticated user from your auth middleware
    const trainingData = {
      ...req.body,
      createdBy: req.user.username,
      lastModifiedBy: req.user.username
    };

    const newTopic = new Training(trainingData);
    await newTopic.save();
    
    res.status(201).json({ 
      success: true, 
      message: `Successfully added "${newTopic.topic}" to ${newTopic.category}`,
      data: newTopic 
    });
  } catch (err) {
    // This will now catch "enum" validation errors if the category isn't in our list
    res.status(400).json({ success: false, message: err.message });
  }
};

// ===========================
// DELETE
// ===========================
exports.deleteTraining = async (req, res) => {
  try {
    // Role-based access control
    const authorizedRoles = ["superadmin", "manager", "team_leader"];
    
    if (!authorizedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Unauthorized to modify training curriculum." 
      });
    }

    const deletedTopic = await Training.findByIdAndDelete(req.params.id);
    
    if (!deletedTopic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    res.json({ 
      success: true, 
      // ✅ FIXED: Changed .title to .topic to match your schema
      message: `Training topic "${deletedTopic.topic}" deleted successfully.` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};