const { body, param } = require("express-validator");

exports.patientValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Patient name is required"),
  body("age")
    .isInt({ min: 1, max: 130 })
    .withMessage("Age must be an integer between 1 and 130"),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required"),
  body("contact")
    .notEmpty()
    .withMessage("Contact number is required"),
  body("bloodGroup")
    .isIn(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"])
    .withMessage("Invalid blood group"),
  body("address")
    .notEmpty()
    .withMessage("Address is required"),
  body("status")
    .optional()
    .isIn(["Active", "Admitted", "Discharged"])
    .withMessage("Invalid status"),
  body("medicalHistory")
    .optional()
    .isString(),
  body("height")
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage("Height must be between 30 and 300 cm"),
  body("weight")
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage("Weight must be between 1 and 500 kg"),
];

exports.patientUpdateValidator = [
  body("name").optional().notEmpty(),
  body("age").optional().isNumeric(),
  body("gender").optional().notEmpty(),
  body("contact").optional().notEmpty(),
  body("bloodGroup").optional().isString(),
  body("address").optional().notEmpty(),
  body("status").optional().isIn(["Active", "Admitted", "Discharged"]),
  body("height")
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage("Height must be between 30 and 300 cm"),
  body("weight")
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage("Weight must be between 1 and 500 kg"),
];

exports.patientIdParamValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid patient ID"),
];

exports.userIdParamValidator = [
  param("userId")
    .isMongoId()
    .withMessage("Invalid user ID"),
];
