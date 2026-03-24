const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { doctorValidator } = require("../validators/doctorValidator");
const validate = require("../middleware/validatorMiddleware");

// Base route
router
  .route("/")
  .post(doctorValidator, validate, doctorController.createDoctor)
  .get(doctorController.getAllDoctors);

router.get("/stats", doctorController.getDoctorStats);

// ID routes
router
  .route("/:id")
  .get(doctorController.getDoctorById)
  .put(doctorValidator, validate, doctorController.updateDoctor)
  .delete(doctorController.deleteDoctor);

module.exports = router;
