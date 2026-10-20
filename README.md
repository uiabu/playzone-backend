# PLAYZONE Express.js Backend API

REST API server connecting **PLAYZONE Cricket Equipment Store Website** (`playzone-website`) and **PLAYZONE Operations Admin Dashboard** (`playzone-dashboard`).

---

## 🚀 Server Overview

- **Port**: `5000` (`http://localhost:5000`)
- **Technologies**: Node.js, Express.js, CORS, Morgan, File-based atomic JSON storage (`data/store.json`).
- **Features**: Real-time CRUD operations, order placement, custom pre-orders, coach & expert bookings, dynamic coupon validation, and settings sync.

---

## 📡 API Endpoints

### 1. Products (`/api/products`)
- `GET /api/products` — Retrieve products (supports query parameters: `search`, `category`, `brand`, `inStock`).
- `GET /api/products/:idOrSlug` — Get single product by ID or slug.
- `POST /api/products` — Create new product.
- `PUT /api/products/:id` — Update existing product.
- `PATCH /api/products/:id/stock` — Inline adjust stock quantity and availability.
- `DELETE /api/products/:id` — Remove product from catalog.

### 2. Orders (`/api/orders`)
- `GET /api/orders` — List customer orders (supports `status`, `paymentStatus`, `search`).
- `GET /api/orders/:id` — Get full order details.
- `POST /api/orders` — Create new customer order (called from website checkout or manual dashboard entry). Automatically reduces product stock!
- `PATCH /api/orders/:id/status` — Update order delivery status (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`).
- `PATCH /api/orders/:id/payment` — Update payment status (`paid`, `unpaid`).
- `DELETE /api/orders/:id` — Delete order record.

### 3. Custom Pre-Orders (`/api/pre-orders`)
- `GET /api/pre-orders` — List custom import requests (supports `status`, `search`).
- `GET /api/pre-orders/:id` — Get single pre-order details.
- `POST /api/pre-orders` — Submit custom bat/gear import request (called from website `/pre-order` page).
- `PATCH /api/pre-orders/:id/quote` — Assign quoted price (৳), advance deposit, and arrival ETA.
- `PATCH /api/pre-orders/:id/status` — Update stage (`new`, `reviewing`, `quoted`, `deposit_paid`, `sourced`, `in_transit`, `delivered`).
- `DELETE /api/pre-orders/:id` — Delete pre-order.

### 4. Hire Cricket Experts (`/api/experts` & `/api/expert-bookings`)
- `GET /api/experts` — List coaches, sidearm throwdown specialists, analysts (supports `category`, `location`, `verified`).
- `GET /api/experts/:id` — Get expert profile.
- `POST /api/experts` — Register new expert.
- `PUT /api/experts/:id` — Update profile and hourly rates.
- `DELETE /api/experts/:id` — Remove expert.
- `GET /api/expert-bookings` — List all client booking requests.
- `POST /api/expert-bookings` — Submit session booking request (called from website expert booking modal).
- `PATCH /api/expert-bookings/:id/status` — Update session booking status (`pending`, `confirmed`, `completed`, `cancelled`).

### 5. Deals, Banners & Coupons (`/api/banners` & `/api/coupons`)
- `GET /api/banners` — List website banners.
- `PATCH /api/banners/:id/toggle` — Toggle banner active/hidden.
- `GET /api/coupons` — List discount promo codes.
- `POST /api/coupons` — Create new promo code.
- `POST /api/coupons/validate` — Validate coupon and calculate discount against order subtotal (called from website cart).
- `PATCH /api/coupons/:id/toggle` — Toggle coupon active status.
- `DELETE /api/coupons/:id` — Delete coupon.

### 6. Blog & Advice (`/api/blogs`)
- `GET /api/blogs` — List cricket equipment articles (supports `publishedOnly=true`).
- `GET /api/blogs/:slug` — Read full article.
- `POST /api/blogs` — Publish new article.
- `PUT /api/blogs/:id` — Edit article.
- `PATCH /api/blogs/:id/publish` — Toggle draft / live publish.
- `DELETE /api/blogs/:id` — Delete article.

### 7. Reviews & Endorsements (`/api/reviews` & `/api/video-testimonials`)
- `GET /api/reviews` — List reviews (supports `approvedOnly=true`).
- `POST /api/reviews` — Submit customer product review.
- `PATCH /api/reviews/:id/status` — Approve, pend, or reject review.
- `GET /api/video-testimonials` — National cricketer video endorsements (Tamim Iqbal, Taskin Ahmed, Mehidy Hasan Miraz).
- `PATCH /api/video-testimonials/:id/toggle` — Feature/hide on homepage.

### 8. Store Settings (`/api/settings`)
- `GET /api/settings` — Read brand addresses, delivery charges, and announcement bar text.
- `PUT /api/settings` — Save store configuration.
- `POST /api/settings/reset` — Factory reset database to initial seed data.

---

## 🏃 Running the Server

```bash
cd "/run/media/shamim-ahsan/New Volume/Special/Self Projects/Playzone Website/playzone-backend"

# Start server
npm start

# Or with automatic reload during development
npm run dev
```
Server runs on **http://localhost:5000**.
