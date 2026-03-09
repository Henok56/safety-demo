const User = require("../models/User");

// --------------------
// GET all users
// --------------------
exports.getAllUsers = async (req, res) => {
  try {
    // SECURED: Strictly Superadmin only. 
    // Managers and Team Leaders should not see the full login manifest.
    if (req.user.role !== "superadmin") {
      console.warn(`Unauthorized access attempt to user list by: ${req.user.userid} (Role: ${req.user.role})`);
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Superadmin authority required" 
      });
    }

    const users = await User.find({}, "userid role email createdAt");

    res.json({
      success: true,
      data: users,
      message: "Users retrieved successfully",
    });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// --------------------
// UPDATE User Role
// --------------------
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params; 
    const { role } = req.body;

    // ONLY Superadmin can change roles
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Forbidden: Superadmin authority required" });
    }

    // Prevent self-demotion (Locked to ensure the system always has 1 Superadmin)
    if (req.user.id === id) {
      return res.status(400).json({ success: false, message: "You cannot change your own role settings." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User account not found" });
    }

    res.json({
      success: true,
      message: `User ${updatedUser.userid} updated to role: ${role}`,
      data: updatedUser
    });
  } catch (err) {
    console.error("updateUserRole error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// --------------------
// DELETE a user
// --------------------
exports.deleteUser = async (req, res) => {
  const { userid } = req.params;

  try {
    // ONLY Superadmin can delete accounts
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Forbidden: Superadmin authority required" });
    }

    const userToDelete = await User.findOne({ userid });
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // PROTECTION: Cannot delete Superadmins
    if (userToDelete.role === "superadmin") {
      return res.status(403).json({ success: false, message: "Security Protocol: Cannot delete a Superadmin account via this endpoint." });
    }

    await User.deleteOne({ userid });

    res.json({
      success: true,
      message: `Account '${userid}' has been purged from the system.`,
    });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.makeAdmin = async (req, res) => {
  res.status(410).json({ message: "This endpoint is deprecated. Use updateUserRole to manage new roles (manager, team_leader, scheduler)." });
};