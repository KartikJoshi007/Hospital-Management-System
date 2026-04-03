const express = require("express");
const router = express.Router();
const queueController = require("../controllers/queueController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(protect, authorize("admin", "reception"), queueController.getQueue)
  .post(protect, authorize("admin", "reception"), queueController.addToQueue);

router
  .route("/:id")
  .put(protect, authorize("admin", "reception"), queueController.updateQueueStatus)
  .patch(protect, authorize("admin", "reception"), queueController.updateQueueStatus)
  .delete(protect, authorize("admin", "reception"), queueController.removeFromQueue);

module.exports = router;
