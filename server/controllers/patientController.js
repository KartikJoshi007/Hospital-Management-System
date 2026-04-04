const Patient = require("../models/Patient");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { body } = require("express-validator");

// @desc    Create patient
// @route   POST /api/patients
exports.createPatient = asyncHandler(async (req, res) => {
  const { userId, name, age, gender, contact, bloodGroup, status, address, medicalHistory, height, weight } = req.body;

  // Check if patient profile already exists for this name (simple check for mock-like data)
  const existingPatient = await Patient.findOne({ name, contact });
  if (existingPatient) {
    throw new ApiError(400, "Patient record already exists for this person");
  }

  const patient = await Patient.create({
    userId: userId || null,
    name,
    age,
    gender,
    contact,
    bloodGroup,
    status: status || "Active",
    address,
    medicalHistory: medicalHistory || "No known conditions",
    height: height || 0,
    weight: weight || 0,
  });

  return res.status(201).json(
    new ApiResponse(201, patient, "Patient record created successfully")
  );
});

// @desc    Get all patients
// @route   GET /api/patients
exports.getAllPatients = asyncHandler(async (req, res) => {
  const { search, gender, status } = req.query;

  let query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { contact: { $regex: search, $options: "i" } },
    ];
  }

  if (gender) query.gender = gender;
  if (status) query.status = status;

  const patients = await Patient.find(query).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, patients, "Patients fetched successfully")
  );
});

// @desc    Get patient by ID
// @route   GET /api/patients/:id
exports.getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate("userId", "fullName email phone");

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return res.status(200).json(
    new ApiResponse(200, patient, "Patient fetched successfully")
  );
});

// @desc    Get patient by user ID (with Lazy Creation)
// @route   GET /api/patients/user/:userId
exports.getPatientByUserId = asyncHandler(async (req, res) => {
  let patient = await Patient.findOne({ userId: req.params.userId }).populate("userId", "fullName email phone");

  // ✅ Lazy Creation: If no profile found, create a default one for the user
  if (!patient) {
    const user = await User.findById(req.params.userId);

    if (user && user.role === "patient") {
      patient = await Patient.create({
        userId: user._id,
        name: user.fullName || "New Patient",
        age: 0,
        gender: "Other",
        contact: user.phone || "Not Provided",
        bloodGroup: "O+",
        address: "Not Provided",
        status: "Active",
        height: 0,
        weight: 0,
      });

      // Populate after creation
      patient = await Patient.findById(patient._id).populate("userId", "fullName email phone");
    } else {
      throw new ApiError(404, "Patient profile not found for this user");
    }
  }

  return res.status(200).json(
    new ApiResponse(200, patient, "Patient profile fetched successfully")
  );
});

// @desc    Update patient
// @route   PUT /api/patients/:id
exports.updatePatient = asyncHandler(async (req, res) => {
  const { name, age, gender, contact, bloodGroup, status, address, medicalHistory, height, weight } = req.body;

  let patient = await Patient.findById(req.params.id);

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Update fields
  if (name) patient.name = name;
  if (age) patient.age = age;
  if (gender) patient.gender = gender;
  if (contact) patient.contact = contact;
  if (bloodGroup) patient.bloodGroup = bloodGroup;
  if (status) patient.status = status;
  if (address) patient.address = address;
  if (medicalHistory) patient.medicalHistory = medicalHistory;
  if (height !== undefined) patient.height = height;
  if (weight !== undefined) patient.weight = weight;

  patient = await patient.save();

  return res.status(200).json(
    new ApiResponse(200, patient, "Patient updated successfully")
  );
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
exports.deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Patient deleted successfully")
  );
});

// @desc    Get patient statistics
// @route   GET /api/patients/stats
exports.getPatientStats = asyncHandler(async (req, res) => {
  const total = await Patient.countDocuments();
  const statusCounts = await Patient.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  return res.status(200).json(
    new ApiResponse(200, { total, statusCounts }, "Patient stats fetched successfully")
  );
});

// @desc    Search patients
// @route   GET /api/patients/search/:query
exports.searchPatients = asyncHandler(async (req, res) => {
  const { query } = req.params;
  const patients = await Patient.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { contact: { $regex: query, $options: "i" } }
    ]
  }).limit(10);

  return res.status(200).json(
    new ApiResponse(200, patients, "Patients searched successfully")
  );
});
