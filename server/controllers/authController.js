const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor"); // ✅ Added
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // ✅ IMPORTANT

// 🔐 Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// ================= REGISTER =================
exports.register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role } = req.body;

  // ✅ Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  // ✅ Create user
  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    role,
  });

  // ✅ Create patient profile if role = patient
  if (role === "patient") {
    await Patient.create({
      userId: user._id,
      name: user.fullName,
      age: 0, // Default, can be updated later
      gender: "Other",
      contact: user.phone || "Not Provided",
      bloodGroup: "O+",
      address: "Not Provided",
      status: "Active",
      height: 0,
      weight: 0,
    });
  }

  // ✅ Create doctor profile if role = doctor
  if (role === "doctor") {
    await Doctor.create({
      userId: user._id,
      name: user.fullName,
      email: user.email,
      specialization: "General",
      experience: "0 Years",
      availability: "TBD",
      contact: user.phone || "Not Provided",
      status: "Active",
    });
  }

  const token = generateToken(user._id);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      },
      "User registered successfully"
    )
  );
});

// ================= LOGIN =================
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // ✅ Validate input
  if (!email || !password) {
    throw new ApiError(400, "Please provide an email and password");
  }

  // ✅ Get user with password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // ✅ Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  // ✅ Check active status
  if (!user.isActive) {
    throw new ApiError(401, "User account is deactivated");
  }

  // ✅ Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        token,
      },
      "User logged in successfully"
    )
  );
});

// ================= GET ME =================
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
});

// ================= UPDATE PROFILE =================
exports.updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, avatar, email } = req.body;

  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (phone)    updateFields.phone    = phone;
  if (avatar)   updateFields.avatar   = avatar;

  if (email) {
    const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (exists) throw new ApiError(400, "Email already in use by another account");
    updateFields.email = email;
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateFields,
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, user, "Profile updated successfully")
  );
});

// ================= CHANGE PASSWORD =================
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save(); // pre-save hook will hash it

  return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully")
  );
});

// ================= LOGOUT =================
exports.logout = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, {}, "User logged out successfully")
  );
});

// ================= GET ALL USERS =================
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  return res.status(200).json(
    new ApiResponse(200, users, "Users fetched successfully")
  );
});

// ================= GET USER BY ID =================
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
});

// ================= UPDATE ROLE =================
exports.updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role) {
    throw new ApiError(400, "Role is required");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, `User role updated to ${role}`)
  );
});

// ================= TOGGLE ACTIVE =================
exports.toggleActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isActive = !user.isActive;
  await user.save();

  const status = user.isActive ? "activated" : "deactivated";

  return res.status(200).json(
    new ApiResponse(200, user, `User account ${status}`)
  );
});

// ================= DEACTIVATE ACCOUNT =================
exports.deactivateAccount = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { isActive: false },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, user, "Account deactivated successfully")
  );
});

exports.updateStatus = async (req, res) => {
  res.json({ message: "Status updated" });
};

