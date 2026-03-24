const Doctor = require("../models/Doctor");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Create new doctor
// @route   POST /api/doctors
exports.createDoctor = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const existingDoctor = await Doctor.findOne({ email });
  if (existingDoctor) {
    throw new ApiError(400, "Doctor with this email already exists");
  }

  const doctor = await Doctor.create(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, doctor, "Doctor created successfully"));
});

// @desc    Get all doctors
// @route   GET /api/doctors
exports.getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find();
  
  return res
    .status(200)
    .json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id
exports.getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Doctor fetched successfully"));
});

// @desc    Update doctor
// @route   PUT /api/doctors/:id
exports.updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Doctor updated successfully"));
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
exports.deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Doctor deleted successfully"));
});

// @desc    Get doctor statistics
// @route   GET /api/doctors/stats
exports.getDoctorStats = asyncHandler(async (req, res) => {
  const stats = await Doctor.aggregate([
    {
      $group: {
        _id: "$specialization",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Doctor statistics fetched successfully"));
});
