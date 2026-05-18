// controllers/adminController.js

const User = require("../models/User");
const Employee = require("../models/Employee.model");

// =========================
// GET ALL USERS
// =========================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .populate("employeeProfile");

    const data = users.map((user) => ({
      _id: user._id,
      userid: user.userid,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      hasEmployeeProfile: !!user.employeeProfile,
      employeeProfile: user.employeeProfile || null,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =========================
// UPDATE USER ROLE
// =========================
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = [
      "user",
      "superadmin",
      "manager",
      "team_leader",
      "fdm_officer",
      "scheduler",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =========================
// MAKE ADMIN
// =========================
exports.makeAdmin = async (req, res) => {
  try {
    const { userId, role = "manager" } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "Role updated successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =========================
// DELETE USER
// =========================
exports.deleteUser = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOneAndDelete({ userid: username });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};