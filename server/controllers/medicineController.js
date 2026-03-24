const Medicine = require("../models/Medicine");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Add new medicine
// @route   POST /api/medicines
exports.addMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.create(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, medicine, "Medicine added successfully"));
});

// @desc    Get all medicines
// @route   GET /api/medicines
exports.getAllMedicines = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find();

  return res
    .status(200)
    .json(new ApiResponse(200, medicines, "Medicines fetched successfully"));
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
exports.updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!medicine) {
    throw new ApiError(404, "Medicine not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, medicine, "Medicine updated successfully"));
});

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
exports.deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);

  if (!medicine) {
    throw new ApiError(404, "Medicine not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Medicine deleted successfully"));
});

// @desc    Get low stock alerts
// @route   GET /api/medicines/stock-alerts
exports.getLowStockAlerts = asyncHandler(async (req, res) => {
  const lowStock = await Medicine.find({ quantity: { $lt: 10 } });

  return res
    .status(200)
    .json(new ApiResponse(200, lowStock, "Low stock alerts fetched successfully"));
});
