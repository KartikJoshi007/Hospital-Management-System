const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");
const { billingValidator } = require("../validators/billingValidator");
const validate = require("../middleware/validatorMiddleware");

// Create + Get All
router
  .route("/")
  .post(billingValidator, validate, billingController.createBill)
  .get(billingController.getAllBills);

// Revenue (IMPORTANT: above /:id)
router.get("/revenue", billingController.getRevenueReport);

// Get Single + Update + Delete
router
  .route("/:id")
  .get(billingController.getBillById)
  .put(billingController.updateBill)
  .delete(billingController.deleteBill);

module.exports = router;