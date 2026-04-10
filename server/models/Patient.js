const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true // 🔥 ADD: fast search by user
    },

    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      index: true, // 🔥 ADD: Fast name search
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email (e.g. name@domain.com)"],
    },

    age: {
      type: Number,
    },

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "male", "female", "other"],
      required: [true, "Gender is required"],
    },

    contact: {
      type: String,
      required: [true, "Contact number is required"],
      index: true,
      match: [/^\d{10}$/, "Contact number must be exactly 10 digits"],
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
      index: true, // 🔥 ADD: Fast dashboard filter
    },

    // 🔥 ADD (for department-wise distribution charts)
    department: {
      type: String,
      enum: [
        "Cardiology",
        "Neurology",
        "Orthopedic",
        "Dermatology",
        "Pediatric",
        "General",
        "Emergency",
      ],
      default: "General",
      index: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      validate: {
        validator: function(v) {
          return v.trim().split(/\s+/).length <= 150;
        },
        message: "Address cannot exceed 150 words"
      }
    },

    medicalHistory: {
      type: String,
      required: [true, "Medical background is required"],
      validate: {
        validator: function(v) {
          return v?.trim().split(/\s+/).length <= 150;
        },
        message: "Medical background cannot exceed 150 words"
      }
    },

    // 🔥 UPDATED (Vitals Tracking)
    vitals: {
      bloodPressure: { type: String, default: "0/0" },
      heartRate: { type: Number, default: 0 },
      temperature: { type: Number, default: 0 },
      oxygenSaturation: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      weight: { type: Number, default: 0 },
      bmi: { type: Number, default: 0 },
      recordedAt: { type: Date, default: Date.now }
    },

    admissionDate: {
      type: Date,
      default: Date.now,
      index: true // 🔥 ADD: Dashboard analytics
    },

    // 🔥 ADD (track activity engagement)
    lastVisit: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);