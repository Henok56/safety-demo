const express = require("express");
const router = express.Router();

const FleetAssignmentController = require("../controllers/FleetAssignmentController");

// ==============================
// BASE: /api/fleet-assignments
// ==============================

// 1. GET ALL ASSIGNMENTS (with optional date filter)
router.get("/", FleetAssignmentController.getAllAssignment);

// 2. GET ALL EMPLOYEES (dropdown)
router.get("/employees", FleetAssignmentController.getAllEmployees);

// 3. GET ASSIGNMENTS BY EMPLOYEE
router.get("/employee/:employeeId", FleetAssignmentController.getEmployeeAssignment);

// 4. GET SINGLE ASSIGNMENT
router.get("/:id", FleetAssignmentController.getAssignmentById);

// 5. CREATE ASSIGNMENT
router.post("/", FleetAssignmentController.createAssignment);

// 6. UPDATE ASSIGNMENT
router.put("/:id", FleetAssignmentController.updateAssignment);

// 7. DELETE ASSIGNMENT
router.delete("/:id", FleetAssignmentController.deleteAssignment);

module.exports = router;