const Doctor = require("../models/Doctor");
const User = require("../models/User"); // ✅ Added
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
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
    password,
    consultationFees,
  } = req.body;

  // 1. Check if user already exists
  let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });

  if (!user) {
    // 2. Create User account if not exists
    user = await User.create({
      fullName: name,
      email: email.toLowerCase(),
      phone: contact,
      password: password || "Doctor@123",
      role: "doctor",
    });
  } else {
    // 2.5 Ensure existing user has doctor role
    if (user.role !== "doctor") {
      user.role = "doctor";
      await user.save();
    }
  }

  // 3. Create Doctor profile linked to User
  const doctor = await Doctor.create({
    userId: user._id, // Link to User
    name,
    specialization,
    category: category || "general",
    experience,
    availability,
    contact,
    email: email.toLowerCase(),
    status: status || "Active",
    roleLevel: roleLevel || "other",
    shift: shift || "Morning",
    isOnDuty: isOnDuty || false,
    rating: rating || 0,
    patients: patients || 0,
    consultationFees: consultationFees || 500,
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
      { name:           { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
      { hospitalId:     { $regex: search, $options: "i" } },
    ];
  }

  if (category) query.category = category;
  if (status) query.status = status;
  if (roleLevel) query.roleLevel = roleLevel;
  if (shift) query.shift = shift;
  if (isOnDuty !== undefined) query.isOnDuty = isOnDuty === "true";

  // ✅ Auto-Off Check for all doctors
  const doctors = await Doctor.find(query).sort({ createdAt: -1 });

  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (let doc of doctors) {
    if (Array.isArray(doc.availability) && doc.availability.length > 0) {
      const inShift = doc.availability.some(slot => {
        if (slot.day !== currentDay) return false;
        const [sh, sm] = slot.startTime.split(':').map(Number);
        const [eh, em] = slot.endTime.split(':').map(Number);
        return currentTime >= (sh * 60 + sm) && currentTime <= (eh * 60 + em);
      });

      if (!inShift && doc.isOnDuty) {
        doc.isOnDuty = false;
        doc.status = "Inactive";
        await doc.save({ validateBeforeSave: false }); // 🛡️ Bypass validation for legacy records
      }
    }
  }

  return res.status(200).json(
    new ApiResponse(200, doctors, "Doctors fetched successfully")
  );
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
exports.getDoctorById = asyncHandler(async (req, res) => {
  let doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // ✅ Auto-Off Check
  if (Array.isArray(doctor.availability) && doctor.availability.length > 0) {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const inShift = doctor.availability.some(slot => {
      if (slot.day !== currentDay) return false;
      const [sh, sm] = slot.startTime.split(':').map(Number);
      const [eh, em] = slot.endTime.split(':').map(Number);
      return currentTime >= (sh * 60 + sm) && currentTime <= (eh * 60 + em);
    });

    if (!inShift && doctor.isOnDuty) {
      doctor.isOnDuty = false;
      doctor.status = "Inactive";
      await doctor.save({ validateBeforeSave: false });
    }
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
    password,
    consultationFees,
  } = req.body;

  let doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Update fields
  if (name !== undefined) doctor.name = name;
  if (specialization !== undefined) doctor.specialization = specialization;
  if (category !== undefined) doctor.category = category;
  if (experience !== undefined) doctor.experience = experience;
  if (availability !== undefined) doctor.availability = availability;
  if (contact !== undefined) doctor.contact = contact;
  if (email !== undefined) doctor.email = email;
  if (status !== undefined) doctor.status = status;
  if (roleLevel !== undefined) doctor.roleLevel = roleLevel;
  if (shift !== undefined) doctor.shift = shift;
  if (isOnDuty !== undefined) doctor.isOnDuty = isOnDuty;
  if (rating !== undefined) doctor.rating = rating;
  if (patients !== undefined) doctor.patients = patients;
  if (consultationFees !== undefined) doctor.consultationFees = consultationFees;

  doctor = await doctor.save();

  // ✅ Synchronize linked User account
  const user = await User.findById(doctor.userId);
  if (user) {
    if (name) user.fullName = name;
    if (contact) user.phone = contact;
    if (email) user.email = email.toLowerCase();
    if (password) user.password = password; // Triggers hashing in pre-save hook

    user.role = "doctor"; // 🛡️ Ensure role consistency
    await user.save();
  }

  return res.status(200).json(
    new ApiResponse(200, doctor, "Doctor updated successfully")
  );
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
exports.deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (doctor.userId) {
    await User.findByIdAndDelete(doctor.userId);
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Doctor and associated user account deleted successfully")
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

// @desc    Get total unique patients for a doctor
// @route   GET /api/doctors/:id/patient-count
exports.getDoctorPatientCount = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  const appointments = await Appointment.find({
    $or: [{ doctorId: doctor._id }, { doctor: doctor.name }],
    status: { $ne: "Cancelled" },
  }).select("patientId patient");

  const uniquePatients = new Set();
  appointments.forEach((a) => {
    if (a.patientId) uniquePatients.add(a.patientId.toString());
    else if (a.patient) uniquePatients.add(a.patient);
  });

  return res.status(200).json(
    new ApiResponse(200, { count: uniquePatients.size }, "Patient count fetched successfully")
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
  } else if (!doctor.hospitalId) {
    // 🏥 Backfill: existing record missing hospitalId — trigger pre-save hook
    await doctor.save();
  }

  return res.status(200).json(
    new ApiResponse(200, doctor, "Doctor profile fetched successfully")
  );
});


// @desc    Get patients assigned to a specific doctor (via appointments)
// @route   GET /api/doctors/:id/patients
exports.getMyPatients = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  // 1. Find all patients who have booked an appointment with this doctor
  const appointmentData = await Appointment.find({ doctorId: doctor._id })
    .select("patientId")
    .lean();

  const patientIds = [...new Set(appointmentData.map(a => a.patientId?.toString()).filter(Boolean))];

  if (patientIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No patients found for this doctor"));
  }

  // 2. Fetch full patient details
  const patients = await Patient.find({ _id: { $in: patientIds } });

  return res.status(200).json(
    new ApiResponse(200, patients, "Doctor patients fetched successfully")
  );
});

// @desc    Toggle Doctor Duty Status
// @route   PATCH /api/doctors/:id/duty
exports.toggleDutyStatus = asyncHandler(async (req, res) => {
  const { isOnDuty } = req.body;

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  doctor.isOnDuty = isOnDuty;
  doctor.status = isOnDuty ? "Active" : "Inactive";

  await doctor.save();

  return res.status(200).json(
    new ApiResponse(200, doctor, `Doctor is now ${isOnDuty ? "On-Duty" : "Off-Duty"}`)
  );
});
