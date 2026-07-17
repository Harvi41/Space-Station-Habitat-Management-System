const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("stationId");

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      stationName: user.stationId?.stationName,
      createdAt: user.createdAt,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    );

    res.json({
      msg: "Profile updated",
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password incorrect" });
    }

    // hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    res.json({ msg: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;