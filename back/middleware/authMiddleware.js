const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import User model
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get full user data from database (including employeeProfile)
    // This is important for the unproductive time controller
    const user = await User.findById(decoded.userId || decoded._id || decoded.id)
      .select("-password");
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    
    // Attach complete user object to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized - No user" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: ${req.user.role} role does not have access. Required roles: ${roles.join(", ")}` 
      });
    }
    next();
  };
};

// Check if user has employee profile
const requireEmployeeProfile = async (req, res, next) => {
  try {
    if (!req.user.employeeProfile) {
      return res.status(400).json({ 
        success: false, 
        message: "Please create your employee profile first. Contact HR to set up your profile." 
      });
    }
    
    const Employee = require("../models/Employee.model");
    const employee = await Employee.findById(req.user.employeeProfile);
    
    if (!employee) {
      return res.status(400).json({ 
        success: false, 
        message: "Employee profile not found. Please contact HR." 
      });
    }
    
    if (employee.userAccount && employee.userAccount.toString() !== req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "Profile mismatch. Please contact HR to correct your employee profile." 
      });
    }
    
    req.employee = employee;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Optional: Check if user is admin or has specific role
const isAdmin = authorize("superadmin", "manager", "team_leader");
const isSuperAdmin = authorize("superadmin");
const isManager = authorize("superadmin", "manager");

// This is the essential part that fixes the "Argument handler" errors
auth.protect = auth;
auth.authorize = authorize;
auth.requireEmployeeProfile = requireEmployeeProfile;
auth.isAdmin = isAdmin;
auth.isSuperAdmin = isSuperAdmin;
auth.isManager = isManager;

module.exports = auth;