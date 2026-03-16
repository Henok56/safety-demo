const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  regNo: {
    type: String,
    unique: true,
    sparse: true
  },
  userAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    sparse: true
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