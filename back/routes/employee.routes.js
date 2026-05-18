const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
const authMiddleware = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyAdminMiddleware");

// All routes require a valid JWT
router.use(authMiddleware);

// 🚩 Fetch users who don't have a profile yet (MUST be above /:id)
router.get(
  "/available-users", 
  verifyRole(["superadmin", "manager", "team_leader", "user"]), 
  employeeController.getAvailableUsers
);

// Base routes for listing and creating
router.route("/")
  .get(
    verifyRole(["superadmin", "manager", "team_leader", "user"]), 
    employeeController.getEmployees
  )
  .post(
    verifyRole(["superadmin", "manager"]), 
    employeeController.createEmployee
  );

// Single record operations
router.route("/:id")
  .get(
    verifyRole(["superadmin", "manager", "team_leader", "user"]), 
    employeeController.getEmployee
  )
  .put(
    verifyRole(["superadmin", "manager"]), 
    employeeController.updateEmployee
  )
  .delete(
    verifyRole(["superadmin"]), 
    employeeController.deleteEmployee
  );

module.exports = router;