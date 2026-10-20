const express = require("express");
const router = express.Router();
const db = require("../data/database");

// GET /api/products (with optional query filters: search, category, brand, inStock)
router.get("/", (req, res) => {
  let products = db.getCollection("products");
  const { search, category, brand, inStock } = req.query;

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (category && category !== "all") {
    products = products.filter((p) => p.category === category || p.categorySlug === category);
  }

  if (brand && brand !== "all") {
    products = products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (inStock !== undefined) {
    const isStockTrue = inStock === "true" || inStock === "1";
    products = products.filter((p) => (isStockTrue ? p.inStock && p.stockCount > 0 : !p.inStock || p.stockCount === 0));
  }

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

// GET /api/products/:idOrSlug
router.get("/:idOrSlug", (req, res) => {
  const { idOrSlug } = req.params;
  const products = db.getCollection("products");
  const product = products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, data: product });
});

// POST /api/products
router.post("/", (req, res) => {
  const { name, brand, category, price } = req.body;
  if (!name || !brand || !category || price === undefined) {
    return res.status(400).json({ success: false, message: "Missing required fields: name, brand, category, price" });
  }

  const id = "pz-" + Math.random().toString(36).substring(2, 9);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const newProduct = {
    ...req.body,
    id,
    slug: req.body.slug || slug,
    categorySlug: req.body.categorySlug || category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    stockCount: req.body.stockCount !== undefined ? Number(req.body.stockCount) : 10,
    inStock: req.body.inStock !== undefined ? req.body.inStock : true,
    rating: req.body.rating || 4.8,
    reviewsCount: req.body.reviewsCount || 1,
    createdAt: new Date().toISOString(),
  };

  db.addItem("products", newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

// PUT /api/products/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const updated = db.updateItem("products", id, req.body);

  if (!updated) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, data: updated });
});

// PATCH /api/products/:id/stock
router.patch("/:id/stock", (req, res) => {
  const { id } = req.params;
  const { stockCount, inStock } = req.body;
  const updates = {};

  if (stockCount !== undefined) {
    const count = Math.max(0, Number(stockCount));
    updates.stockCount = count;
    updates.inStock = count > 0;
  }

  if (inStock !== undefined) {
    updates.inStock = Boolean(inStock);
    if (updates.inStock && updates.stockCount === undefined) {
      const current = db.getItem("products", id);
      if (current && current.stockCount === 0) updates.stockCount = 5;
    }
  }

  const updated = db.updateItem("products", id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, data: updated });
});

// DELETE /api/products/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteItem("products", id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, message: "Product removed from inventory" });
});

module.exports = router;
