const express = require("express");
const router = express.Router();
const fdmController = require("../controllers/fdmController");

// =========================
// BASE ROUTE
// =========================
router
  .route("/")
  .get(fdmController.getAllFdmEvents)
  .post(fdmController.createFdmEvent);

// =========================
// SINGLE EVENT
// =========================
router
  .route("/:id")
  .get(fdmController.getFdmEvent)
  .patch(fdmController.updateFdmEvent)
  .delete(fdmController.deleteFdmEvent);

// =========================
// DISCUSSION
// =========================
router.post("/:id/discussion", fdmController.addDiscussionEntry);

module.exports = router;