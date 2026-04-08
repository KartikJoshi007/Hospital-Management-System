const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
    },

    category: {
      type: String,
      enum: [
        "cardiology",
        "neurology",
        "orthopedic",
        "dermatology",
        "pediatric",
        "general",
      ],
      default: "general",
    },

    experience: {
      type: String,
      required: [true, "Experience is required"],
    },

    availability: {
      type: String,
      required: [true, "Availability is required"],
    },

    contact: {
      type: String,
      required: [true, "Contact number is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
    },

    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
      index: true,
    },

    roleLevel: {
      type: String,
      enum: [
        "senior doctor",
        "junior doctor",
        "resident doctor",
        "consultant",
        "intern",
        "other",
      ],
      default: "other",
    },

    isOnDuty: {
      type: Boolean,
      default: false,
    },

    shift: {
      type: String,
      enum: ["Morning", "Afternoon", "Night", "On Call"],
      default: "Morning",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    patients: {
      type: Number,
      default: 0,
    },

    totalAppointments: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 🕓 DYNAMIC: Duty status tracking
doctorSchema.virtual('isCurrentlyOnShift').get(function() {
  const currentHour = new Date().getHours();
  if (this.shift === 'Morning')   return currentHour >= 8 && currentHour < 14;
  if (this.shift === 'Afternoon') return currentHour >= 14 && currentHour < 20;
  if (this.shift === 'Night')     return currentHour >= 20 || currentHour < 8;
  if (this.shift === 'On Call')   return true;
  return false;
});

// 🚀 PRODUCTION INDICES
doctorSchema.index({ userId: 1 });
doctorSchema.index({ specialization: 1, status: 1 });
doctorSchema.index({ shift: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);