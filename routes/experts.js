const express = require("express");
const router = express.Router();
const db = require("../data/database");

// GET /api/experts
router.get("/", (req, res) => {
  let experts = db.getCollection("experts");
  const { category, location, verified } = req.query;

  if (category && category !== "all") {
    experts = experts.filter((e) => e.category === category);
  }

  if (location && location !== "all") {
    experts = experts.filter((e) => e.location.toLowerCase() === location.toLowerCase());
  }

  if (verified !== undefined) {
    const isV = verified === "true" || verified === "1";
    experts = experts.filter((e) => e.verified === isV);
  }

  res.json({
    success: true,
    count: experts.length,
    data: experts,
  });
});

// GET /api/experts/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const expert = db.getItem("experts", id);

  if (!expert) {
    return res.status(404).json({ success: false, message: "Expert not found" });
  }

  res.json({ success: true, data: expert });
});

// POST /api/experts
router.post("/", (req, res) => {
  const { name, role, price } = req.body;
  if (!name || !role || price === undefined) {
    return res.status(400).json({ success: false, message: "Name, role, and price are required" });
  }

  const id = "exp-" + Math.random().toString(36).substring(2, 9);
  const newExpert = {
    id,
    name,
    role,
    imageSrc: req.body.imageSrc || "/images/experts/head_coach.png",
    rating: req.body.rating || 4.9,
    reviewsCount: req.body.reviewsCount || 1,
    location: req.body.location || "Dhaka",
    bio: req.body.bio || "",
    tags: Array.isArray(req.body.tags) ? req.body.tags : ["Cricket Coach"],
    price: Number(price),
    priceUnit: req.body.priceUnit || "/hour",
    category: req.body.category || "coaching",
    experienceYears: req.body.experienceYears ? Number(req.body.experienceYears) : 5,
    experienceLabel: req.body.experienceLabel || "5 - 10 years",
    verified: req.body.verified !== undefined ? req.body.verified : true,
    serviceModes: req.body.serviceModes || ["ground"],
    fullBio: req.body.fullBio || req.body.bio || "",
    certifications: req.body.certifications || ["BCB Certified"],
    availableDays: req.body.availableDays || ["Weekends", "Weekdays"],
  };

  db.addItem("experts", newExpert);
  res.status(201).json({ success: true, data: newExpert });
});

// PUT /api/experts/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const updated = db.updateItem("experts", id, req.body);

  if (!updated) {
    return res.status(404).json({ success: false, message: "Expert not found" });
  }

  res.json({ success: true, data: updated });
});

// DELETE /api/experts/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteItem("experts", id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Expert not found" });
  }

  res.json({ success: true, message: "Expert removed" });
});

module.exports = router;
