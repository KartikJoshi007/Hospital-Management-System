const Patient = require("../models/Patient");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Create patient
// @route   POST /api/patients
exports.createPatient = asyncHandler(async (req, res) => {
  const { userId, dateOfBirth, gender, bloodGroup, address, emergencyContact, allergies, medicalHistory, insurance } = req.body;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if patient already exists
  const existingPatient = await Patient.findOne({ userId });
  if (existingPatient) {
    throw new ApiError(400, "Patient profile already exists for this user");
  }

  const patient = await Patient.create({
    userId,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
    emergencyContact,
    allergies,
    medicalHistory,
    insuranceProvider: insurance?.provider,
    insuranceId: insurance?.id,
    insuranceExpiry: insurance?.expiry,
  });

  return res.status(201).json(
    new ApiResponse(201, patient, "Patient created successfully")
  );
});

// @desc    Get all patients
// @route   GET /api/patients
exports.getAllPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  let query = {};
  if (search) {
    const matchedUsers = await User.find(
      {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      },
      "_id"
    );

    query.userId = { $in: matchedUsers.map((user) => user._id) };
  }

  const skip = (page - 1) * limit;

  const patients = await Patient.find(query)
    .populate("userId", "fullName email phone")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Patient.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        patients,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
      "Patients fetched successfully"
    )
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

// @desc    Get patient by user ID
// @route   GET /api/patients/user/:userId
exports.getPatientByUserId = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.params.userId }).populate("userId", "fullName email phone");

  if (!patient) {
    throw new ApiError(404, "Patient profile not found for this user");
  }

  return res.status(200).json(
    new ApiResponse(200, patient, "Patient fetched successfully")
  );
});

// @desc    Update patient
// @route   PUT /api/patients/:id
exports.updatePatient = asyncHandler(async (req, res) => {
  const { address, emergencyContact, allergies, medicalHistory, height, weight, notes, insurance } = req.body;

  let patient = await Patient.findById(req.params.id);

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Update fields
  if (address) patient.address = { ...patient.address, ...address };
  if (emergencyContact) patient.emergencyContact = { ...patient.emergencyContact, ...emergencyContact };
  if (allergies) patient.allergies = allergies;
  if (medicalHistory) patient.medicalHistory = medicalHistory;
  if (height) patient.height = height;
  if (weight) patient.weight = weight;
  if (notes) patient.notes = notes;
  if (insurance) {
    patient.insuranceProvider = insurance.provider || patient.insuranceProvider;
    patient.insuranceId = insurance.id || patient.insuranceId;
    patient.insuranceExpiry = insurance.expiry || patient.insuranceExpiry;
  }

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
  const totalPatients = await Patient.countDocuments();
  const malePatients = await Patient.countDocuments({ gender: "male" });
  const femalePatients = await Patient.countDocuments({ gender: "female" });
  const otherPatients = await Patient.countDocuments({ gender: "other" });

  const bloodGroupStats = await Patient.aggregate([
    {
      $group: {
        _id: "$bloodGroup",
        count: { $sum: 1 },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPatients,
        genderBreakdown: {
          male: malePatients,
          female: femalePatients,
          other: otherPatients,
        },
        bloodGroupBreakdown: bloodGroupStats,
      },
      "Patient statistics fetched successfully"
    )
  );
});

// @desc    Search patients
// @route   GET /api/patients/search/:query
exports.searchPatients = asyncHandler(async (req, res) => {
  const { query } = req.params;

  const matchedUsers = await User.find(
    {
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
      ],
    },
    "_id"
  );

  const patients = await Patient.find({
    userId: { $in: matchedUsers.map((user) => user._id) },
  }).populate("userId", "fullName email phone");

  return res.status(200).json(
    new ApiResponse(200, patients, "Search results fetched successfully")
  );
});
