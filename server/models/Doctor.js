const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
    },

    // Optional – not sent by DoctorManagement UI form
    qualification: {
      type: String, // MBBS, MD, etc.
      default: null,
    },

    // Accept either a number (years) or a string like "5 Years" from the UI
    experience: {
      type: String,
      default: null,
    },

    contact: {
      type: String,
      required: [true, "Contact number is required"],
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,   // Allows multiple null values
    },

    // Accept plain-text availability (UI sends "Mon–Fri (10AM–2PM)")
    // OR structured array – both supported
    availability: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Optional – not sent by DoctorManagement UI form
    fees: {
      type: Number,
      default: null,
    },

    department: {
      type: String, // Cardiology, Orthopedics
      default: null,
    },

    // Match the UI status values exactly
    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
