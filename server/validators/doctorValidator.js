const { body } = require("express-validator");

exports.doctorValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Doctor name is required"),

  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required"),

  // Optional — not required by the DoctorManagement UI form
  body("qualification")
    .optional()
    .trim(),

  // Accept both "5 Years" (string from UI) or plain number
  body("experience")
    .optional()
    .trim(),

  body("contact")
    .notEmpty()
    .withMessage("Contact number is required"),

  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email format"),

  // Optional — not required by the DoctorManagement UI form
  body("fees")
    .optional()
    .isNumeric()
    .withMessage("Fees must be a number"),

  body("status")
    .optional()
    .isIn(["Active", "On Leave", "Inactive"])
    .withMessage("Status must be one of: Active, On Leave, Inactive"),
];
