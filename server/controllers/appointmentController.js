const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const logService = require("../services/logService");
const notificationService = require("../services/notificationService");

// @desc    Create appointment
// @route   POST /api/appointments
exports.createAppointment = asyncHandler(async (req, res) => {
  const { patient, doctor, dept, date, time, reason, status, patientId, doctorId, type, priority } = req.body;

  const appointment = await Appointment.create({
    patient,
    doctor,
    dept,
    date,
    time,
    reason,
    status: status || "Pending",
    patientId: patientId || null,
    doctorId: doctorId || null,
    type: type || "Consultation",
    priority: priority || "Normal",
  });

  // --- Audit Log ---
  if (req.user) {
    await logService.createLog({
      action: "BOOK_APPOINTMENT",
      performedBy: req.user._id,
      appointmentId: appointment._id,
      details: `Appointment booked for ${patient} with Dr. ${doctor} on ${date}`,
      ipAddress: req.ip,
    });
  }

  // --- Notifications based on who booked ---
  if (req.user) {
    const bookerRole = req.user.role;
    const apptRef = { id: appointment._id, model: "Appointment" };
    const formattedDate = date ? new Date(date).toLocaleDateString() : "TBD";
    const msg = `New appointment: ${patient} with Dr. ${doctor} on ${formattedDate}`;

    if (bookerRole === "patient") {
      // Patient books → notify reception, doctor, admin
      await notificationService.notifyRoles(["reception", "admin"], msg, "booking", apptRef);
      if (doctorId) {
        const Doctor = require("../models/Doctor");
        const doc = await Doctor.findById(doctorId).populate("userId");
        if (doc && doc.userId) {
          await notificationService.notifyUser(doc.userId._id || doc.userId, "doctor", msg, "booking", apptRef);
        }
      }
    } else if (bookerRole === "reception") {
      // Reception books → notify doctor, admin
      await notificationService.notifyRoles(["admin"], msg, "booking", apptRef);
      if (doctorId) {
        const Doctor = require("../models/Doctor");
        const doc = await Doctor.findById(doctorId).populate("userId");
        if (doc && doc.userId) {
          await notificationService.notifyUser(doc.userId._id || doc.userId, "doctor", msg, "booking", apptRef);
        }
      }
    }
  }

  return res.status(201).json(
    new ApiResponse(201, appointment, "Appointment scheduled successfully")
  );
});

// @desc    Get all appointments
// @route   GET /api/appointments
exports.getAllAppointments = asyncHandler(async (req, res) => {
  const { search, status, date, page = 1, limit = 50 } = req.query;

  let query = {};
  if (search) {
    query.$or = [
      { patient: { $regex: search, $options: "i" } },
      { doctor:  { $regex: search, $options: "i" } },
    ];
  }

  if (status) query.status = status;

  // ✅ FIX: Proper date range comparison (string → Date)
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Appointment.countDocuments(query);

  const appointments = await Appointment.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      appointments,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    }, "Appointments fetched successfully")
  );
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  return res.status(200).json(
    new ApiResponse(200, appointment, "Appointment fetched successfully")
  );
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
exports.updateAppointment = asyncHandler(async (req, res) => {
  const { patient, doctor, dept, date, time, status, reason, type, priority } = req.body;

  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (patient)   appointment.patient  = patient;
  if (doctor)    appointment.doctor   = doctor;
  if (dept)      appointment.dept     = dept;
  if (date)      appointment.date     = date;
  if (time)      appointment.time     = time;
  if (status)    appointment.status   = status;
  if (reason)    appointment.reason   = reason;
  if (type)      appointment.type     = type;
  if (priority)  appointment.priority = priority;

  appointment = await appointment.save();

  return res.status(200).json(
    new ApiResponse(200, appointment, "Appointment updated successfully")
  );
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
exports.deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Appointment deleted successfully")
  );
});

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
exports.getAppointmentStats = asyncHandler(async (req, res) => {
  const total = await Appointment.countDocuments();
  const statusCounts = await Appointment.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  return res.status(200).json(
    new ApiResponse(200, { total, statusCounts }, "Appointment stats fetched successfully")
  );
});

// @desc    Get patient appointments
// @route   GET /api/appointments/patient/:patientId
exports.getPatientAppointments = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId);
  if (!patient) throw new ApiError(404, "Patient not found");

  // ✅ FIX: Search by both patientId (ObjectId) and name string for compatibility
  const appointments = await Appointment.find({
    $or: [
      { patientId: patient._id },
      { patient: patient.name },
    ],
  }).sort({ date: -1 });

  return res.status(200).json(
    new ApiResponse(200, appointments, "Patient appointments fetched successfully")
  );
});

// @desc    Get doctor appointments
// @route   GET /api/appointments/doctor/:doctorId
exports.getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  // ✅ FIX: Search by both doctorId (ObjectId) and name string for compatibility
  const appointments = await Appointment.find({
    $or: [
      { doctorId: doctor._id },
      { doctor: doctor.name },
    ],
  }).sort({ date: -1 });

  return res.status(200).json(
    new ApiResponse(200, appointments, "Doctor appointments fetched successfully")
  );
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
exports.cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: "Cancelled" },
    { new: true }
  );
  if (!appointment) throw new ApiError(404, "Appointment not found");

  // --- Audit Log ---
  if (req.user) {
    await logService.createLog({
      action: "CANCEL_APPOINTMENT",
      performedBy: req.user._id,
      appointmentId: appointment._id,
      details: `Appointment cancelled: ${appointment.patient} with Dr. ${appointment.doctor}`,
      ipAddress: req.ip,
    });
  }

  // --- Notifications ---
  if (req.user) {
    const cancellerRole = req.user.role;
    const apptRef = { id: appointment._id, model: "Appointment" };
    const msg = `Appointment cancelled: ${appointment.patient} with Dr. ${appointment.doctor}`;

    if (cancellerRole === "doctor") {
      // Doctor cancels → notify patient and reception
      await notificationService.notifyRoles(["reception"], msg, "cancellation", apptRef);
      if (appointment.patientId) {
        const Patient = require("../models/Patient");
        const pat = await Patient.findById(appointment.patientId);
        if (pat && pat.userId) {
          await notificationService.notifyUser(pat.userId, "patient", msg, "cancellation", apptRef);
        }
      }
    } else {
      // Anyone else cancels → notify reception and admin
      await notificationService.notifyRoles(["reception", "admin"], msg, "cancellation", apptRef);
    }
  }

  return res.status(200).json(
    new ApiResponse(200, appointment, "Appointment cancelled successfully")
  );
});
