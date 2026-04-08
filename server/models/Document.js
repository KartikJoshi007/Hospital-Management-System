const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient ID is required"],
      index: true,
    },

    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },

    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },

    fileType: {
      type: String,
      enum: ["report", "prescription", "lab_result", "discharge_summary", "imaging", "other"],
      default: "other",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,

    },


    description: {
      type: String,
      default: "",
      trim: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);
