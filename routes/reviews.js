const express = require("express");
const router = express.Router();
const db = require("../data/database");

// GET /api/reviews
router.get("/", (req, res) => {
  let reviews = db.getCollection("reviews");
  const { status, approvedOnly } = req.query;

  if (status && status !== "all") {
    reviews = reviews.filter((r) => r.status === status);
  } else if (approvedOnly === "true") {
    reviews = reviews.filter((r) => r.status === "approved");
  }

  res.json({ success: true, count: reviews.length, data: reviews });
});

// POST /api/reviews (Submitted from product details page)
router.post("/", (req, res) => {
  const { author, rating, title, comment, productName } = req.body;
  if (!author || !rating || !comment) {
    return res.status(400).json({ success: false, message: "Author, rating, and comment are required" });
  }

  const id = "rev-" + Math.random().toString(36).substring(2, 9);
  const newReview = {
    id,
    author,
    verified: req.body.verified !== undefined ? req.body.verified : false,
    rating: Number(rating),
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }),
    productName: productName || "Cricket Equipment",
    title: title || "Review from Player",
    comment,
    location: req.body.location || "Bangladesh",
    status: req.body.status || "pending",
  };

  db.addItem("reviews", newReview);
  res.status(201).json({ success: true, message: "Review submitted for verification", data: newReview });
});

// PATCH /api/reviews/:id/status
router.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required" });
  }

  const updated = db.updateItem("reviews", id, { status });
  if (!updated) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  res.json({ success: true, data: updated });
});

// DELETE /api/reviews/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteItem("reviews", id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  res.json({ success: true, message: "Review deleted" });
});

module.exports = router;
