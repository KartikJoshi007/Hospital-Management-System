const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { doctorValidator } = require("../validators/doctorValidator");
const validate = require("../middleware/validatorMiddleware");

const { protect, authorize } = require("../middleware/authMiddleware");

// Base route
router
  .route("/")
  .post(protect, authorize("admin"), doctorValidator, validate, doctorController.createDoctor)
  .get(protect, doctorController.getAllDoctors);

router.get("/stats", protect, authorize("admin", "doctor"), doctorController.getDoctorStats);
router.get("/user/:userId", protect, doctorController.getDoctorByUserId);

// Dedicated route to update roleLevel only (no full validator needed)
router.patch("/:id/role-level", protect, authorize("admin"), doctorController.updateRoleLevel);
router.get("/:id/patient-count", protect, doctorController.getDoctorPatientCount);
router.get("/:id/patients", protect, doctorController.getMyPatients);
router.patch("/:id/duty", protect, authorize("doctor"), doctorController.toggleDutyStatus);

// ID routes
router
  .route("/:id")
  .get(protect, doctorController.getDoctorById)
  .put(protect, authorize("admin"), doctorValidator, validate, doctorController.updateDoctor)
  .delete(protect, authorize("admin"), doctorController.deleteDoctor);

module.exports = router;
