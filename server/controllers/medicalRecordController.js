const MedicalRecord = require("../models/MedicalRecord");
const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Get all medical records for a patient
// @route   GET /api/records/patient/:patientId
exports.getPatientRecords = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  // Find the exact patient document using either user's ObjectId or the Patient sub-document ObjectId
  let patient;
  if (patientId.length === 24) {
    patient = await Patient.findById(patientId);
    if (!patient) {
      // Maybe the ID provided is the user ID?
      patient = await Patient.findOne({ userId: patientId });
    }
  }

  if (!patient) {
     return res.status(200).json(new ApiResponse(200, [], "No records found (Patient not found)"));
  }

  const records = await MedicalRecord.find({ patientId: patient._id })
    .populate("doctorId", "fullName name")
    .sort("-date");

  res.status(200).json(new ApiResponse(200, records, "Records fetched successfully"));
});

// @desc    Create a new medical record (e.g. Prescription)
// @route   POST /api/records
exports.createRecord = asyncHandler(async (req, res) => {
  const { patientId, doctorId, type, title, description } = req.body;

  const record = await MedicalRecord.create({
    patientId,
    doctorId,
    type,
    title,
    description
  });

  res.status(201).json(new ApiResponse(201, record, "Record created successfully"));
});
