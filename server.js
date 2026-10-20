require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Route imports
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const preOrdersRouter = require("./routes/preOrders");
const expertsRouter = require("./routes/experts");
const expertBookingsRouter = require("./routes/expertBookings");
const bannersRouter = require("./routes/banners");
const couponsRouter = require("./routes/coupons");
const blogsRouter = require("./routes/blogs");
const reviewsRouter = require("./routes/reviews");
const videoTestimonialsRouter = require("./routes/videoTestimonials");
const settingsRouter = require("./routes/settings");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

const db = require("./data/database");

// API Root & Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "PLAYZONE Cricket Store & Operations API",
    database: {
      type: "MongoDB Atlas",
      connected: db.isConnected(),
      database: "playzone",
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "🏏 PLAYZONE REST API Server Online",
    version: "1.0.0",
    docs: {
      products: "/api/products",
      orders: "/api/orders",
      preOrders: "/api/pre-orders",
      experts: "/api/experts",
      expertBookings: "/api/expert-bookings",
      banners: "/api/banners",
      coupons: "/api/coupons",
      blogs: "/api/blogs",
      reviews: "/api/reviews",
      videoTestimonials: "/api/video-testimonials",
      settings: "/api/settings",
    },
  });
});

// Mount Routes
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/pre-orders", preOrdersRouter);
app.use("/api/experts", expertsRouter);
app.use("/api/expert-bookings", expertBookingsRouter);
app.use("/api/banners", bannersRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/video-testimonials", videoTestimonialsRouter);
app.use("/api/settings", settingsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🏏 PLAYZONE Express API Server`);
  console.log(`🚀 Running at: http://localhost:${PORT}`);
  console.log(`🌐 Ready for Website & Dashboard Connections`);
  console.log(`===============================================`);
});
