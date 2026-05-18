const FleetAssignment = require("../models/FleetAssignment");
const Employee = require("../models/Employee.model");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * ==============================
 * 1. GET ALL ASSIGNMENTS
 * ==============================
 */
exports.getAllAssignment = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      query = {
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } }
        ]
      };
    }

    const data = await FleetAssignment.find(query)
      .populate({
        path: "employeeId",
        select: "regNo department currentPosition",
        populate: {
          path: "userAccount",
          select: "firstname lastname",
        },
      })
      .sort({ startDate: -1 });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ==============================
 * 2. GET EMPLOYEE ASSIGNMENTS
 * ==============================
 */
exports.getEmployeeAssignment = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!isValidId(employeeId)) {
      return res.status(400).json({ message: "Invalid employeeId" });
    }

    const data = await FleetAssignment.find({ employeeId })
      .populate({
        path: "employeeId",
        populate: {
          path: "userAccount",
          select: "firstname lastname",
        },
      })
      .sort({ startDate: -1 });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ==============================
 * HELPER: Check overlaps (max 2 per period)
 * ==============================
 */
const checkOverlappingAssignments = async (employeeId, startDate, endDate, excludeId = null) => {
  const query = {
    employeeId,
    startDate: { $lte: endDate || new Date("9999-12-31") },
  };

  // For endDate: if null/undefined, treat as ongoing
  if (endDate) {
    query.endDate = { $gte: startDate };
  } else {
    // If creating with no endDate, check if there are any conflicting assignments
    query.$or = [
      { endDate: { $gte: startDate } },
      { endDate: null },
    ];
  }

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return await FleetAssignment.find(query);
};

/**
 * ==============================
 * 3. CREATE ASSIGNMENT
 * ==============================
 */
exports.createAssignment = async (req, res) => {
  try {
    const { employeeId, fleetFamily, startDate, endDate } = req.body;

    // Required fields
    if (!employeeId || !fleetFamily || !startDate) {
      return res.status(400).json({ 
        message: "Missing required fields: employeeId, fleetFamily, startDate" 
      });
    }

    if (!isValidId(employeeId)) {
      return res.status(400).json({ message: "Invalid employeeId" });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && start > end) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check overlaps - max 2 fleets per period
    const overlaps = await checkOverlappingAssignments(employeeId, start, end);
    if (overlaps.length >= 2) {
      return res.status(400).json({
        message: `Employee already has 2 fleet assignments in this period. Fleets: ${overlaps
          .map((o) => o.fleetFamily)
          .join(", ")}`
      });
    }

    const assignment = new FleetAssignment({
      employeeId,
      fleetFamily,
      startDate: start,
      endDate: end,
    });

    await assignment.save();

    const result = await FleetAssignment.findById(assignment._id).populate({
      path: "employeeId",
      populate: {
        path: "userAccount",
        select: "firstname lastname",
      },
    });

    res.status(201).json({ success: true, data: result });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * ==============================
 * 4. UPDATE ASSIGNMENT
 * ==============================
 */
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const assignment = await FleetAssignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const start = req.body.startDate ? new Date(req.body.startDate) : assignment.startDate;
    const end = req.body.endDate ? new Date(req.body.endDate) : (req.body.endDate === null ? null : assignment.endDate);

    if (end && start > end) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Check overlaps (excluding current assignment)
    const overlaps = await checkOverlappingAssignments(
      assignment.employeeId,
      start,
      end,
      id
    );

    if (overlaps.length >= 2) {
      return res.status(400).json({
        message: `Cannot update: Employee would have more than 2 fleets in this period. Fleets: ${overlaps
          .map((o) => o.fleetFamily)
          .join(", ")}`
      });
    }

    if (req.body.fleetFamily) assignment.fleetFamily = req.body.fleetFamily;
    if (req.body.startDate) assignment.startDate = start;
    if (req.body.hasOwnProperty("endDate")) assignment.endDate = end;

    await assignment.save();

    const updated = await FleetAssignment.findById(id).populate({
      path: "employeeId",
      populate: {
        path: "userAccount",
        select: "firstname lastname",
      },
    });

    res.json({ success: true, data: updated });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * ==============================
 * 4.5. GET SINGLE ASSIGNMENT
 * ==============================
 */
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const assignment = await FleetAssignment.findById(id).populate({
      path: "employeeId",
      populate: {
        path: "userAccount",
        select: "firstname lastname",
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ success: true, data: assignment });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ==============================
 * 5. DELETE ASSIGNMENT
 * ==============================
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const deleted = await FleetAssignment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ success: true, message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ==============================
 * 6. GET ALL EMPLOYEES
 * ==============================
 */
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .select("regNo department currentPosition userAccount")
      .populate("userAccount", "firstname lastname")
      .sort({ regNo: 1 });

    res.json({ success: true, data: employees });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};