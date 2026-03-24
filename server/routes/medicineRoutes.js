const express = require("express");
const router = express.Router();
const medicineController = require("../controllers/medicineController");
const { medicineValidator } = require("../validators/medicineValidator");
const validate = require("../middleware/validatorMiddleware");

router
  .route("/")
  .post(medicineValidator, validate, medicineController.addMedicine)
  .get(medicineController.getAllMedicines);

router.get("/stock-alerts", medicineController.getLowStockAlerts);

router
  .route("/:id")
  .put(medicineValidator, validate, medicineController.updateMedicine)
  .delete(medicineController.deleteMedicine);

module.exports = router;
