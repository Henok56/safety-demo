// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Employee = require("../models/Employee.model");

// =====================
// REGISTER
// =====================
exports.register = async (req, res) => {
  try {
    const { userid, email, password, firstname, lastname, role } = req.body;

    const existing = await User.findOne({
      $or: [{ userid }, { email }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const employee = await Employee.findOne({ regNo: userid });

    const user = await User.create({
      userid,
      email,
      firstname,
      lastname,
      role: "user",
      password,
      employeeProfile: employee ? employee._id : null,
    });

    if (employee) {
      employee.userAccount = user._id;
      await employee.save();
    }

    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// LOGIN
// =====================
exports.login = async (req, res) => {
  try {
    const { userid, password } = req.body;

    const user = await User.findOne({ userid }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, userid: user.userid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      success: true,
      data: {
        accessToken: token,
        user: {
          id: user._id,
          userid: user.userid,
          role: user.role,
          firstname: user.firstname,
          lastname: user.lastname,
        },
      },
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// GET ME
// =====================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("employeeProfile");

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// LOGOUT
// =====================
exports.logout = async (req, res) => {
  return res.json({ success: true, message: "Logged out" });
};

// =====================
// RESET PASSWORD
// =====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = password;
    await user.save();

    return res.json({
      success: true,
      message: "Password updated",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// CHECK EMPLOYEE PROFILE
// =====================
exports.checkEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("employeeProfile");

    return res.json({
      success: true,
      hasProfile: !!user.employeeProfile,
      employee: user.employeeProfile || null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// REGISTER EMPLOYEE PROFILE
// =====================
exports.registerEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let employee = await Employee.findOne({ regNo: user.userid });

    if (!employee) {
      employee = await Employee.create({
        regNo: user.userid,
        userAccount: user._id,
      });
    }

    user.employeeProfile = employee._id;
    await user.save();

    return res.json({
      success: true,
      message: "Employee profile linked",
      employee,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// GET ALL EMPLOYEES
// =====================
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("userAccount");

    return res.json({ success: true, data: employees });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// GET ALL USERS
// =====================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// GET USERS WITH PROFILE
// =====================
exports.getAllUsersWithProfile = async (req, res) => {
  try {
    const users = await User.find().populate("employeeProfile");

    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// CHECK SPECIFIC USER PROFILE
// =====================
exports.checkUserEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("employeeProfile");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      hasProfile: !!user.employeeProfile,
      employee: user.employeeProfile || null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};