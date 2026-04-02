const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    // Support both ObjectId ref AND plain string name (UI sends patient names directly)
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },

    // Plain text patient name — used when creating bills from RevenueDashboard
    patientName: {
      type: String,
      trim: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    // Bill type as shown in the UI
    type: {
      type: String,
      enum: ["OPD", "IPD", "Lab", "Pharmacy"],
      default: "OPD",
    },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Overdue"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "other"],
      default: undefined,
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Billing", billingSchema);
