const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const {
  appointmentValidator,
  appointmentUpdateValidator,
  appointmentIdValidator,
  patientIdParamValidator,
  doctorIdParamValidator,
} = require("../validators/appointmentValidator");
const validate = require("../middleware/validatorMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");

// Stats route (must be before :id routes)
router.get("/stats", protect, authorize("admin", "doctor"), appointmentController.getAppointmentStats);

// Patient appointments (must be before :id routes)
router.get("/patient/:patientId", protect, patientIdParamValidator, validate, appointmentController.getPatientAppointments);

// Doctor appointments (must be before :id routes)
router.get("/doctor/:doctorId", protect, doctorIdParamValidator, validate, appointmentController.getDoctorAppointments);

// Base routes (protected)
router
  .route("/")
  .post(protect, appointmentValidator, validate, appointmentController.createAppointment)
  .get(protect, appointmentController.getAllAppointments);

// ID-specific routes
router
  .route("/:id")
  .get(protect, appointmentIdValidator, validate, appointmentController.getAppointmentById)
  .put(protect, appointmentIdValidator, appointmentUpdateValidator, validate, appointmentController.updateAppointment)
  .patch(protect, appointmentIdValidator, appointmentUpdateValidator, validate, appointmentController.updateAppointment)
  .delete(protect, authorize("admin", "doctor", "reception"), appointmentIdValidator, validate, appointmentController.deleteAppointment);

// Cancel route
router.put("/:id/cancel", protect, appointmentIdValidator, validate, appointmentController.cancelAppointment);

module.exports = router;
