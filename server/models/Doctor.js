const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    qualification: {
      type: String, // MBBS, MD, etc.
      required: true,
    },

    experience: {
      type: Number, // in years
      required: true,
    },

    contact: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
    },

    availability: [
      {
        day: String, // Monday, Tuesday
        startTime: String, // 09:00 AM
        endTime: String, // 02:00 PM
      },
    ],

    fees: {
      type: Number,
      required: true,
    },

    department: {
      type: String, // Cardiology, Orthopedics
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Doctor", doctorSchema);
