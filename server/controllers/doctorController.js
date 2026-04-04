const Doctor = require("../models/Doctor");
const User = require("../models/User"); // ✅ Added
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Create doctor
// @route   POST /api/doctors
exports.createDoctor = asyncHandler(async (req, res) => {
  const { name, specialization, experience, availability, contact, email, status, patients } = req.body;

  // Check if doctor already exists
  const existingDoctor = await Doctor.findOne({ email });
  if (existingDoctor) {
    throw new ApiError(400, "Doctor with this email already exists");
  }

  const doctor = await Doctor.create({
    name,
    specialization,
    experience,
    availability,
    contact,
    email,
    status: status || "Active",
    patients: patients || 0,
  });

  return res.status(201).json(
    new ApiResponse(201, doctor, "Doctor created successfully")
  );
});

// @desc    Get all doctors
// @route   GET /api/doctors
exports.getAllDoctors = asyncHandler(async (req, res) => {
  const { search } = req.query;

  let query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
    ];
  }

  const doctors = await Doctor.find(query).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, doctors, "Doctors fetched successfully")
  );
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
exports.getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  return res.status(200).json(
    new ApiResponse(200, doctor, "Doctor fetched successfully")
  );
});

// @desc    Update doctor
// @route   PUT /api/doctors/:id
exports.updateDoctor = asyncHandler(async (req, res) => {
  const { name, specialization, experience, availability, contact, email, status, patients } = req.body;

  let doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Update fields
  if (name) doctor.name = name;
  if (specialization) doctor.specialization = specialization;
  if (experience) doctor.experience = experience;
  if (availability) doctor.availability = availability;
  if (contact) doctor.contact = contact;
  if (email) doctor.email = email;
  if (status) doctor.status = status;
  if (patients !== undefined) doctor.patients = patients;

  doctor = await doctor.save();

  return res.status(200).json(
    new ApiResponse(200, doctor, "Doctor updated successfully")
  );
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
exports.deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Doctor deleted successfully")
  );
});
// @desc    Get doctor statistics
// @route   GET /api/doctors/stats
exports.getDoctorStats = asyncHandler(async (req, res) => {
  const totalDoctors = await Doctor.countDocuments();
  const activeDoctors = await Doctor.countDocuments({ status: "Active" });

  const specializationBreakdown = await Doctor.aggregate([
    { $group: { _id: "$specialization", count: { $sum: 1 } } }
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      total: totalDoctors,
      active: activeDoctors,
      specializations: specializationBreakdown
    }, "Doctor stats fetched successfully")
  );
});
// @desc    Get doctor by user ID (with Lazy Creation)
// @route   GET /api/doctors/user/:userId
exports.getDoctorByUserId = asyncHandler(async (req, res) => {
  let doctor = await Doctor.findOne({ userId: req.params.userId });

  // ✅ Lazy Creation
  if (!doctor) {
    const user = await User.findById(req.params.userId);

    if (user && user.role === "doctor") {
      doctor = await Doctor.create({
        userId: user._id,
        name: user.fullName || "New Physician",
        email: user.email,
        specialization: "General",
        experience: "0 Years",
        availability: "TBD",
        contact: user.phone || "Not Provided",
        status: "Active",
      });
    } else {
      throw new ApiError(404, "Doctor profile not found for this user");
    }
  }

  return res.status(200).json(
    new ApiResponse(200, doctor, "Doctor profile fetched successfully")
  );
});
