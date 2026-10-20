require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const seedData = require("./seedData");

const DATA_FILE = path.join(__dirname, "store.json");
const MONGODB_URI = process.env.MONGODB_URI;

const ARRAY_COLLECTIONS = [
  "products",
  "orders",
  "preOrders",
  "experts",
  "expertBookings",
  "banners",
  "coupons",
  "blogs",
  "reviews",
  "videoTestimonials",
];

// In-memory cache
let database = null;

function initializeDatabase() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      database = JSON.parse(raw);
      console.log("📦 Loaded initial cache from store.json");
      return;
    } catch (err) {
      console.error("⚠️ Failed to read store.json, falling back to seed data:", err);
    }
  }

  // Fallback / initial seeding
  database = {
    products: seedData.INITIAL_PRODUCTS,
    orders: seedData.INITIAL_ORDERS,
    preOrders: seedData.INITIAL_PRE_ORDERS,
    experts: seedData.INITIAL_EXPERTS,
    expertBookings: seedData.INITIAL_EXPERT_BOOKINGS,
    banners: seedData.INITIAL_BANNERS,
    coupons: seedData.INITIAL_COUPONS,
    blogs: seedData.INITIAL_BLOG_POSTS,
    reviews: seedData.INITIAL_REVIEWS,
    videoTestimonials: seedData.INITIAL_VIDEO_TESTIMONIALS,
    settings: seedData.INITIAL_SETTINGS,
  };

  saveDatabaseSync();
  console.log("🌱 Database seeded and saved to store.json");
}

function saveDatabaseSync() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(database, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Failed to write store.json:", err);
  }
}

// 1. Initialize local cache immediately
initializeDatabase();

// 2. Connect to MongoDB Atlas & sync
async function syncFromMongo() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const db = mongoose.connection.db;

    for (const col of ARRAY_COLLECTIONS) {
      const docs = await db.collection(col).find({}).toArray();
      if (docs && docs.length > 0) {
        // Strip mongo's internal _id when caching in-memory to prevent conflicts
        database[col] = docs.map(({ _id, ...rest }) => rest);
      } else if (database[col] && database[col].length > 0) {
        // If MongoDB collection is empty, seed it with our current data
        await db.collection(col).insertMany(database[col].map((item) => ({ ...item })));
        console.log(`🌱 Seeded MongoDB collection [${col}] with ${database[col].length} items`);
      }
    }

    // Sync settings
    const settingDoc = await db.collection("settings").findOne();
    if (settingDoc) {
      const { _id, ...cleanSettings } = settingDoc;
      database.settings = cleanSettings;
    } else if (database.settings) {
      await db.collection("settings").insertOne({ ...database.settings });
      console.log("🌱 Seeded MongoDB collection [settings]");
    }

    saveDatabaseSync();
    console.log("☁️  MongoDB Atlas: Synchronized all collections to memory & store.json");
  } catch (err) {
    console.error("⚠️ Failed to sync from MongoDB Atlas:", err.message);
  }
}

async function connectMongo() {
  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI not provided. Running in file-only mode.");
    return;
  }
  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log(" Connected to MongoDB Atlas [playzone]");
    await syncFromMongo();
  } catch (err) {
    console.error("❌ MongoDB Atlas connection error:", err.message);
  }
}

connectMongo();

// Query & Mutation API
function getCollection(name) {
  return database[name] || [];
}

function getItem(collectionName, id) {
  const list = getCollection(collectionName);
  return list.find((item) => item.id === id);
}

function addItem(collectionName, item) {
  if (!database[collectionName]) {
    database[collectionName] = [];
  }
  database[collectionName].unshift(item);
  saveDatabaseSync();

  // Async persist to MongoDB Atlas
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.db
      .collection(collectionName)
      .insertOne({ ...item })
      .catch((err) => console.error(`❌ Mongo insert error in ${collectionName}:`, err.message));
  }

  return item;
}

function updateItem(collectionName, id, updates) {
  const list = getCollection(collectionName);
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updatedItem = {
    ...database[collectionName][index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  database[collectionName][index] = updatedItem;

  saveDatabaseSync();

  // Async persist to MongoDB Atlas
  if (mongoose.connection.readyState === 1) {
    const { _id, ...cleanUpdates } = updatedItem;
    mongoose.connection.db
      .collection(collectionName)
      .updateOne({ id: id }, { $set: cleanUpdates }, { upsert: true })
      .catch((err) => console.error(`❌ Mongo update error in ${collectionName}:`, err.message));
  }

  return updatedItem;
}

function deleteItem(collectionName, id) {
  const list = getCollection(collectionName);
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return false;

  database[collectionName].splice(index, 1);
  saveDatabaseSync();

  // Async persist to MongoDB Atlas
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.db
      .collection(collectionName)
      .deleteOne({ id: id })
      .catch((err) => console.error(`❌ Mongo delete error in ${collectionName}:`, err.message));
  }

  return true;
}

function getSettings() {
  return database.settings;
}

function updateSettings(updates) {
  database.settings = { ...database.settings, ...updates };
  saveDatabaseSync();

  // Async persist to MongoDB Atlas
  if (mongoose.connection.readyState === 1) {
    const { _id, ...cleanSettings } = database.settings;
    mongoose.connection.db
      .collection("settings")
      .updateOne({}, { $set: cleanSettings }, { upsert: true })
      .catch((err) => console.error("❌ Mongo update error in settings:", err.message));
  }

  return database.settings;
}

function resetToDefaults() {
  database = {
    products: seedData.INITIAL_PRODUCTS,
    orders: seedData.INITIAL_ORDERS,
    preOrders: seedData.INITIAL_PRE_ORDERS,
    experts: seedData.INITIAL_EXPERTS,
    expertBookings: seedData.INITIAL_EXPERT_BOOKINGS,
    banners: seedData.INITIAL_BANNERS,
    coupons: seedData.INITIAL_COUPONS,
    blogs: seedData.INITIAL_BLOG_POSTS,
    reviews: seedData.INITIAL_REVIEWS,
    videoTestimonials: seedData.INITIAL_VIDEO_TESTIMONIALS,
    settings: seedData.INITIAL_SETTINGS,
  };
  saveDatabaseSync();

  // Async reset in MongoDB Atlas
  if (mongoose.connection.readyState === 1) {
    (async () => {
      try {
        const db = mongoose.connection.db;
        for (const col of ARRAY_COLLECTIONS) {
          await db.collection(col).deleteMany({});
          if (database[col] && database[col].length > 0) {
            await db.collection(col).insertMany(database[col].map((item) => ({ ...item })));
          }
        }
        await db.collection("settings").deleteMany({});
        await db.collection("settings").insertOne({ ...database.settings });
        console.log("🌱 MongoDB Atlas: Reset to defaults successfully");
      } catch (err) {
        console.error("❌ Mongo resetToDefaults error:", err.message);
      }
    })();
  }

  return database;
}

function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  getCollection,
  getItem,
  addItem,
  updateItem,
  deleteItem,
  getSettings,
  updateSettings,
  resetToDefaults,
  isConnected,
  syncFromMongo,
};
