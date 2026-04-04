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
router.get("/user/:userId", protect, doctorController.getDoctorByUserId); // ✅ Added

// ID routes
router
  .route("/:id")
  .get(protect, doctorController.getDoctorById)
  .put(protect, authorize("admin"), doctorValidator, validate, doctorController.updateDoctor)
  .delete(protect, authorize("admin"), doctorController.deleteDoctor);

module.exports = router;
