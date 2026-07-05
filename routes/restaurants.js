const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  const restaurants = db
    .prepare("SELECT * FROM restaurants WHERE active = 1")
    .all();

  const menuStmt = db.prepare(
    "SELECT id, name, description, price FROM menu_items WHERE restaurant_id = ? AND available = 1"
  );

  const withMenus = restaurants.map((r) => ({
    ...r,
    menu: menuStmt.all(r.id),
  }));

  res.json(withMenus);
});

router.get("/:id", (req, res) => {
  const restaurant = db
    .prepare("SELECT * FROM restaurants WHERE id = ?")
    .get(req.params.id);

  if (!restaurant) return res.status(404).json({ error: "Restoran pa jwenn" });

  const menu = db
    .prepare("SELECT id, name, description, price FROM menu_items WHERE restaurant_id = ? AND available = 1")
    .all(restaurant.id);

  res.json({ ...restaurant, menu });
});

module.exports = router;
