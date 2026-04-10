const mongoose = require("mongoose");

const receptionistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Receptionist name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email (e.g. name@domain.com)"],
    },

    contact: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^\d{10}$/, "Contact number must be exactly 10 digits"],
    },

    experience: {
      type: String,
      default: "0 Years",
    },

    shift: {
      type: String,
      enum: ["Morning", "Afternoon", "Night"],
      default: "Morning",
    },

    deskNumber: {
      type: String,
      default: "TBD",
    },

    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

receptionistSchema.index({ userId: 1 });
receptionistSchema.index({ email: 1 });

module.exports = mongoose.model("Receptionist", receptionistSchema);
