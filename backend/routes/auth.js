const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Station = require("../models/Station");

router.post("/signup", async (req, res) => {
  try {
    const {
      stationName,
      stationCode,
      crewCapacity,
      location,
      name,
      email,
      password,
    } = req.body;

    // check existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // 1. Create Station
    const station = new Station({
      stationName,
      stationCode,
      crewCapacity,
      location,
    });

    await station.save();

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create Admin User
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      stationId: station._id,
    });

    await user.save();

    res.json({
      message: "✅ Station & Admin created",
      station,
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("stationId");

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


