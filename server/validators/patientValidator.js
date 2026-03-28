const { body, param } = require("express-validator");

exports.patientValidator = [
  body("dateOfBirth")
    .isISO8601()
    .withMessage("Invalid date of birth format"),
  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
  body("bloodGroup")
    .isIn(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"])
    .withMessage("Invalid blood group"),
  body("address.city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("address.state")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("State is required"),
  body("address.zipCode")
    .optional()
    .trim()
    .matches(/^[0-9]{5,6}$/)
    .withMessage("Invalid zip code format"),
  body("emergencyContact.phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid emergency contact phone"),
  body("height")
    .optional()
    .isNumeric()
    .withMessage("Height must be a number"),
  body("weight")
    .optional()
    .isNumeric()
    .withMessage("Weight must be a number"),
];

exports.patientUpdateValidator = [
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date of birth format"),
  body("bloodGroup")
    .optional()
    .isIn(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"])
    .withMessage("Invalid blood group"),
  body("height")
    .optional()
    .isNumeric()
    .withMessage("Height must be a number"),
  body("weight")
    .optional()
    .isNumeric()
    .withMessage("Weight must be a number"),
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
