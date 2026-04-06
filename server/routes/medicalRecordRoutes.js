const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getPatientRecords, createRecord } = require("../controllers/medicalRecordController");

const router = express.Router();

router.use(protect);

router.get("/patient/:patientId", getPatientRecords);
router.post("/", authorize("Doctor", "Admin", "Receptionist"), createRecord);

module.exports = router;
