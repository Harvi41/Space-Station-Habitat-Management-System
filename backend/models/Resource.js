const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  label: String,
  description: String,
  category: String, // Life Support, Consumables, etc
  currentValue: Number,
  maxValue: Number,
  unit: String,

  warningThreshold: Number,
  criticalThreshold: Number,

  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
  },

}, { timestamps: true });

module.exports = mongoose.model("Resource", resourceSchema);