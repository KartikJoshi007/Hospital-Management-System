const { body, param } = require("express-validator");

exports.receptionistValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("Invalid email address"),
  body("contact")
    .notEmpty()
    .withMessage("Contact number is required"),
  body("shift")
    .optional()
    .isIn(["Morning", "Afternoon", "Night"])
    .withMessage("Invalid shift value"),
  body("status")
    .optional()
    .isIn(["Active", "On Leave", "Inactive"])
    .withMessage("Invalid status"),
];

exports.receptionistIdParamValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid receptionist ID"),
];
