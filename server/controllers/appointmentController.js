const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Create appointment
// @route   POST /api/appointments
exports.createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, appointmentDate, appointmentTime, reason, symptoms, duration, isFollowUp, followUpAppointmentId } = req.body;

  // Validate patient and doctor exist
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Check if appointment slot is available
  const existingAppointment = await Appointment.findOne({
    doctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: { $ne: "cancelled" },
  });

  if (existingAppointment) {
    throw new ApiError(400, "Appointment slot is already booked");
  }

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    appointmentDate,
    appointmentTime,
    reason,
    symptoms,
    duration: duration || 30,
    isFollowUp: isFollowUp || false,
    followUpAppointmentId: isFollowUp ? followUpAppointmentId : null,
    cost: doctor.fees || 0,
  });

  const populatedAppointment = await appointment.populate([
    { path: "patientId", populate: { path: "userId", select: "fullName email phone" } },
    { path: "doctorId", select: "name specialization qualification email contact" },
  ]);

  return res.status(201).json(
    new ApiResponse(201, populatedAppointment, "Appointment created successfully")
  );
});

// @desc    Get all appointments
// @route   GET /api/appointments
exports.getAllAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, doctorId, patientId, date } = req.query;

  let query = {};
  if (status) query.status = status;
  if (doctorId) query.doctorId = doctorId;
  if (patientId) query.patientId = patientId;
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    query.appointmentDate = { $gte: startDate, $lt: endDate };
  }

  const skip = (page - 1) * limit;

  const appointments = await Appointment.find(query)
    .populate([
      { path: "patientId", populate: { path: "userId", select: "fullName email phone" } },
      { path: "doctorId", select: "name specialization qualification email contact" },
    ])
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ appointmentDate: 1 });

  const total = await Appointment.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        appointments,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
      "Appointments fetched successfully"
    )
  );
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate([
    { path: "patientId", populate: { path: "userId", select: "fullName email phone" } },
    { path: "doctorId", select: "name specialization qualification email contact" },
  ]);

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
  const { appointmentDate, appointmentTime, status, reason, notes, symptoms } = req.body;

  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  // If changing date/time, check slot availability
  if (appointmentDate || appointmentTime) {
    const checkDate = appointmentDate || appointment.appointmentDate;
    const checkTime = appointmentTime || appointment.appointmentTime;

    const existingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id },
      doctorId: appointment.doctorId,
      appointmentDate: new Date(checkDate),
      appointmentTime: checkTime,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      throw new ApiError(400, "Appointment slot is already booked");
    }
  }

  // Update fields
  if (appointmentDate) appointment.appointmentDate = appointmentDate;
  if (appointmentTime) appointment.appointmentTime = appointmentTime;
  if (status) appointment.status = status;
  if (reason) appointment.reason = reason;
  if (notes) appointment.notes = notes;
  if (symptoms) appointment.symptoms = symptoms;

  appointment = await appointment.save();

  const populatedAppointment = await appointment.populate([
    { path: "patientId", populate: { path: "userId", select: "fullName email phone" } },
    { path: "doctorId", select: "name specialization qualification email contact" },
  ]);

  return res.status(200).json(
    new ApiResponse(200, populatedAppointment, "Appointment updated successfully")
  );
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
exports.cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: "cancelled" },
    { new: true }
  ).populate([
    { path: "patientId", populate: { path: "userId", select: "fullName email phone" } },
    { path: "doctorId", select: "name specialization qualification email contact" },
  ]);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  return res.status(200).json(
    new ApiResponse(200, appointment, "Appointment cancelled successfully")
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

// @desc    Get appointments for a specific patient
// @route   GET /api/appointments/patient/:patientId
exports.getPatientAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  let query = { patientId: req.params.patientId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const appointments = await Appointment.find(query)
    .populate([
      { path: "patientId", populate: { path: "userId", select: "fullName email phone" } },
      { path: "doctorId", select: "name specialization qualification email contact" },
    ])
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ appointmentDate: -1 });

  const total = await Appointment.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        appointments,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
      "Patient appointments fetched successfully"
    )
  );
});

// @desc    Get appointments for a specific doctor
// @route   GET /api/appointments/doctor/:doctorId
exports.getDoctorAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, date } = req.query;

  let query = { doctorId: req.params.doctorId };
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    query.appointmentDate = { $gte: startDate, $lt: endDate };
  }

  const skip = (page - 1) * limit;

  const appointments = await Appointment.find(query)
    .populate([
      { path: "patientId", populate: { path: "userId", select: "fullName email phone" } },
      { path: "doctorId", select: "name specialization qualification email contact" },
    ])
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ appointmentDate: 1 });

  const total = await Appointment.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        appointments,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
      "Doctor appointments fetched successfully"
    )
  );
});

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
exports.getAppointmentStats = asyncHandler(async (req, res) => {
  const totalAppointments = await Appointment.countDocuments();
  const scheduledAppointments = await Appointment.countDocuments({ status: "scheduled" });
  const completedAppointments = await Appointment.countDocuments({ status: "completed" });
  const cancelledAppointments = await Appointment.countDocuments({ status: "cancelled" });
  const noShowAppointments = await Appointment.countDocuments({ status: "no-show" });

  const appointmentsByDoctor = await Appointment.aggregate([
    {
      $group: {
        _id: "$doctorId",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "_id",
        as: "doctor",
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalAppointments,
        byStatus: {
          scheduled: scheduledAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          noShow: noShowAppointments,
        },
        byDoctor: appointmentsByDoctor,
      },
      "Appointment statistics fetched successfully"
    )
  );
});
