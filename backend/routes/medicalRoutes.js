const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const MedicalItem = require("../models/MedicalItem");


/* ============================================================
   GET ALL ITEMS
============================================================ */
router.get("/", auth, async (req, res) => {
  try {
    const items = await MedicalItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ============================================================
   ADD ITEM
============================================================ */
router.post("/add", auth, async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      location,
      expiryDate
    } = req.body;

    const item = new MedicalItem({
      name,
      category,
      quantity,
      unit,
      location,
      expiryDate
    });

    await item.save();

    res.status(201).json(item);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/* ============================================================
   UPDATE ITEM (EDIT + QUANTITY)
============================================================ */
router.put("/:id", auth, async (req, res) => {
  try {
    const updatedItem = await MedicalItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedItem);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/* ============================================================
   DELETE ITEM
============================================================ */
router.delete("/:id", auth, async (req, res) => {
  try {
    await MedicalItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed successfully" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/* ============================================================
   FILTER BY CATEGORY (OPTIONAL BUT USEFUL)
============================================================ */
router.get("/category/:type", auth, async (req, res) => {
  try {
    const items = await MedicalItem.find({
      category: req.params.type
    });

    res.json(items);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;