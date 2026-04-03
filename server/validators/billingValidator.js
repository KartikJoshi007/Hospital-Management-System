const { body } = require("express-validator");

exports.billingValidator = [
  // patientId is optional — UI (RevenueDashboard) sends patient names as plain strings
  body("patientId")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid Patient ID format"),

  // patientName used when no patientId is provided
  body("patientName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Patient name cannot be blank"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number"),

  body("type")
    .optional()
    .isIn(["OPD", "IPD", "Lab", "Pharmacy"])
    .withMessage("Type must be one of: OPD, IPD, Lab, Pharmacy"),

  body("paymentStatus")
    .optional()
    .isIn(["Paid", "Pending", "Overdue"])
    .withMessage("Payment status must be Paid, Pending, or Overdue"),

  body("status")
    .optional()
    .isIn(["Paid", "Pending", "Overdue"])
    .withMessage("Status must be Paid, Pending, or Overdue"),
];
