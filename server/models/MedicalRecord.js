const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null, // Can be null for 'External' records
    },
    type: {
      type: String,
      enum: ["Prescription", "Lab Report", "Clinical Note", "Historical History"],
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["Internal", "External"],
      default: "Internal",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Record title is required"],
      trim: true,
    },
    clinicName: {
      type: String,
      default: "Our Hospital", // Generic if internal, specific if external
    },
    description: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
