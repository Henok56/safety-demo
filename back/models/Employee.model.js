const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  userAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links back to User
    required: true,
    unique: true // One User → One Employee profile
  },
  costCenter: String,
  currentPosition: String,
  department: String,
  dateOfJoining: Date,
  onboardedBy: String,
  lastUpdatedBy: String,
  status: { type: String, default: "active" },
}, { timestamps: true });

module.exports = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);