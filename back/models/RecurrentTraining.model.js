const mongoose = require("mongoose");

const recurrentSchema = new mongoose.Schema({
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

  // Dates specific to compliance cycles
  tentativeScheduleDate: { type: Date },
  
  remark: { 
    type: String, 
    enum: ["pending", "taken"], 
    default: "pending" 
  },

  // Context fields for management reporting
  category: { type: String, default: "Recurrent Training" },
  costCenter: { type: String },
  department: { type: String },

  createdBy: { type: String },
  lastModifiedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.RecurrentTraining || mongoose.model("RecurrentTraining", recurrentSchema);