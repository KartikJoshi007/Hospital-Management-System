const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String, // Tablet, Syrup, Injection
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
    },

    expiryDate: {
      type: Date,
    },

    supplier: {
      type: String,
    },

    status: {
      type: String,
      enum: ["available", "out_of_stock"],
      default: "available",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Medicine", medicineSchema);
