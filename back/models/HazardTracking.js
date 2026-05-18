// models/HazardTracking.js - Without pre-save middleware
const mongoose = require("mongoose");

const HazardTrackingSchema = new mongoose.Schema({
  hazardId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  sequentialNumber: {
    type: String,
    required: true
  },
  loggedBy: { 
    type: String, 
    default: "Demo User"
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  monthYear: { 
    type: String 
  },
  status: {
    type: String,
    enum: ["active", "archived"],
    default: "active"
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("HazardTracking", HazardTrackingSchema);