const Billing = require("../models/Billing");
const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const normalizeBill = (billDoc) => {
  const bill = billDoc.toObject ? billDoc.toObject() : billDoc;
  const patientFullName = bill?.patientId?.userId?.fullName;

  return {
    ...bill,
    status: bill.paymentStatus,
    patientName: bill.patientName || patientFullName || null,
  };
};

// @desc    Create new bill
// @route   POST /api/bills
exports.createBill = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    paymentStatus: req.body.paymentStatus || req.body.status,
  };

  const bill = await Billing.create(payload);

  return res
    .status(201)
    .json(new ApiResponse(201, normalizeBill(bill), "Bill created successfully"));
});

// @desc    Get all bills
// @route   GET /api/bills
exports.getAllBills = asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 50 } = req.query;

  let query = {};
  if (status) query.paymentStatus = status;
  if (type) query.type = type;

  const skip = (page - 1) * limit;

  const bills = await Billing.find(query)
    .populate({ path: "patientId", populate: { path: "userId", select: "fullName" } })
    .populate("doctorId", "name specialization")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Billing.countDocuments(query);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          bills: bills.map(normalizeBill),
          pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit),
          },
        },
        "Bills fetched successfully"
      )
    );
});

// @desc    Get single bill
// @route   GET /api/bills/:id
exports.getBillById = asyncHandler(async (req, res) => {
  const bill = await Billing.findById(req.params.id)
    .populate({ path: "patientId", populate: { path: "userId", select: "fullName" } })
    .populate("doctorId", "name specialization");

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, normalizeBill(bill), "Bill fetched successfully"));
});

// @desc    Get bills by patient ID
// @route   GET /api/bills/patient/:patientId
exports.getBillsByPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId);
  
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Security check: patients can only see their own bills
  const isPatient = req.user.role === "patient" || req.user.role === "Patient";
  if (isPatient && patient.userId?.toString() !== req.user.id) {
    throw new ApiError(403, "Access denied: You can only view your own bills");
  }

  const bills = await Billing.find({ patientId: req.params.patientId })
    .populate("doctorId", "name specialization")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bills.map(normalizeBill), "Patient bills fetched successfully"));
});

// @desc    Get revenue report (grouped by paymentStatus)
// @route   GET /api/bills/revenue
exports.getRevenueReport = asyncHandler(async (req, res) => {
  const report = await Billing.aggregate([
    {
      $group: {
        _id: "$paymentStatus",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, report, "Revenue report fetched successfully"));
});

// @desc    Get monthly revenue stats for charts
// @route   GET /api/bills/stats
exports.getBillingStats = asyncHandler(async (req, res) => {
  // Monthly revenue for the last 12 months
  const monthlyRevenue = await Billing.aggregate([
    {
      $match: {
        paymentStatus: "Paid",
        date: {
          $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Revenue by type (OPD, IPD, Lab, Pharmacy)
  const revenueByType = await Billing.aggregate([
    { $match: { paymentStatus: "Paid" } },
    {
      $group: {
        _id: "$type",
        value: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Summary totals
  const totalPaid = await Billing.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalPending = await Billing.aggregate([
    { $match: { paymentStatus: "Pending" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalBills = await Billing.countDocuments();

  // Month names mapping
  const monthNames = [
    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const formattedMonthly = monthlyRevenue.map((m) => ({
    month: monthNames[m._id.month],
    year: m._id.year,
    revenue: m.revenue,
    count: m.count,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        monthlyRevenue: formattedMonthly,
        revenueByType,
        summary: {
          totalRevenue: totalPaid[0]?.total || 0,
          totalPending: totalPending[0]?.total || 0,
          totalBills,
        },
      },
      "Billing statistics fetched successfully"
    )
  );
});

// @desc    Mark bill as paid
// @route   PUT /api/bills/:id/mark-paid
exports.markBillPaid = asyncHandler(async (req, res) => {
  const bill = await Billing.findByIdAndUpdate(
    req.params.id,
    {
      paymentStatus: "Paid",
      paymentDate: new Date(),
      paymentMethod: req.body.paymentMethod || "cash",
    },
    { new: true }
  ).populate({ path: "patientId", populate: { path: "userId", select: "fullName" } });

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, normalizeBill(bill), "Bill marked as paid successfully"));
});

// @desc    Update bill
// @route   PUT /api/bills/:id
exports.updateBill = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    paymentStatus: req.body.paymentStatus || req.body.status,
  };

  const bill = await Billing.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, normalizeBill(bill), "Bill updated successfully"));
});

// @desc    Delete bill
// @route   DELETE /api/bills/:id
exports.deleteBill = asyncHandler(async (req, res) => {
  const bill = await Billing.findByIdAndDelete(req.params.id);

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Bill deleted successfully"));
});
