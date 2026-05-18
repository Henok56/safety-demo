const mongoose = require("mongoose");

const coachingSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", 
    required: true 
  },
  
  // 🔗 Link to the specific coaching topic in your Training Registry
  trainingType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Training",
    required: true
  },

  proposedPLLevel: { type: String, required: true },
  coachingScheduleStartMonth: { type: Date },
  coachingScheduleEndMonth: { type: Date },

  remark: { 
    type: String, 
    enum: ["pending", "taken"], 
    default: "pending" 
  },

  // Inherited fields for quick reporting
  costCenter: { type: String },
  department: { type: String },

  createdBy: { type: String },
  lastModifiedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Coaching || mongoose.model("Coaching", coachingSchema);