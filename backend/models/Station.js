const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema({
  stationName: { type: String, required: true },
  stationCode: { type: String, required: true, unique: true },
  crewCapacity: Number,
  location: String,
}, { timestamps: true });

module.exports = mongoose.model("Station", stationSchema);