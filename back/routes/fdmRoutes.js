const express = require('express');
const router = express.Router();
const fdmController = require('../controllers/fdmController');
const auth = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyAdminMiddleware");
const upload = require('../middleware/uploadMiddleware');

router.use(auth); // Protect all routes

router.get('/', verifyRole(["superadmin", "manager", "fdm_officer"]), fdmController.getAllEvents);
router.post('/', verifyRole(["superadmin", "manager", "fdm_officer"]), upload.single('attachment'), fdmController.createEvent);
router.put('/:id', verifyRole(["superadmin", "manager", "fdm_officer"]), fdmController.updateEvent);
router.patch('/:id/close', verifyRole(["superadmin", "manager", "fdm_officer"]), fdmController.updateEvent);
router.delete('/:id', verifyRole(["superadmin", "manager", "fdm_officer"]), fdmController.deleteEvent);

module.exports = router;