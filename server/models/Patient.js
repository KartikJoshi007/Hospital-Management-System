const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Keep for PatientDashboard functionality
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "male", "female", "other"],
      required: [true, "Gender is required"],
    },
    contact: {
      type: String,
      required: [true, "Contact number is required"],
    },
    bloodGroup: {
      type: String,
      enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
      required: [true, "Blood group is required"],
    },
    status: {
      type: String,
      enum: ["Active", "Admitted", "Discharged"],
      default: "Active",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    medicalHistory: {
      type: String, // UI sends a simple string or description
      default: "No known conditions",
    },
    height: {
      type: Number, // In cm
      default: 0,
    },
    weight: {
      type: Number, // In kg
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
