const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Billing = require("../models/Billing");
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
    appointmentDate: { $gte: today, $lt: tomorrow },
  });

  const totalRevenueData = await Billing.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = totalRevenueData[0]?.total || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPatients,
        totalDoctors,
        appointmentsToday,
        totalRevenue,
      },
      "Dashboard statistics fetched successfully"
    )
  );
});
