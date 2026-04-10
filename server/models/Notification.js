const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "reception", "admin"],
      required: [true, "Role is required"],
      index: true,
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["booking", "cancellation", "leave", "document", "system"],
      required: [true, "Notification type is required"],
      index: true,
    },

    // Optional reference to the related entity
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceModel: {
      type: String,
      enum: ["Appointment", "DoctorEvent", "Document", "Patient", null],
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fetching user's unread notifications fast
// 🚀 PRODUCTION OPTIMIZATION
// 1. Compound index for fetching user's unread notifications fast
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// 2. Data Retention: Automatically delete notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model("Notification", notificationSchema);
