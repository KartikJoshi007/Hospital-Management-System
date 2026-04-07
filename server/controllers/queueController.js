const Queue = require("../models/Queue");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Get current queue
// @route   GET /api/queue
exports.getQueue = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const queryDate = date ? new Date(date) : new Date();
  queryDate.setHours(0, 0, 0, 0);

  const entries = await Queue.find({ date: queryDate }).sort({ token: 1 });

  return res.status(200).json(
    new ApiResponse(200, entries, "Queue fetched successfully")
  );
});

// @desc    Add to queue
// @route   POST /api/queue
exports.addToQueue = asyncHandler(async (req, res) => {
  const { name, patientId, doctorId, doctorName, department,status  } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get current max token for the day
  const latestEntry = await Queue.findOne({ date: today }).sort({ token: -1 });
  const nextToken = (latestEntry?.token || 0) + 1;

  const entry = await Queue.create({
    token: nextToken,
    name,
    patientId,
    doctorId,
    doctorName,
    department,
    status: status || "Waiting",
    date: today,
  });

  return res.status(201).json(
    new ApiResponse(201, entry, "Added to queue successfully")
  );
});

// @desc    Update queue status
// @route   PUT /api/queue/:id
exports.updateQueueStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["Waiting", "In Progress", "Done", "Skipped"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const update = { status };
  if (status === "In Progress") {
    update.calledAt = new Date();
  }

  const entry = await Queue.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true, runValidators: true }
  );

  if (!entry) {
    throw new ApiError(404, "Queue entry not found");
  }

  return res.status(200).json(
    new ApiResponse(200, entry, `Status updated to ${status}`)
  );
});

// @desc    Remove from queue
// @route   DELETE /api/queue/:id
exports.removeFromQueue = asyncHandler(async (req, res) => {
  const entry = await Queue.findByIdAndDelete(req.params.id);

  if (!entry) {
    throw new ApiError(404, "Queue entry not found");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Removed from queue")
  );
});
