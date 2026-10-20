const express = require("express");
const router = express.Router();
const db = require("../data/database");

// GET /api/orders
router.get("/", (req, res) => {
  let orders = db.getCollection("orders");
  const { status, paymentStatus, search } = req.query;

  if (status && status !== "all") {
    orders = orders.filter((o) => o.status === status);
  }

  if (paymentStatus && paymentStatus !== "all") {
    orders = orders.filter((o) => o.paymentStatus === paymentStatus);
  }

  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// GET /api/orders/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const order = db.getItem("orders", id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, data: order });
});

// POST /api/orders (Creates new order from website checkout or dashboard)
router.post("/", (req, res) => {
  const { customerName, customerPhone, items } = req.body;

  if (!customerName || !customerPhone || !items || !items.length) {
    return res.status(400).json({
      success: false,
      message: "Customer name, phone, and at least one item are required",
    });
  }

  const id = "ord-" + Math.random().toString(36).substring(2, 9);
  const num = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `PZ-2026-${num}`;

  const subtotal = req.body.subtotal || items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);
  const deliveryFee = req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : 80;
  const discount = req.body.discount !== undefined ? Number(req.body.discount) : 0;
  const totalAmount = req.body.totalAmount !== undefined ? Number(req.body.totalAmount) : Math.max(0, subtotal + deliveryFee - discount);

  const newOrder = {
    id,
    orderNumber,
    customerName,
    customerPhone,
    customerEmail: req.body.customerEmail || "",
    shippingAddress: req.body.shippingAddress || "Dhaka, Bangladesh",
    city: req.body.city || "Dhaka",
    items: items.map((it) => ({
      productId: it.productId || it.id || "item",
      productName: it.productName || it.name || "Cricket Equipment",
      productImage: it.productImage || it.image || "/images/products/bats/sg_bat.png",
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
      selectedSize: it.selectedSize || undefined,
      selectedWeight: it.selectedWeight || undefined,
      selectedServices: it.selectedServices || undefined,
    })),
    subtotal,
    deliveryFee,
    discount,
    totalAmount,
    paymentMethod: req.body.paymentMethod || "cod",
    paymentStatus: req.body.paymentStatus || "unpaid",
    status: req.body.status || "pending",
    notes: req.body.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addItem("orders", newOrder);

  // Automatically adjust stock count for ordered items
  newOrder.items.forEach((item) => {
    const product = db.getItem("products", item.productId);
    if (product) {
      const nextStock = Math.max(0, product.stockCount - item.quantity);
      db.updateItem("products", item.productId, {
        stockCount: nextStock,
        inStock: nextStock > 0,
      });
    }
  });

  res.status(201).json({
    success: true,
    message: `Order #${newOrder.orderNumber} placed successfully!`,
    data: newOrder,
  });
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required" });
  }

  const updated = db.updateItem("orders", id, { status });
  if (!updated) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, data: updated });
});

// PATCH /api/orders/:id/payment
router.patch("/:id/payment", (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  if (!paymentStatus) {
    return res.status(400).json({ success: false, message: "paymentStatus is required" });
  }

  const updated = db.updateItem("orders", id, { paymentStatus });
  if (!updated) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, data: updated });
});

// DELETE /api/orders/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteItem("orders", id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, message: "Order deleted" });
});

module.exports = router;
