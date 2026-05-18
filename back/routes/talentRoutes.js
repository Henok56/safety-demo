/* routes/talentRoutes.js */
const express = require("express");
const router = express.Router();

// 1. Named Import (Keep the braces because the controller uses exports.getMyTalentSummary)
const { getMyTalentSummary } = require("../controllers/talents.controller");

// 2. Default Import (REMOVE the braces because the middleware uses module.exports)
const protect = require("../middleware/authMiddleware"); 

// Now 'protect' is a valid function, and the TypeError will disappear.
router.get("/my-summary", protect, getMyTalentSummary);

module.exports = router;