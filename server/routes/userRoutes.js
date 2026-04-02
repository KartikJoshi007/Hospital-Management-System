const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { userIdParamValidator } = require("../validators/authValidator");
const validate = require("../middleware/validatorMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");

router.patch("/:id/role", protect, authorize("admin"), userIdParamValidator, validate, authController.updateRole);
router.put("/:id/role", protect, authorize("admin"), userIdParamValidator, validate, authController.updateRole);

router.patch("/:id/status", protect, authorize("admin"), userIdParamValidator, validate, authController.updateStatus);
router.put("/:id/status", protect, authorize("admin"), userIdParamValidator, validate, authController.updateStatus);

module.exports = router;
