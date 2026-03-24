const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");
const { billingValidator } = require("../validators/billingValidator");
const validate = require("../middleware/validatorMiddleware");

router
  .route("/")
  .post(billingValidator, validate, billingController.createBill)
  .get(billingController.getAllBills);

router.get("/revenue", billingController.getRevenueReport);

router.route("/:id").get(billingController.getBillById);

module.exports = router;
