const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  userIdParamValidator,
} = require("../validators/authValidator");
const validate = require("../middleware/validatorMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.get("/logout", authController.logout);

// Protected routes
router.get("/me", protect, authController.getMe);
router.put("/profile", protect, updateProfileValidator, validate, authController.updateProfile);
router.put("/change-password", protect, changePasswordValidator, validate, authController.changePassword);
router.put("/deactivate", protect, authController.deactivateAccount);

// Admin routes
router.get("/users", protect, authorize("admin"), authController.getAllUsers);
router.get("/users/:id", protect, authorize("admin"), userIdParamValidator, validate, authController.getUserById);
router.put("/users/:id/role", protect, authorize("admin"), userIdParamValidator, validate, authController.updateRole);
router.put("/users/:id/toggle-active", protect, authorize("admin"), userIdParamValidator, validate, authController.toggleActive);

module.exports = router;
