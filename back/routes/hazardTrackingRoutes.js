// routes/hazardTrackingRoutes.js
const express = require('express');
const router = express.Router();
const hazardController = require('../controllers/hazardTrackingController');

// ==================== HAZARD TRACKING ROUTES ====================

// Create a new hazard (POST /api/hazard-tracking)
router.post('/', hazardController.logHazard);

// Get current month's hazard status (GET /api/hazard-tracking/my-status)
router.get('/my-status', hazardController.getMyStatus);

// Get user's hazard history (GET /api/hazard-tracking/my-history)
router.get('/my-history', hazardController.getMyHistory);

// Delete/Archive a hazard (DELETE /api/hazard-tracking/:id)
router.delete('/:id', hazardController.deleteHazard);

// Optional: Get single hazard by ID (GET /api/hazard-tracking/:id)
router.get('/:id', async (req, res) => {
  try {
    const HazardTracking = require('../models/HazardTracking');
    const hazard = await HazardTracking.findById(req.params.id);
    if (!hazard) {
      return res.status(404).json({ success: false, message: "Hazard not found" });
    }
    res.json({ success: true, data: hazard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Optional: Update a hazard (PUT /api/hazard-tracking/:id)
router.put('/:id', async (req, res) => {
  try {
    const HazardTracking = require('../models/HazardTracking');
    const { sequentialNumber, submittedAt } = req.body;
    
    const hazard = await HazardTracking.findById(req.params.id);
    if (!hazard) {
      return res.status(404).json({ success: false, message: "Hazard not found" });
    }
    
    if (sequentialNumber) {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      hazard.hazardId = `HAZ-FLT-${sequentialNumber}-${month}${year}`;
      hazard.sequentialNumber = sequentialNumber;
    }
    
    if (submittedAt) {
      hazard.submittedAt = submittedAt;
    }
    
    await hazard.save();
    res.json({ success: true, data: hazard, message: "Hazard updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;