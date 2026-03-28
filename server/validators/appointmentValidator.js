const { body, param } = require("express-validator");

exports.appointmentValidator = [
  body("patientId")
    .isMongoId()
    .withMessage("Invalid patient ID"),
  body("doctorId")
    .isMongoId()
    .withMessage("Invalid doctor ID"),
  body("appointmentDate")
    .isISO8601()
    .withMessage("Invalid appointment date format"),
  body("appointmentTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (use HH:MM)"),
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason for appointment is required")
    .isLength({ min: 5 })
    .withMessage("Reason must be at least 5 characters"),
  body("symptoms")
    .optional()
    .trim(),
  body("duration")
    .optional()
    .isNumeric()
    .withMessage("Duration must be a number"),
];

exports.appointmentUpdateValidator = [
  body("appointmentDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid appointment date format"),
  body("appointmentTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (use HH:MM)"),
  body("status")
    .optional()
    .isIn(["scheduled", "completed", "cancelled", "no-show", "rescheduled"])
    .withMessage("Invalid status"),
  body("reason")
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Reason must be at least 5 characters"),
  body("notes")
    .optional()
    .trim(),
];

exports.appointmentIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid appointment ID"),
];

exports.patientIdParamValidator = [
  param("patientId")
    .isMongoId()
    .withMessage("Invalid patient ID"),
];

exports.doctorIdParamValidator = [
  param("doctorId")
    .isMongoId()
    .withMessage("Invalid doctor ID"),
];
