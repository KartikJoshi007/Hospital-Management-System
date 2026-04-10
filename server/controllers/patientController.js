const Patient = require("../models/Patient");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { body } = require("express-validator");
const notificationService = require("../services/notificationService");

// @desc    Create patient
// @route   POST /api/patients
exports.createPatient = asyncHandler(async (req, res) => {
  const { userId, name, email, password, dob, age, gender, contact, bloodGroup, status, address, medicalHistory, height, weight } = req.body;

  // Check if patient profile already exists for this name (simple check for mock-like data)
  const existingPatient = await Patient.findOne({ $or: [{ contact }, (email ? { email } : { _id: null })] });
  if (existingPatient) {
    throw new ApiError(400, "Patient record already exists for this person");
  }

  let finalUserId = userId;

  // 🛡️ Automatically create User account if email is provided and no userId exists
  if (!finalUserId && email) {
    const lowerEmail = email.toLowerCase();
    let user = await User.findOne({ email: lowerEmail });
    if (!user) {
      user = await User.create({
        fullName: name,
        email: lowerEmail,
        phone: contact,
        password: password || contact || "Patient@123", // Use provided password, fallback to contact
        role: "patient"
      });
    }
    finalUserId = user._id;
  }

  const patient = await Patient.create({
    userId: finalUserId || null,
    name,
    email,
    dob: dob || new Date(),
    age: dob ? Math.max(1, Math.floor((new Date() - new Date(dob)) / 31557600000)) : (Math.max(1, parseInt(age) || 1)),
    gender,
    contact,
    bloodGroup,
    status: status || "Active",
    address,
    medicalHistory: medicalHistory || "No known conditions",
    vitals: {
      height: height || 0,
      weight: weight || 0,
    }
  });

  // 🔔 Notify Admins about new patient record (added by staff)
  await notificationService.notifyRoles(
    ["admin"],
    `New Patient Added by ${req.user.fullName}: ${patient.name}`,
    "system",
    { id: patient._id, model: "Patient" }
  );

  return res.status(201).json(
    new ApiResponse(201, patient, "Patient record created successfully")
  );
});

// @desc    Get all patients (paginated)
// @route   GET /api/patients
exports.getAllPatients = asyncHandler(async (req, res) => {
  const { search, gender, status, department, page = 1, limit = 50 } = req.query;

  let query = {};
  if (search) {
    query.$or = [
      { name:    { $regex: search, $options: "i" } },
      { contact: { $regex: search, $options: "i" } },
    ];
  }

  if (gender) {
    query.gender = { $regex: `^${gender}$`, $options: "i" };
  }
  if (status)     query.status     = status;
  if (department) query.department = department;

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Patient.countDocuments(query);

  const patients = await Patient.find(query)
    .populate("userId", "email fullName phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // ✅ FIX: Return {patients, pagination} shape — matches what adminApi.js expects
  return res.status(200).json(
    new ApiResponse(200, {
      patients,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    }, "Patients fetched successfully")
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
        vitals: {
          height: 0,
          weight: 0,
        }
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
  const { name, email, dob, age, gender, contact, bloodGroup, status, address, medicalHistory, height, weight, password } = req.body;

  let patient = await Patient.findById(req.params.id);

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Update fields
  if (name !== undefined) patient.name = name;
  if (email !== undefined) patient.email = email;
  if (dob) {
    patient.dob = dob;
    patient.age = Math.max(1, Math.floor((new Date() - new Date(dob)) / 31557600000));
  } else if (age !== undefined) {
    patient.age = Math.max(1, parseInt(age) || 1);
  }
  if (gender !== undefined) patient.gender = gender;
  if (contact !== undefined) patient.contact = contact;
  if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
  if (status !== undefined) patient.status = status;
  if (address !== undefined) patient.address = address;
  if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;
  if (height !== undefined || weight !== undefined) {
    if (!patient.vitals) patient.vitals = {};
    if (height !== undefined) patient.vitals.height = height;
    if (weight !== undefined) patient.vitals.weight = weight;

    // Explicitly tell Mongoose that the nested vitals object has changed
    patient.markModified('vitals');
  }

  patient = await patient.save();
  
  // ✅ Synchronize linked User account
  const user = await User.findById(patient.userId);
  if (user) {
    if (name) user.fullName = name;
    if (contact) user.phone = contact;
    if (email) user.email = email.toLowerCase();
    if (password) user.password = password; // Triggers hashing in pre-save hook
    
    await user.save();
  }

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
