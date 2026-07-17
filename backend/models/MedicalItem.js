const mongoose = require("mongoose");

const medicalSchema = new mongoose.Schema({
  name: String,
  category: String,
  quantity: Number,
  unit: String,
  expiryDate: Date,
  location: String,
}, { timestamps: true });

module.exports = mongoose.model("MedicalItem", medicalSchema);
