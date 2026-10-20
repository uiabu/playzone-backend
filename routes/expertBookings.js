const express = require("express");
const router = express.Router();
const db = require("../data/database");

// GET /api/expert-bookings
router.get("/", (req, res) => {
  const bookings = db.getCollection("expertBookings");
  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// POST /api/expert-bookings (Client books from website)
router.post("/", (req, res) => {
  const { expertId, customerName, customerPhone, date, timeSlot } = req.body;

  if (!expertId || !customerName || !customerPhone || !date) {
    return res.status(400).json({
      success: false,
      message: "expertId, customerName, customerPhone, and date are required",
    });
  }

  const expert = db.getItem("experts", expertId);
  const id = "bk-" + Math.floor(100 + Math.random() * 900);

  const newBooking = {
    id,
    expertId,
    expertName: expert ? expert.name : req.body.expertName || "Cricket Expert",
    customerName,
    customerPhone,
    customerEmail: req.body.customerEmail || "",
    date,
    timeSlot: timeSlot || "Morning Session",
    serviceMode: req.body.serviceMode || "ground",
    locationDetails: req.body.locationDetails || "Dhaka Mirpur Nets",
    notes: req.body.notes || "",
    totalFee: req.body.totalFee || (expert ? expert.price : 2000),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  db.addItem("expertBookings", newBooking);

  res.status(201).json({
    success: true,
    message: "Booking request submitted! Our team will confirm the slot.",
    data: newBooking,
  });
});

// PATCH /api/expert-bookings/:id/status
router.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required" });
  }

  const updated = db.updateItem("expertBookings", id, { status });
  if (!updated) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  res.json({ success: true, data: updated });
});

module.exports = router;
