const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/stats", protect, authorize("admin", "reception"), dashboardController.getDashboardStats);
router.get("/appointments-chart", protect, authorize("admin", "reception"), dashboardController.getAppointmentChartData);

module.exports = router;
