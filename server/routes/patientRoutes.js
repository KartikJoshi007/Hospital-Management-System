const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const {
  patientValidator,
  patientUpdateValidator,
  patientIdParamValidator,
  userIdParamValidator,
} = require("../validators/patientValidator");
const validate = require("../middleware/validatorMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");

// Stats route (must be before :id routes)
router.get("/stats", protect, authorize("admin", "doctor"), patientController.getPatientStats);

// Search route (must be before :id routes)
router.get("/search/:query", protect, authorize("admin", "doctor"), patientController.searchPatients);

// User-specific route (must be before :id routes)
router.get("/user/:userId", protect, userIdParamValidator, validate, patientController.getPatientByUserId);

// Base routes (protected)
router
  .route("/")
  .post(protect, authorize("admin", "doctor", "patient"), patientValidator, validate, patientController.createPatient)
  .get(protect, authorize("admin", "doctor", "reception"), patientController.getAllPatients);

// ID-specific routes
router
  .route("/:id")
  .get(protect, patientIdParamValidator, validate, patientController.getPatientById)
  .put(protect, authorize("admin", "doctor"), patientIdParamValidator, patientUpdateValidator, validate, patientController.updatePatient)
  .delete(protect, authorize("admin"), patientIdParamValidator, validate, patientController.deletePatient);

module.exports = router;
