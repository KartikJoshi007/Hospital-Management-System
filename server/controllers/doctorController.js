const Doctor = require("../models/Doctor");
const User = require("../models/User"); // ✅ Added
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Create doctor
// @route   POST /api/doctors
exports.createDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    specialization,
    category,
    experience,
    availability,
    contact,
    email,
    status,
    roleLevel,
    shift,
    isOnDuty,
    rating,
    patients,
  } = req.body;

  // Check if doctor already exists
  const existingDoctor = await Doctor.findOne({ email });
  if (existingDoctor) {
    throw new ApiError(400, "Doctor with this email already exists");
  }

  const doctor = await Doctor.create({
    name,
    specialization,
    category: category || "general",
    experience,
    availability,
    contact,
    email,
    status: status || "Active",
    roleLevel: roleLevel || "other",
    shift: shift || "Morning",
    isOnDuty: isOnDuty || false,
    rating: rating || 0,
    patients: patients || 0,
  });

  return res.status(201).json(
    new ApiResponse(201, doctor, "Doctor created successfully")
  );
});

// @desc    Get all doctors
// @route   GET /api/doctors
exports.getAllDoctors = asyncHandler(async (req, res) => {
  const { search, category, status, roleLevel, shift, isOnDuty } = req.query;

  let query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
    ];
  }

  if (category) query.category = category;
  if (status) query.status = status;
  if (roleLevel) query.roleLevel = roleLevel;
  if (shift) query.shift = shift;
  if (isOnDuty !== undefined) query.isOnDuty = isOnDuty === "true";

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
  const {
    name,
    specialization,
    category,
    experience,
    availability,
    contact,
    email,
    status,
    roleLevel,
    shift,
    isOnDuty,
    rating,
    patients,
  } = req.body;

  let doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Update fields
  if (name) doctor.name = name;
  if (specialization) doctor.specialization = specialization;
  if (category) doctor.category = category;
  if (experience) doctor.experience = experience;
  if (availability) doctor.availability = availability;
  if (contact) doctor.contact = contact;
  if (email) doctor.email = email;
  if (status) doctor.status = status;
  if (roleLevel) doctor.roleLevel = roleLevel;
  if (shift) doctor.shift = shift;
  if (isOnDuty !== undefined) doctor.isOnDuty = isOnDuty;
  if (rating !== undefined) doctor.rating = rating;
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
// @desc    Update doctor roleLevel only
// @route   PATCH /api/doctors/:id/role-level
exports.updateRoleLevel = asyncHandler(async (req, res) => {
  const { roleLevel } = req.body

  const validLevels = ['senior doctor', 'junior doctor', 'resident doctor', 'consultant', 'intern', 'other']
  if (!roleLevel || !validLevels.includes(roleLevel)) {
    throw new ApiError(400, 'Invalid role level')
  }

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { roleLevel },
    { new: true, runValidators: false }
  )

  if (!doctor) throw new ApiError(404, 'Doctor not found')

  return res.status(200).json(
    new ApiResponse(200, doctor, 'Doctor role level updated successfully')
  )
})

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
