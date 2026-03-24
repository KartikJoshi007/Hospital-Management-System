const { body } = require("express-validator");

exports.medicineValidator = [
  body("name").trim().notEmpty().withMessage("Medicine name is required"),
  body("quantity").isNumeric().withMessage("Quantity must be a number").isInt({ min: 0 }).withMessage("Quantity cannot be negative"),
  body("price").isNumeric().withMessage("Price must be a number"),
];
