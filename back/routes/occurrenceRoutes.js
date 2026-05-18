const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyAdminMiddleware");
const {
  createOccurrence,
  getOccurrences,
  updateOccurrence,
  deleteOccurrence,
} = require("../controllers/occurrenceController");
const upload = require("../middleware/uploadMiddleware");

/**
 * Occurrence Permissions:
 * - READ:   Anyone logged in (user, scheduler, team_leader, manager, superadmin)
 * - CREATE: Anyone logged in
 * - UPDATE: Anyone logged in
 * - DELETE: Superadmin, Manager, Team Leader ONLY
 */

// 1. READ: Open to all authenticated users
router.get("/", authMiddleware, getOccurrences);

// 2. CREATE: Open to all authenticated users (Encourages safety reporting)
router.post("/", 
  authMiddleware, 
  upload.single("reportSource"), 
  createOccurrence
);

// 3. UPDATE: Open to all authenticated users
router.put("/:id", 
  authMiddleware, 
  upload.single("reportSource"), 
  updateOccurrence
);

// 4. DELETE: RESTRICTED to Leadership
// Normal 'user' and 'scheduler' will get a 403 Forbidden
router.delete("/:id", 
  authMiddleware, 
  verifyRole(["superadmin", "manager", "team_leader"]), 
  deleteOccurrence
);

module.exports = router;