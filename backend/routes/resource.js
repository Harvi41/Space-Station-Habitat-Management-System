const express = require("express");
const router = express.Router();
const Resource = require("../models/Resource");
const auth = require("../middleware/auth");

router.post("/add", auth, async (req, res) => {
  try {
    const resource = new Resource({
      ...req.body,
      stationId: req.user.id,
    });

    await resource.save();
    res.json(resource);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const resources = await Resource.find({
      stationId: req.user.id,
    });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

module.exports = router;