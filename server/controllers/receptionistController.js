const Receptionist = require("../models/Receptionist");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Get all receptionists
// @route   GET /api/receptionists
exports.getAllReceptionists = asyncHandler(async (req, res) => {
  // 🚀 Sync Check: Ensure all 'reception' users have a profile
  const allReceptionUsers = await User.find({ role: 'reception' });
  const existingProfileUserIds = await Receptionist.find().distinct('userId');
  
  for (const user of allReceptionUsers) {
    if (!existingProfileUserIds.some(id => id.toString() === user._id.toString())) {
      await Receptionist.create({
        userId: user._id,
        name: user.fullName || "New Staff",
        email: user.email,
        contact: user.phone || "0000000000",
        status: "Active",
        shift: "Morning"
      });
    }
  }

  const { search, status, shift } = req.query;

  let query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status) query.status = status;
  if (shift) query.shift = shift;

  const receptionists = await Receptionist.find(query).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, receptionists, "Receptionists fetched successfully")
  );
});

// @desc    Get receptionist by ID
// @route   GET /api/receptionists/:id
exports.getReceptionistById = asyncHandler(async (req, res) => {
  const receptionist = await Receptionist.findById(req.params.id);

  if (!receptionist) {
    throw new ApiError(404, "Receptionist not found");
  }

  return res.status(200).json(
    new ApiResponse(200, receptionist, "Receptionist fetched successfully")
  );
});

// @desc    Create receptionist
// @route   POST /api/receptionists
exports.createReceptionist = asyncHandler(async (req, res) => {
  const { name, email, contact, experience, shift, deskNumber, status, password } = req.body;

  // 1. Check if user already exists
  let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });

  if (!user) {
    // 2. Create User account
    user = await User.create({
      fullName: name,
      email: email.toLowerCase(),
      phone: contact,
      password: password || "Reception@123",
      role: "reception",
    });
  }

  // 3. Create Receptionist profile
  const receptionist = await Receptionist.create({
    userId: user._id,
    name,
    email: email.toLowerCase(),
    contact,
    experience: experience || "0 Years",
    shift: shift || "Morning",
    deskNumber: deskNumber || "TBD",
    status: status || "Active"
  });

  return res.status(201).json(
    new ApiResponse(201, receptionist, "Receptionist created successfully")
  );
});

// @desc    Update receptionist
// @route   PUT /api/receptionists/:id
exports.updateReceptionist = asyncHandler(async (req, res) => {
  const { name, email, contact, experience, shift, deskNumber, status, password } = req.body;

  let receptionist = await Receptionist.findById(req.params.id);
  if (!receptionist) {
    throw new ApiError(404, "Receptionist not found");
  }

  if (name !== undefined) receptionist.name = name;
  if (email !== undefined) receptionist.email = email;
  if (contact !== undefined) receptionist.contact = contact;
  if (experience !== undefined) receptionist.experience = experience;
  if (shift !== undefined) receptionist.shift = shift;
  if (deskNumber !== undefined) receptionist.deskNumber = deskNumber;
  if (status !== undefined) receptionist.status = status;

  receptionist = await receptionist.save();
  
  // ✅ Synchronize linked User account
  const user = await User.findById(receptionist.userId);
  if (user) {
    if (name) user.fullName = name;
    if (contact) user.phone = contact;
    if (email) user.email = email.toLowerCase();
    if (password) user.password = password; // Triggers hashing in pre-save hook
    
    await user.save();
  }

  return res.status(200).json(
    new ApiResponse(200, receptionist, "Receptionist updated successfully")
  );
});

// @desc    Delete receptionist
// @route   DELETE /api/receptionists/:id
exports.deleteReceptionist = asyncHandler(async (req, res) => {
  const receptionist = await Receptionist.findByIdAndDelete(req.params.id);
  if (!receptionist) {
    throw new ApiError(404, "Receptionist not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Receptionist deleted successfully")
  );
});

// @desc    Get receptionist by User ID (Lazy Creation)
// @route   GET /api/receptionists/user/:userId
exports.getReceptionistByUserId = asyncHandler(async (req, res) => {
  let receptionist = await Receptionist.findOne({ userId: req.params.userId });

  if (!receptionist) {
    const user = await User.findById(req.params.userId);
    if (user && user.role === "reception") {
      receptionist = await Receptionist.create({
        userId: user._id,
        name: user.fullName || "New Staff",
        email: user.email,
        contact: user.phone || "Not Provided",
        status: "Active",
      });
    } else {
      throw new ApiError(404, "Receptionist profile not found for this user");
    }
  }

  return res.status(200).json(
    new ApiResponse(200, receptionist, "Receptionist profile fetched successfully")
  );
});
