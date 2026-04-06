const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Billing = require("../models/Billing");
const Expense = require("../models/Expense");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const totalPatients = await Patient.countDocuments();
  const totalDoctors = await Doctor.countDocuments();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointmentsToday = await Appointment.countDocuments({
    date: { $gte: today, $lt: tomorrow },
  });

  const totalRevenueData = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = totalRevenueData[0]?.total || 0;

  const recentPatients = await Patient.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name gender age status department");

  const onDutyDoctors = await Doctor.find({ isOnDuty: true })
    .limit(5)
    .select("name specialization shift rating");

  // Expense breakdown by category (Pie Chart)
  const revenueByDept = await Expense.aggregate([
    { $group: { _id: "$category", value: { $sum: "$amount" } } },
    { $project: { name: "$_id", value: 1, _id: 0 } }
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPatients,
        totalDoctors,
        appointmentsToday,
        totalRevenue,
        recentPatients,
        onDutyDoctors,
        revenueByDept,
      },
      "Dashboard statistics fetched successfully"
    )
  );
});

// @desc    Get appointment chart data grouped by period
// @route   GET /api/dashboard/appointments-chart?period=week
exports.getAppointmentChartData = asyncHandler(async (req, res) => {
  const { period = "week" } = req.query;
  const now = new Date();
  const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const DAYS   = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let start, raw, data;

  if (period === "day") {
    start = new Date(now); start.setHours(0, 0, 0, 0);
    raw = await Appointment.aggregate([
      { $match: { date: { $gte: start, $lte: now } } },
      { $group: { _id: { hour: { $hour: "$date" } }, appointments: { $sum: 1 } } },
      { $sort: { "_id.hour": 1 } },
    ]);
    data = raw.map(r => ({ label: `${r._id.hour}:00`, appointments: r.appointments }));

  } else if (period === "week") {
    start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0, 0, 0, 0);
    raw = await Appointment.aggregate([
      { $match: { date: { $gte: start, $lte: now } } },
      { $group: { _id: { dow: { $dayOfWeek: "$date" }, dom: { $dayOfMonth: "$date" }, month: { $month: "$date" } }, appointments: { $sum: 1 } } },
      { $sort: { "_id.month": 1, "_id.dom": 1 } },
    ]);
    data = raw.map(r => ({ label: DAYS[r._id.dow] || `Day ${r._id.dom}`, appointments: r.appointments }));

  } else if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    raw = await Appointment.aggregate([
      { $match: { date: { $gte: start, $lte: now } } },
      { $group: { _id: { week: { $week: "$date" } }, appointments: { $sum: 1 } } },
      { $sort: { "_id.week": 1 } },
    ]);
    data = raw.map((r, i) => ({ label: `W${i + 1}`, appointments: r.appointments }));

  } else {
    start = new Date(now.getFullYear(), 0, 1);
    raw = await Appointment.aggregate([
      { $match: { date: { $gte: start, $lte: now } } },
      { $group: { _id: { month: { $month: "$date" } }, appointments: { $sum: 1 } } },
      { $sort: { "_id.month": 1 } },
    ]);
    data = raw.map(r => ({ label: MONTHS[r._id.month], appointments: r.appointments }));
  }

  return res.status(200).json(
    new ApiResponse(200, data, "Appointment chart data fetched successfully")
  );
});

// @desc    Global search for patients and doctors
// @route   GET /api/dashboard/search
exports.globalSearch = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(200).json(new ApiResponse(200, { patients: [], doctors: [] }, "Empty query"));
  }

  const regex = new RegExp(query, "i");

  const patients = await Patient.find({
    $or: [{ name: regex }, { contact: regex }, { email: regex }]
  }).limit(5).select("name status _id");

  const doctors = await Doctor.find({
    $or: [{ name: regex }, { specialization: regex }]
  }).limit(5).select("name specialization isOnDuty _id");

  return res.status(200).json(
    new ApiResponse(200, { patients, doctors }, "Global search results")
  );
});
