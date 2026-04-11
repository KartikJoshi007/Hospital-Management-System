const mongoose = require("mongoose");
const counter = require("../utils/counter");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    hospitalId: {
      type: String,
      unique: true,
      sparse: true,
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

    availability: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          required: true
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
      }
    ],

    contact: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^\d{10}$/, "Contact number must be exactly 10 digits"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email (e.g. name@domain.com)"],
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

    consultationFees: {
      type: Number,
      default: 500, // Default fee
      min: [0, "Fees cannot be negative"],
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

// 🏥 Auto-generate DOC-XXXX hospital ID on first save
doctorSchema.pre("save", async function (next) {
  if (!this.hospitalId) {
    const num = await counter.getNext("doctor");
    this.hospitalId = `DOC-${String(num).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Doctor", doctorSchema);