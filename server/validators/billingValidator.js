const { body } = require("express-validator");

exports.billingValidator = [
  body("patientId").isMongoId().withMessage("Invalid Patient ID format"),
  body("amount").isNumeric().withMessage("Amount must be a number"),
];
