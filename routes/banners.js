const express = require("express");
const router = express.Router();
const db = require("../data/database");

// GET /api/banners
router.get("/", (req, res) => {
  const banners = db.getCollection("banners");
  res.json({ success: true, count: banners.length, data: banners });
});

// GET /api/banners/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const banner = db.getItem("banners", id);
  if (!banner) {
    return res.status(404).json({ success: false, message: "Banner not found" });
  }
  res.json({ success: true, data: banner });
});

// POST /api/banners
router.post("/", (req, res) => {
  const { title, imageSrc } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: "Banner title is required" });
  }

  const id = "banner-" + Math.random().toString(36).substring(2, 9);
  const newBanner = {
    id,
    title: title.trim(),
    subtitle: req.body.subtitle || "",
    badgeText: req.body.badgeText || "",
    buttonText: req.body.buttonText || "Shop Now",
    buttonLink: req.body.buttonLink || "/category/cricket-bats",
    imageSrc: imageSrc || "/images/banners/pre_owned_cta_banner.png",
    active: req.body.active !== undefined ? Boolean(req.body.active) : true,
    type: req.body.type || "cta",
    createdAt: new Date().toISOString(),
  };

  db.addItem("banners", newBanner);
  res.status(201).json({ success: true, data: newBanner });
});

// PATCH /api/banners/:id/toggle
router.patch("/:id/toggle", (req, res) => {
  const { id } = req.params;
  const current = db.getItem("banners", id);
  if (!current) {
    return res.status(404).json({ success: false, message: "Banner not found" });
  }

  const updated = db.updateItem("banners", id, { active: !current.active });
  res.json({ success: true, data: updated });
});

// PUT /api/banners/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const updated = db.updateItem("banners", id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Banner not found" });
  }
  res.json({ success: true, data: updated });
});

// DELETE /api/banners/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteItem("banners", id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Banner not found" });
  }
  res.json({ success: true, message: "Banner deleted" });
});

module.exports = router;
