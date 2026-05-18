// controllers/employee.controller.js

const mongoose = require("mongoose");
const Employee = require("../models/Employee.model");
const User = require("../models/User");

// =========================
// 🔐 HELPERS
// =========================

const sendError = (res, code, message) =>
  res.status(code).json({ success: false, message });

const sendSuccess = (res, data, meta = {}) =>
  res.json({ success: true, data, ...meta });

const getUser = (req) => req.user || null;

// =========================
// 🚩 GET ALL EMPLOYEES
// =========================
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userAccount", "userid firstname lastname email role")
      .sort({ createdAt: -1 });

    return sendSuccess(res, employees, {
      count: employees.length,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// =========================
// 🚩 CREATE / LINK EMPLOYEE
// =========================
exports.createEmployee = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userAccount, department, currentPosition, costCenter, dateOfJoining } = req.body;

    if (!userAccount) {
      return sendError(res, 400, "User account is required");
    }

    const user = await User.findById(userAccount).session(session);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const existingEmployee = await Employee.findOne({ userAccount }).session(session);

    if (existingEmployee) {
      return sendError(res, 400, "Employee already linked to this user");
    }

    const employee = await Employee.create(
      [
        {
          userAccount,
          regNo: user.userid,
          department,
          currentPosition,
          costCenter,
          dateOfJoining: dateOfJoining || new Date(),
          onboardedBy: getUser(req)?.userid || "System",
          lastUpdatedBy: getUser(req)?.userid || "System",
          status: "active",
        },
      ],
      { session }
    );

    const createdEmployee = employee[0];

    await User.findByIdAndUpdate(
      userAccount,
      { employeeProfile: createdEmployee._id },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, createdEmployee, {
      message: "Employee created and linked successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return sendError(res, 500, err.message);
  }
};

// =========================
// 🚩 GET AVAILABLE USERS (NOT LINKED)
// =========================
exports.getAvailableUsers = async (req, res) => {
  try {
    const users = await User.find({
      $or: [{ employeeProfile: null }, { employeeProfile: { $exists: false } }],
    }).select("userid firstname lastname email role");

    return sendSuccess(res, users);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// =========================
// 🚩 GET SINGLE EMPLOYEE
// =========================
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "userAccount",
      "userid firstname lastname email role"
    );

    if (!employee) {
      return sendError(res, 404, "Employee not found");
    }

    return sendSuccess(res, employee);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// =========================
// 🚩 UPDATE EMPLOYEE (SYNC SAFE)
// =========================
exports.updateEmployee = async (req, res) => {
  try {
    const { firstName, lastName, regNo, department, status, currentPosition, costCenter } =
      req.body;

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return sendError(res, 404, "Employee not found");
    }

    // update employee
    employee.department = department ?? employee.department;
    employee.status = status ?? employee.status;
    employee.currentPosition = currentPosition ?? employee.currentPosition;
    employee.costCenter = costCenter ?? employee.costCenter;
    employee.lastUpdatedBy = getUser(req)?.userid || "System";

    await employee.save();

    // sync user only if linked
    if (employee.userAccount) {
      await User.findByIdAndUpdate(employee.userAccount, {
        firstname: firstName,
        lastname: lastName,
        userid: regNo,
      });
    }

    const updated = await Employee.findById(req.params.id).populate("userAccount");

    return sendSuccess(res, updated, {
      message: "Employee updated successfully",
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// =========================
// 🚩 DELETE EMPLOYEE (SAFE UNLINK)
// =========================
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return sendError(res, 404, "Employee not found");
    }

    await Employee.findByIdAndDelete(req.params.id);

    if (employee.userAccount) {
      await User.findByIdAndUpdate(employee.userAccount, {
        $unset: { employeeProfile: "" },
      });
    }

    return sendSuccess(res, null, {
      message: "Employee deleted successfully",
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};