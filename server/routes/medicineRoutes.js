const express = require("express");
const router = express.Router();
const medicineController = require("../controllers/medicineController");
const { medicineValidator } = require("../validators/medicineValidator");
const validate = require("../middleware/validatorMiddleware");

const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, authorize("admin"), medicineValidator, validate, medicineController.addMedicine)
  .get(protect, medicineController.getAllMedicines);

router.get("/stock-alerts", protect, authorize("admin", "reception"), medicineController.getLowStockAlerts);

router
  .route("/:id")
  .put(protect, authorize("admin"), medicineValidator, validate, medicineController.updateMedicine)
  .delete(protect, authorize("admin"), medicineController.deleteMedicine);

module.exports = router;
