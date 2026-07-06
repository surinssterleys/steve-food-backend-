const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "..", "data", "stevefood.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tag TEXT,
  cover TEXT,
  rating REAL DEFAULT 4.5,
  time_estimate TEXT DEFAULT '10-18 min',
  fee INTEGER DEFAULT 75,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  available INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id),
  customer_name TEXT,
  customer_phone TEXT,
  address TEXT,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  payment_confirmed INTEGER DEFAULT 0,
  subtotal INTEGER NOT NULL,
  fee INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'konfime',
  driver_id INTEGER REFERENCES drivers(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id),
  menu_item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL
);
`);

module.exports = db;

// AUTO-SEED — si baz done a vid, mete done depa yo otomatikman
const restaurantCount = db.prepare("SELECT COUNT(*) as n FROM restaurants").get().n;
if (restaurantCount === 0) {
  console.log("📦 Baz done vid — n ap seed li otomatikman...");
  require("./seed");
}
