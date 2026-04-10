const express = require("express");
const router = express.Router();
const receptionistController = require("../controllers/receptionistController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { receptionistValidator } = require("../validators/receptionistValidator");
const validate = require("../middleware/validatorMiddleware");

router.get("/", protect, receptionistController.getAllReceptionists);
router.get("/:id", protect, receptionistController.getReceptionistById);
router.post("/", protect, authorize("admin"), receptionistValidator, validate, receptionistController.createReceptionist);
router.put("/:id", protect, authorize("admin"), receptionistValidator, validate, receptionistController.updateReceptionist);
router.delete("/:id", protect, authorize("admin"), receptionistController.deleteReceptionist);
router.get("/user/:userId", protect, receptionistController.getReceptionistByUserId);

module.exports = router;
