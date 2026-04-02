const User = require("../models/User");
const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    role,
  });

  // If role is patient, create patient profile
  if (role === "patient") {
    await Patient.create({
      userId: user._id,
      dateOfBirth: new Date(),
      gender: "other",
      bloodGroup: "O+",
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Return response
  return res.status(201).json(
    new ApiResponse(201, {
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

// @desc    Login user
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    throw new ApiError(400, "Please provide an email and password");
  }

  // Check for user (include password field)
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(401, "User account is deactivated");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  return res.status(200).json(
    new ApiResponse(200, {
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

// @desc    Get current logged-in user
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, avatar } = req.body;

  const fieldsToUpdate = {};
  if (fullName) fieldsToUpdate.fullName = fullName;
  if (phone) fieldsToUpdate.phone = phone;
  if (avatar) fieldsToUpdate.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  return res.status(200).json(
    new ApiResponse(200, user, "Profile updated successfully")
  );
});

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password field
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully")
  );
});

// @desc    Logout user
// @route   GET /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, {}, "User logged out successfully")
  );
});

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  return res.status(200).json(
    new ApiResponse(200, users, "Users fetched successfully")
  );
});

// @desc    Get user by ID
// @route   GET /api/auth/users/:id
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
});

// @desc    Update user role (Admin only)
// @route   PUT /api/auth/users/:id/role
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

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/auth/users/:id/toggle-active
exports.toggleActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isActive = !user.isActive;
  await user.save();

  const status = user.isActive ? "activated" : "deactivated";
  return res.status(200).json(
    new ApiResponse(200, user, `User account ${status} successfully`)
  );
});

// @desc    Deactivate user account (Self)
// @route   PUT /api/auth/deactivate
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
