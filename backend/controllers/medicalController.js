import MedicalItem from "../models/MedicalItem.js";


// GET ALL
export const getItems = async (req, res) => {
  try {
    const items = await MedicalItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ADD ITEM
export const addItem = async (req, res) => {
  try {
    const item = new MedicalItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// UPDATE ITEM (edit + quantity change)
export const updateItem = async (req, res) => {
  try {
    const updated = await MedicalItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// DELETE ITEM
export const deleteItem = async (req, res) => {
  try {
    await MedicalItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};