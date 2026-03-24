const { body } = require("express-validator");

exports.doctorValidator = [
  body("name").trim().notEmpty().withMessage("Doctor name is required"),
  body("specialization").trim().notEmpty().withMessage("Specialization is required"),
  body("qualification").trim().notEmpty().withMessage("Qualification is required"),
  body("experience").isNumeric().withMessage("Experience must be a number"),
  body("contact").notEmpty().withMessage("Contact number is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("fees").isNumeric().withMessage("Fees must be a number"),
];
