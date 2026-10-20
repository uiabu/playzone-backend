const express = require("express");
const router = express.Router();
const db = require("../data/database");

// GET /api/video-testimonials
router.get("/", (req, res) => {
  let vids = db.getCollection("videoTestimonials");
  const { featuredOnly } = req.query;

  if (featuredOnly === "true") {
    vids = vids.filter((v) => v.isFeatured);
  }

  res.json({ success: true, count: vids.length, data: vids });
});

// PATCH /api/video-testimonials/:id/toggle
router.patch("/:id/toggle", (req, res) => {
  const { id } = req.params;
  const current = db.getItem("videoTestimonials", id);
  if (!current) {
    return res.status(404).json({ success: false, message: "Video not found" });
  }

  const updated = db.updateItem("videoTestimonials", id, { isFeatured: !current.isFeatured });
  res.json({ success: true, data: updated });
});

module.exports = router;
