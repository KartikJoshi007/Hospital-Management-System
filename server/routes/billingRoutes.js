const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");
const { billingValidator } = require("../validators/billingValidator");
const validate = require("../middleware/validatorMiddleware");

const { protect, authorize } = require("../middleware/authMiddleware");

// Create + Get All
router
  .route("/")
  .post(protect, authorize("admin", "reception"), billingValidator, validate, billingController.createBill)
  .get(protect, authorize("admin", "reception"), billingController.getAllBills);

// Stats and Revenue
router.get("/stats", protect, authorize("admin"), billingController.getBillingStats);
router.get("/revenue", protect, authorize("admin"), billingController.getRevenueReport);

// Patient lookup
router.get("/patient/:patientId", protect, billingController.getBillsByPatient);

// ID-specific routes
router
  .route("/:id")
  .get(protect, billingController.getBillById)
  .put(protect, authorize("admin", "reception"), billingController.updateBill)
  .delete(protect, authorize("admin"), billingController.deleteBill);

// Mark as paid
router.put("/:id/mark-paid", protect, authorize("admin", "reception"), billingController.markBillPaid);
router.patch("/:id/pay", protect, authorize("admin", "reception"), billingController.markBillPaid);
router.put("/:id/pay", protect, authorize("admin", "reception"), billingController.markBillPaid);

module.exports = router;