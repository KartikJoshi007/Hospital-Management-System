const mongoose = require("mongoose");

// Atomic counter schema to generate sequential IDs safely
const counterSchema = new mongoose.Schema({
  _id:     { type: String, required: true }, // e.g. "patient", "doctor", "receptionist"
  seq:     { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

/**
 * Get the next sequential number for a given entity type.
 * Uses findOneAndUpdate with $inc for atomic, race-condition-safe increments.
 * @param {string} entity - e.g. "patient", "doctor", "receptionist"
 * @returns {Promise<number>} - next sequence number (1-indexed)
 */
const getNext = async (entity) => {
  const doc = await Counter.findOneAndUpdate(
    { _id: entity },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

module.exports = { getNext };
