const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    console.log("🔍 getAllUsers called - User ID:", req.user.userid, "Role:", req.user.role);

    const users = await User.find({}, "userid firstname lastname role email createdAt");

    console.log(`✅ Found ${users.length} users`);

    res.json({
      success: true,
      data: users,
      message: "Users retrieved successfully",
    });
  } catch (err) {
    console.error("❌ getAllUsers error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.updateUserRole = async (req, res) => {
  res.json({ success: false, message: "Not implemented" });
};

exports.makeAdmin = async (req, res) => {
  res.json({ success: false, message: "Not implemented" });
};

exports.deleteUser = async (req, res) => {
  res.json({ success: false, message: "Not implemented" });
};
