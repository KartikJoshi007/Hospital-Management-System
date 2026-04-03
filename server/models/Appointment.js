const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient ID is required"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    appointmentTime: {
      type: String,
      required: [true, "Appointment time is required"],
    },
    // UI uses: Pending, Confirmed, Cancelled, Completed
    // Legacy values also kept: scheduled, completed, no-show, rescheduled
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Cancelled",
        "Completed",
        "scheduled",
        "completed",
        "cancelled",
        "no-show",
        "rescheduled",
      ],
      default: "Pending",
    },
    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
    },
    symptoms: String,   // Description of symptoms
    notes: String,      // Doctor's notes after appointment
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    cost: {
      type: Number,
      default: 0,
    },
    isFollowUp: {
      type: Boolean,
      default: false,
    },
    followUpAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
