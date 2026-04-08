const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { 
  getPatientRecords, 
  createRecord, 
  uploadReport 
} = require("../controllers/medicalRecordController");
const { upload } = require("../services/uploadService");

const router = express.Router();

router.use(protect);

router.get("/patient/:patientId", getPatientRecords);
router.post("/", authorize("doctor", "admin", "reception"), createRecord);
router.post("/upload-report", authorize("patient"), upload.single("report"), uploadReport);

module.exports = router;
