const express = require("express");
const router = express.Router();
const db = require("../data/database");

// GET /api/pre-orders
router.get("/", (req, res) => {
  let preOrders = db.getCollection("preOrders");
  const { status, search } = req.query;

  if (status && status !== "all") {
    preOrders = preOrders.filter((p) => p.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    preOrders = preOrders.filter(
      (p) =>
        p.refNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.customerPhone.toLowerCase().includes(q) ||
        p.productInfo.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: preOrders.length,
    data: preOrders,
  });
});

// GET /api/pre-orders/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const item = db.getItem("preOrders", id);

  if (!item) {
    return res.status(404).json({ success: false, message: "Pre-order not found" });
  }

  res.json({ success: true, data: item });
});

// POST /api/pre-orders (Submitted from /pre-order page or dashboard)
router.post("/", (req, res) => {
  const { customerName, customerPhone, productInfo } = req.body;

  if (!customerName || !customerPhone || !productInfo) {
    return res.status(400).json({
      success: false,
      message: "Customer name, phone, and product information are required",
    });
  }

  const id = "pre-" + Math.random().toString(36).substring(2, 9);
  const refNum = "PRE-2026-" + Math.floor(100 + Math.random() * 900);

  const newPreOrder = {
    id,
    refNumber: req.body.refNumber || refNum,
    customerName,
    customerPhone,
    customerEmail: req.body.customerEmail || "",
    deliveryAddress: req.body.deliveryAddress || "",
    productInfo,
    referenceUrl: req.body.referenceUrl || undefined,
    attachedImageUrl: req.body.attachedImageUrl || undefined,
    isOtpVerified: req.body.isOtpVerified !== undefined ? req.body.isOtpVerified : true,
    quotedPrice: req.body.quotedPrice ? Number(req.body.quotedPrice) : undefined,
    depositAmount: req.body.depositAmount ? Number(req.body.depositAmount) : 0,
    estimatedDeliveryDate: req.body.estimatedDeliveryDate || undefined,
    status: req.body.status || "new",
    adminNotes: req.body.adminNotes || "Received from PLAYZONE pre-order portal.",
    createdAt: new Date().toISOString(),
  };

  db.addItem("preOrders", newPreOrder);

  res.status(201).json({
    success: true,
    message: `Pre-order request #${newPreOrder.refNumber} submitted successfully!`,
    data: newPreOrder,
  });
});

// PATCH /api/pre-orders/:id/quote
router.patch("/:id/quote", (req, res) => {
  const { id } = req.params;
  const { quotedPrice, depositAmount, estimatedDeliveryDate, adminNotes } = req.body;

  const updates = {};
  if (quotedPrice !== undefined) updates.quotedPrice = Number(quotedPrice);
  if (depositAmount !== undefined) updates.depositAmount = Number(depositAmount);
  if (estimatedDeliveryDate !== undefined) updates.estimatedDeliveryDate = estimatedDeliveryDate;
  if (adminNotes !== undefined) updates.adminNotes = adminNotes;
  updates.status = "quoted";

  const updated = db.updateItem("preOrders", id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Pre-order not found" });
  }

  res.json({ success: true, data: updated });
});

// PATCH /api/pre-orders/:id/status
router.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required" });
  }

  const updates = { status };
  if (adminNotes) updates.adminNotes = adminNotes;

  const updated = db.updateItem("preOrders", id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Pre-order not found" });
  }

  res.json({ success: true, data: updated });
});

// DELETE /api/pre-orders/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteItem("preOrders", id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Pre-order not found" });
  }

  res.json({ success: true, message: "Pre-order deleted" });
});

module.exports = router;
