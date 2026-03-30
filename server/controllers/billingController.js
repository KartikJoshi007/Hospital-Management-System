const Billing = require("../models/Billing");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Create new bill
// @route   POST /api/bills
exports.createBill = asyncHandler(async (req, res) => {
  const bill = await Billing.create(req.body);

  return res
    .status(201) 
    .json(new ApiResponse(201, bill, "Bill created successfully"));
});

// @desc    Get all bills
// @route   GET /api/bills
exports.getAllBills = asyncHandler(async (req, res) => {
  const bills = await Billing.find()
    .populate("patientId", "name email contact")
    .populate("doctorId", "name specialization");

  return res
    .status(200)
    .json(new ApiResponse(200, bills, "Bills fetched successfully"));
});

// @desc    Get single bill
// @route   GET /api/bills/:id
exports.getBillById = asyncHandler(async (req, res) => {
  const bill = await Billing.findById(req.params.id)
    .populate("patientId", "name email contact")
    .populate("doctorId", "name specialization");

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, bill, "Bill fetched successfully"));
});

// @desc    Get revenue report
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

// @desc Update bill
// @route PUT /api/bills/:id
exports.updateBill = asyncHandler(async (req, res) => {
  const bill = await Billing.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, bill, "Bill updated successfully"));
});


// @desc Delete bill
// @route DELETE /api/bills/:id
exports.deleteBill = asyncHandler(async (req, res) => {
  const bill = await Billing.findByIdAndDelete(req.params.id);

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Bill deleted successfully"));
});
