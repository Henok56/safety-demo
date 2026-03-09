const Employee = require("../models/Employee.model");
const User = require("../models/User");

// 🚩 PULL ALL: Identity data pulled from User table
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userAccount", "userid firstname lastname") // Pull common attributes
      .sort({ createdAt: -1 });

    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🚩 CREATE/LINK: Automatically handles existing records
exports.createEmployee = async (req, res) => {
  try {
    const { userAccount } = req.body;

    // findOneAndUpdate with upsert: true handles both new and existing profiles
    const employee = await Employee.findOneAndUpdate(
      { userAccount }, 
      { 
        ...req.body, 
        onboardedBy: req.user?.userid || "System",
        lastUpdatedBy: req.user?.userid || "System" 
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Update the User document to store the link
    await User.findByIdAndUpdate(userAccount, { employeeProfile: employee._id });

    res.status(201).json({
      success: true,
      message: "Employee profile linked and saved successfully",
      data: employee
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 🚩 GET AVAILABLE: Dropdown data
exports.getAvailableUsers = async (req, res) => {
  try {
    const users = await User.find({
      $or: [{ employeeProfile: { $exists: false } }, { employeeProfile: null }]
    }).select("userid firstname lastname");

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching available users" });
  }
};

// 🚩 GET ONE
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("userAccount", "userid firstname lastname");
    
    if (!employee) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { firstName, lastName, regNo, department, status, remark } = req.body;

    // 1. Update the Employee document first
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { 
        department, 
        status, 
        remark, 
        lastUpdatedBy: req.user?.userid || "System" 
      },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // 2. Update the linked UserAccount document
    // We use employee.userAccount (the ID stored in the employee record)
    if (employee.userAccount) {
      await User.findByIdAndUpdate(employee.userAccount, {
        firstname: firstName,
        lastname: lastName,
        userid: regNo // Syncing Registration Number to User ID
      });
    }

    // 3. Return the fully populated updated record
    const updatedRecord = await Employee.findById(req.params.id).populate("userAccount");

    res.json({ success: true, data: updatedRecord });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(400).json({ success: false, message: "Update failed: " + err.message });
  }
};

// 🚩 DELETE: Cleans up the link in the User model
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Not found" });

    // Remove the profile link from the User so they can be re-onboarded
    await User.findOneAndUpdate(
      { employeeProfile: employee._id },
      { $unset: { employeeProfile: "" } }
    );

    res.json({ success: true, message: "Employee record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};