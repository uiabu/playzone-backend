const express = require("express");
const router = express.Router();
const db = require("../data/database");

// GET /api/coupons
router.get("/", (req, res) => {
  const coupons = db.getCollection("coupons");
  res.json({ success: true, count: coupons.length, data: coupons });
});

// POST /api/coupons
router.post("/", (req, res) => {
  const { code, discountValue } = req.body;
  if (!code || discountValue === undefined) {
    return res.status(400).json({ success: false, message: "Code and discountValue are required" });
  }

  const id = "cp-" + Math.random().toString(36).substring(2, 9);
  const newCoupon = {
    id,
    code: code.toUpperCase().trim(),
    discountType: req.body.discountType || "percent",
    discountValue: Number(discountValue),
    minSpend: req.body.minSpend ? Number(req.body.minSpend) : 3000,
    expiresAt: req.body.expiresAt || "2026-12-31",
    usageLimit: req.body.usageLimit ? Number(req.body.usageLimit) : 500,
    usedCount: 0,
    active: true,
  };

  db.addItem("coupons", newCoupon);
  res.status(201).json({ success: true, data: newCoupon });
});

// POST /api/coupons/validate (Used by website checkout to apply discount)
router.post("/validate", (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: "Coupon code is required" });
  }

  const coupons = db.getCollection("coupons");
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

  if (!coupon) {
    return res.status(404).json({ success: false, message: "Invalid coupon code. Try PLAYZONE10." });
  }

  if (!coupon.active) {
    return res.status(400).json({ success: false, message: "This coupon is currently inactive." });
  }

  const currentSubtotal = Number(subtotal) || 0;
  if (currentSubtotal < coupon.minSpend) {
    return res.status(400).json({
      success: false,
      message: `Minimum order spend of ৳${coupon.minSpend.toLocaleString()} required for this coupon.`,
    });
  }

  let calculatedDiscount = 0;
  if (coupon.discountType === "percent") {
    calculatedDiscount = Math.round((currentSubtotal * coupon.discountValue) / 100);
  } else {
    calculatedDiscount = Math.min(currentSubtotal, coupon.discountValue);
  }

  res.json({
    success: true,
    message: `Coupon "${coupon.code}" applied successfully!`,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      calculatedDiscount,
    },
  });
});

// PATCH /api/coupons/:id/toggle
router.patch("/:id/toggle", (req, res) => {
  const { id } = req.params;
  const current = db.getItem("coupons", id);
  if (!current) {
    return res.status(404).json({ success: false, message: "Coupon not found" });
  }

  const updated = db.updateItem("coupons", id, { active: !current.active });
  res.json({ success: true, data: updated });
});

// DELETE /api/coupons/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteItem("coupons", id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Coupon not found" });
  }
  res.json({ success: true, message: "Coupon deleted" });
});

module.exports = router;
