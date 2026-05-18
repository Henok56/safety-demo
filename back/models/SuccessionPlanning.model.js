const mongoose = require("mongoose");

const successionSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", // Reference Employee → User
    required: true 
  },

  // Optional HR info from Employee
  costCenter: { type: String },
  currentPosition: { type: String, required: true }, // Auto-fill from Employee
  department: { type: String },                       // Auto-fill from Employee

  groomedForPosition: { type: String, required: true },
  actingAssignment: {
    detail: { type: String },
    scheduleMonth: { type: Date }
  },
  projectAssignments: {
    detail: { type: String },
    scheduleMonth: { type: Date }
  },
  exposureOpportunities: {
    detail: { type: String },
    scheduleMonth: { type: Date }
  },
 
  remark: { 
    type: String, 
    enum: ["pending", "taken"], 
    default: "pending" 
  },

  createdBy: { type: String },       // Username of creator
  lastModifiedBy: { type: String }   // Username of last modifier
}, { timestamps: true });

module.exports = mongoose.models.SuccessionPlanning || mongoose.model("SuccessionPlanning", successionSchema);