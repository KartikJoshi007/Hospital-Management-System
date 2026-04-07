const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { protect } = require("../middleware/authMiddleware");

// All routes require protection
router.use(protect);

router.post("/", scheduleController.createScheduleEvent);
router.delete("/:id", scheduleController.deleteScheduleEvent);
router.get("/doctor/:doctorId", scheduleController.getDoctorSchedule);

module.exports = router;
