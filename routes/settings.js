const express = require("express");
const router = express.Router();
const db = require("../data/database");

// GET /api/settings
router.get("/", (req, res) => {
  const settings = db.getSettings();
  res.json({ success: true, data: settings });
});

// PUT /api/settings
router.put("/", (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, message: "Settings saved successfully", data: updated });
});

// POST /api/settings/reset
router.post("/reset", (req, res) => {
  const resetDb = db.resetToDefaults();
  res.json({ success: true, message: "Store database reset to default seed data", data: resetDb.settings });
});

module.exports = router;
