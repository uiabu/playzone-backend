const express = require("express");
const router = express.Router();
const db = require("../data/database");

// GET /api/blogs
router.get("/", (req, res) => {
  let blogs = db.getCollection("blogs");
  const { publishedOnly } = req.query;

  if (publishedOnly === "true") {
    blogs = blogs.filter((b) => b.isPublished);
  }

  res.json({ success: true, count: blogs.length, data: blogs });
});

// GET /api/blogs/:idOrSlug
router.get("/:idOrSlug", (req, res) => {
  const { idOrSlug } = req.params;
  const blogs = db.getCollection("blogs");
  const post = blogs.find((b) => b.id === idOrSlug || b.slug === idOrSlug);

  if (!post) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  res.json({ success: true, data: post });
});

// POST /api/blogs
router.post("/", (req, res) => {
  const { title, excerpt } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }

  const id = "blog-" + Math.random().toString(36).substring(2, 9);
  const slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const newPost = {
    id,
    slug,
    title,
    category: req.body.category || "Bat Care & Prep",
    readTime: req.body.readTime || "5 min read",
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }),
    author: req.body.author || "PLAYZONE Expert",
    imageSrc: req.body.imageSrc || "/images/products/bats/sg_bat.png",
    excerpt: excerpt || "",
    isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
  };

  db.addItem("blogs", newPost);
  res.status(201).json({ success: true, data: newPost });
});

// PUT /api/blogs/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const updated = db.updateItem("blogs", id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }
  res.json({ success: true, data: updated });
});

// PATCH /api/blogs/:id/publish
router.patch("/:id/publish", (req, res) => {
  const { id } = req.params;
  const current = db.getItem("blogs", id);
  if (!current) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  const updated = db.updateItem("blogs", id, { isPublished: !current.isPublished });
  res.json({ success: true, data: updated });
});

// DELETE /api/blogs/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteItem("blogs", id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }
  res.json({ success: true, message: "Article deleted" });
});

module.exports = router;
