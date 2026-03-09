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

    if (!userid || !email || !password || !firstname || !lastname) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields (Staff ID, Email, Password, Name) are mandatory." 
      });
    }

    const existingUser = await User.findOne({ $or: [{ userid }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Staff ID or Email already registered" });
    }

    // 🚩 LOOKUP: Match user to existing Employee/Pilot record by ID
    const employee = await Employee.findOne({ regNo: userid });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ 
      firstname,
      lastname,
      userid, 
      email, 
      password: hashedPassword, 
      role: role || "user",
      employeeProfile: employee ? employee._id : null 
    });
    
    const savedUser = await newUser.save();

    // 🚩 SYNC: If employee found, link this user account back to the employee record
    if (employee) {
      employee.userAccount = savedUser._id;
      await employee.save();
    }
    
    res.status(201).json({ 
      success: true, 
      message: `Personnel record for ${firstname} created successfully.` 
    });

  } catch (err) {
    console.error("🔴 Register error:", err);
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
  }
};

// =====================
// LOGIN
// =====================
exports.login = async (req, res) => {
  try {
    const { userid, password } = req.body;

    // 1. Find User and populate their full Pilot/Employee details
    const user = await User.findOne({ userid }).populate("employeeProfile");
    
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // 3. 🛡️ SELF-HEALING: Fix broken links between User and Employee collections
    if (!user.employeeProfile) {
      // Search by Staff ID (regNo) if the ObjectID link is missing
      const employee = await Employee.findOne({ regNo: user.userid });
      
      if (employee) {
        user.employeeProfile = employee._id;
        employee.userAccount = user._id; // Ensure bi-directional link
        await user.save();
        await employee.save();
        
        // Re-fetch user with the now-linked profile for the response
        await user.populate("employeeProfile");
      }
    }

    // 4. Token generation
    const token = jwt.sign(
      { id: user._id, userid: user.userid, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "12h" }
    );

    res.status(200).json({
      success: true,
      data: { 
        accessToken: token, 
        user: { 
          id: user._id, 
          userid: user.userid, 
          role: user.role,
          firstname: user.firstname,
          lastname: user.lastname,
          profile: user.employeeProfile // This now contains the full FDM/Training data
        } 
      },
    });
  } catch (err) {
    console.error("Login Crash:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================
// GET CURRENT USER
// =====================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("employeeProfile");
      
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =====================
// RESET PASSWORD
// =====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.logout = (req, res) => res.json({ success: true, message: "Logged out" });