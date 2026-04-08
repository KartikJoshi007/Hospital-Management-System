const mongoose = require("mongoose");

const scheduleEventSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["appointment", "upcoming", "procedure", "leave", "holiday"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String, // Keep as YYYY-MM-DD for easier front-end parity or use Date
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ScheduleEvent", scheduleEventSchema);
