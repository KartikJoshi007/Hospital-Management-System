const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    bloodGroup: {
      type: String,
      enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
      required: [true, "Blood group is required"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    allergies: [String], // List of allergies
    medicalHistory: [String], // Previous medical conditions
    insuranceProvider: String,
    insuranceId: String,
    insuranceExpiry: Date,
    height: Number, // in cm
    weight: Number, // in kg
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", patientSchema);
