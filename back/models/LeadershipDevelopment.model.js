const mongoose = require("mongoose");

const leadershipSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", 
    required: true 
  },

  // 🔗 Reference to the master Training table (Registry)
  trainingType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Training",
    required: true
  },

  groomedForPosition: {
    type: String,
    required: true // e.g., "Senior VP", "Director"
  },

  preferredSchedule: { type: Date },
  
  remark: {
    type: String,
    enum: ["pending", "taken"],
    default: "pending"
  },

  // Inherited Meta (for high-speed reporting)
  costCenter: { type: String },
  department: { type: String },

  createdBy: { type: String },
  lastModifiedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.LeadershipDevelopment || mongoose.model("LeadershipDevelopment", leadershipSchema);