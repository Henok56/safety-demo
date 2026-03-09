const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  userid: { type: String, required: true, unique: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "superadmin", "manager", "team_leader", "fdm_officer", "scheduler"],
    default: "user"
  },
  employeeProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee" 
  },
  specialPermissions: [String],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);