const ScheduleEvent = require("../models/ScheduleEvent");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Get all schedule events for a specific doctor
// @route   GET /api/schedule/doctor/:doctorId
exports.getDoctorSchedule = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const events = await ScheduleEvent.find({ doctorId }).sort({ date: 1, time: 1 });

  return res.status(200).json(
    new ApiResponse(200, events, "Schedule fetched successfully")
  );
});

// @desc    Create a new schedule event
// @route   POST /api/schedule
exports.createScheduleEvent = asyncHandler(async (req, res) => {
  const { doctorId, type, title, date, time, note } = req.body;

  if (!doctorId || !type || !title || !date || !time) {
    throw new ApiError(400, "Missing required fields");
  }

  const event = await ScheduleEvent.create({
    doctorId,
    type,
    title,
    date,
    time,
    note,
  });

  return res.status(201).json(
    new ApiResponse(201, event, "Event added to schedule")
  );
});

// @desc    Delete a schedule event
// @route   DELETE /api/schedule/:id
exports.deleteScheduleEvent = asyncHandler(async (req, res) => {
  const event = await ScheduleEvent.findByIdAndDelete(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Event removed from schedule")
  );
});
